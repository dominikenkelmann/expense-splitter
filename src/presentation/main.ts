import { InMemoryGroupRepository } from '../infrastructure/storage/InMemoryGroupRepository';
import { CreateGroupUseCase } from '../usecases/create-group/CreateGroupUseCase';
import { AddExpenseUseCase } from '../usecases/add-expense/AddExpenseUseCase';
import { ViewBalancesUseCase } from '../usecases/view-balances/ViewBalancesUseCase';
import { Group } from '../domain/entities/Group';
import { Participant } from '../domain/entities/Participant';
import { Expense } from '../domain/entities/Expense';
import { Money } from '../domain/value-objects/Money';
import type { SplitMode } from '../domain/entities/Expense';

// Storage keys
const STORAGE_KEY_GROUPS = 'fairsplit_groups_v1';
const STORAGE_KEY_ACTIVE_ID = 'fairsplit_active_group_id';

class LocalPersistedGroupRepository extends InMemoryGroupRepository {
  constructor() {
    super();
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_GROUPS);
      const activeId = localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
      if (raw) {
        const parsed = JSON.parse(raw);
        for (const item of parsed) {
          const participants = item.participants.map(
            (p: { id: string; name: string }) => new Participant({ id: p.id, name: p.name })
          );
          const expenses = item.expenses.map(
            (e: {
              id: string;
              description: string;
              amount: { cents: number };
              payerId: string;
              splitMode: SplitMode;
              allocations: { participantId: string; share: { cents: number } }[];
              createdAt: string;
            }) =>
              new Expense({
                id: e.id,
                description: e.description,
                amount: Money.fromCents(e.amount.cents || (e.amount as any).amountInCents || 0),
                payerId: e.payerId,
                splitMode: e.splitMode,
                allocations: e.allocations.map((a) => ({
                  participantId: a.participantId,
                  share: Money.fromCents(a.share.cents || (a.share as any).amountInCents || 0),
                })),
                createdAt: new Date(e.createdAt),
              })
          );

          const group = new Group({
            id: item.id,
            name: item.name,
            currency: item.currency,
            participants,
            expenses,
            createdAt: new Date(item.createdAt),
            updatedAt: new Date(item.updatedAt),
          });
          this.save(group);
        }
      }
      if (activeId) {
        this.setCurrentGroupId(activeId);
      }
    } catch (err) {
      console.error('Failed to load from local storage', err);
    }
  }

  private persist(): void {
    try {
      // In-memory groups
      const allGroups: any[] = [];
      // We can access the private property or get via currentGroupId
      // Since TypeScript compiles to JS, we serialize current state
      // @ts-ignore
      for (const [id, group] of this.groups.entries()) {
        allGroups.push(group);
      }
      localStorage.setItem(STORAGE_KEY_GROUPS, JSON.stringify(allGroups));
      // @ts-ignore
      if (this.currentGroupId) {
        // @ts-ignore
        localStorage.setItem(STORAGE_KEY_ACTIVE_ID, this.currentGroupId);
      } else {
        localStorage.removeItem(STORAGE_KEY_ACTIVE_ID);
      }
    } catch (err) {
      console.error('Failed to persist to local storage', err);
    }
  }

  async save(group: Group): Promise<void> {
    await super.save(group);
    this.persist();
  }

  async setCurrentGroupId(groupId: string): Promise<void> {
    await super.setCurrentGroupId(groupId);
    this.persist();
  }
}

// Global App State
const repository = new LocalPersistedGroupRepository();
const createGroupUseCase = new CreateGroupUseCase(repository);
const addExpenseUseCase = new AddExpenseUseCase(repository);
const viewBalancesUseCase = new ViewBalancesUseCase(repository);

let currentGroupId: string | null = null;
let currentGroup: Group | null = null;
let currentSplitMode: 'EQUAL' | 'CUSTOM' = 'EQUAL';
const pendingParticipants: string[] = ['Alice', 'Bob', 'Charlie'];

// DOM Elements
const viewCreateGroup = document.getElementById('view-create-group')!;
const viewDashboard = document.getElementById('view-dashboard')!;
const activeGroupBadge = document.getElementById('active-group-badge')!;
const headerGroupName = document.getElementById('header-group-name')!;
const btnSwitchGroup = document.getElementById('btn-switch-group')!;

// Group Creation Form Elements
const formCreateGroup = document.getElementById('form-create-group') as HTMLFormElement;
const inputGroupName = document.getElementById('input-group-name') as HTMLInputElement;
const selectCurrency = document.getElementById('select-currency') as HTMLSelectElement;
const inputParticipantName = document.getElementById('input-participant-name') as HTMLInputElement;
const btnAddParticipant = document.getElementById('btn-add-participant') as HTMLButtonElement;
const participantChips = document.getElementById('participant-chips')!;

// Dashboard Elements
const statTotalSpend = document.getElementById('stat-total-spend')!;
const statExpenseCount = document.getElementById('stat-expense-count')!;
const statParticipantCount = document.getElementById('stat-participant-count')!;
const statSettlementCount = document.getElementById('stat-settlement-count')!;
const statParticipantsPreview = document.getElementById('stat-participants-preview')!;

const formAddExpense = document.getElementById('form-add-expense') as HTMLFormElement;
const inputExpenseDesc = document.getElementById('input-expense-desc') as HTMLInputElement;
const inputExpenseAmount = document.getElementById('input-expense-amount') as HTMLInputElement;
const selectPayer = document.getElementById('select-payer') as HTMLSelectElement;
const btnSplitEqual = document.getElementById('btn-split-equal') as HTMLButtonElement;
const btnSplitCustom = document.getElementById('btn-split-custom') as HTMLButtonElement;
const splitEqualContainer = document.getElementById('split-equal-container')!;
const splitCustomContainer = document.getElementById('split-custom-container')!;
const splitValidationMsg = document.getElementById('split-validation-msg')!;

const expenseLedgerList = document.getElementById('expense-ledger-list')!;
const balancesList = document.getElementById('balances-list')!;
const settlementsList = document.getElementById('settlements-list')!;
const toastContainer = document.getElementById('toast-container')!;

// Helpers
function showToast(message: string, type: 'success' | 'error' = 'success'): void {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 4000);
}

function formatCurrency(cents: number, currency: string): string {
  const symbolMap: Record<string, string> = {
    EUR: '€',
    USD: '$',
    GBP: '£',
    CHF: 'CHF ',
  };
  const symbol = symbolMap[currency] || `${currency} `;
  const isNegative = cents < 0;
  const absCents = Math.abs(cents);
  const formatted = (absCents / 100).toFixed(2);
  return `${isNegative ? '-' : ''}${symbol}${formatted}`;
}

// Render Participant Chips during creation
function renderParticipantChips(): void {
  participantChips.innerHTML = '';
  pendingParticipants.forEach((name, index) => {
    const chip = document.createElement('div');
    chip.className = 'chip';
    chip.innerHTML = `
      <span>${escapeHtml(name)}</span>
      <span class="chip-remove" data-index="${index}" title="Remove">×</span>
    `;
    participantChips.appendChild(chip);
  });

  const removeBtns = participantChips.querySelectorAll('.chip-remove');
  removeBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const idx = Number((e.target as HTMLElement).getAttribute('data-index'));
      pendingParticipants.splice(idx, 1);
      renderParticipantChips();
    });
  });
}

function escapeHtml(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Add participant chip handler
function handleAddParticipant(): void {
  const name = inputParticipantName.value.trim();
  if (!name) return;
  if (pendingParticipants.some((p) => p.toLowerCase() === name.toLowerCase())) {
    showToast('Participant name already added', 'error');
    return;
  }
  pendingParticipants.push(name);
  inputParticipantName.value = '';
  renderParticipantChips();
  inputParticipantName.focus();
}

btnAddParticipant.addEventListener('click', handleAddParticipant);
inputParticipantName.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    handleAddParticipant();
  }
});

// Switch group handler
btnSwitchGroup.addEventListener('click', () => {
  currentGroupId = null;
  currentGroup = null;
  viewDashboard.classList.add('hidden');
  activeGroupBadge.classList.add('hidden');
  viewCreateGroup.classList.remove('hidden');
});

// Group Creation Submit
formCreateGroup.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = inputGroupName.value.trim();
  const currency = selectCurrency.value;

  if (pendingParticipants.length < 2) {
    showToast('Please add at least 2 participants', 'error');
    return;
  }

  try {
    const result = await createGroupUseCase.execute({
      name,
      currency,
      participantNames: [...pendingParticipants],
    });

    currentGroupId = result.groupId;
    await repository.setCurrentGroupId(currentGroupId);
    showToast(`Group "${result.name}" created successfully!`, 'success');
    await loadGroupDashboard(currentGroupId);
  } catch (err: any) {
    showToast(err.message || 'Failed to create group', 'error');
  }
});

// Split mode toggle
btnSplitEqual.addEventListener('click', () => {
  currentSplitMode = 'EQUAL';
  btnSplitEqual.classList.add('active');
  btnSplitCustom.classList.remove('active');
  splitEqualContainer.classList.remove('hidden');
  splitCustomContainer.classList.add('hidden');
  splitValidationMsg.classList.add('hidden');
});

btnSplitCustom.addEventListener('click', () => {
  currentSplitMode = 'CUSTOM';
  btnSplitCustom.classList.add('active');
  btnSplitEqual.classList.remove('active');
  splitEqualContainer.classList.add('hidden');
  splitCustomContainer.classList.remove('hidden');
  updateCustomSplitValidation();
});

function updateCustomSplitValidation(): void {
  if (currentSplitMode !== 'CUSTOM' || !currentGroup) return;
  const totalEntered = parseFloat(inputExpenseAmount.value) || 0;
  const totalCents = Math.round(totalEntered * 100);

  let allocatedCents = 0;
  const customInputs = splitCustomContainer.querySelectorAll<HTMLInputElement>('.custom-split-input');
  customInputs.forEach((input) => {
    const val = parseFloat(input.value) || 0;
    allocatedCents += Math.round(val * 100);
  });

  const diff = totalCents - allocatedCents;
  if (diff === 0 && totalCents > 0) {
    splitValidationMsg.className = 'validation-msg';
    splitValidationMsg.textContent = '✓ Split amounts match total';
    splitValidationMsg.classList.remove('hidden');
  } else if (totalCents > 0) {
    splitValidationMsg.className = 'validation-msg error';
    splitValidationMsg.textContent = `Remaining to allocate: ${formatCurrency(diff, currentGroup.currency)}`;
    splitValidationMsg.classList.remove('hidden');
  } else {
    splitValidationMsg.classList.add('hidden');
  }
}

// Add Expense Submit
formAddExpense.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentGroupId || !currentGroup) return;

  const description = inputExpenseDesc.value.trim();
  const amountVal = parseFloat(inputExpenseAmount.value);
  const amountInCents = Math.round(amountVal * 100);
  const payerId = selectPayer.value;

  if (isNaN(amountVal) || amountInCents <= 0) {
    showToast('Please enter a valid expense amount', 'error');
    return;
  }

  try {
    if (currentSplitMode === 'EQUAL') {
      const checkedBoxes = splitEqualContainer.querySelectorAll<HTMLInputElement>(
        'input[type="checkbox"]:checked'
      );
      const splitParticipantIds = Array.from(checkedBoxes).map((cb) => cb.value);

      if (splitParticipantIds.length === 0) {
        showToast('Select at least one participant to split with', 'error');
        return;
      }

      await addExpenseUseCase.execute({
        groupId: currentGroupId,
        description,
        amountInCents,
        payerId,
        splitMode: 'EQUAL',
        splitParticipantIds,
      });
    } else {
      const customInputs = splitCustomContainer.querySelectorAll<HTMLInputElement>('.custom-split-input');
      const customSplits = Array.from(customInputs).map((input) => ({
        participantId: input.getAttribute('data-participant-id')!,
        shareInCents: Math.round((parseFloat(input.value) || 0) * 100),
      }));

      await addExpenseUseCase.execute({
        groupId: currentGroupId,
        description,
        amountInCents,
        payerId,
        splitMode: 'CUSTOM',
        customSplits,
      });
    }

    showToast(`Recorded expense "${description}"`, 'success');
    formAddExpense.reset();
    inputExpenseAmount.value = '';
    // Reset participant equal checkboxes to checked
    splitEqualContainer
      .querySelectorAll<HTMLInputElement>('input[type="checkbox"]')
      .forEach((cb) => (cb.checked = true));
    // Reset custom inputs
    splitCustomContainer
      .querySelectorAll<HTMLInputElement>('.custom-split-input')
      .forEach((inp) => (inp.value = ''));
    splitValidationMsg.classList.add('hidden');

    await refreshDashboard();
  } catch (err: any) {
    showToast(err.message || 'Failed to record expense', 'error');
  }
});

// Load Group Dashboard
async function loadGroupDashboard(groupId: string): Promise<void> {
  const group = await repository.getById(groupId);
  if (!group) {
    showToast('Group not found', 'error');
    return;
  }
  currentGroup = group;
  currentGroupId = group.id;

  // Header update
  headerGroupName.textContent = group.name;
  activeGroupBadge.classList.remove('hidden');

  // Update Currency Labels
  const symbolMap: Record<string, string> = { EUR: '€', USD: '$', GBP: '£', CHF: 'CHF' };
  document.querySelectorAll('.currency-symbol').forEach((el) => {
    el.textContent = symbolMap[group.currency] || group.currency;
  });

  // Populate Payer Select
  selectPayer.innerHTML = '';
  group.participants.forEach((p) => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = p.name;
    selectPayer.appendChild(opt);
  });

  // Populate Equal Split Checkboxes
  splitEqualContainer.innerHTML = '';
  group.participants.forEach((p) => {
    const label = document.createElement('label');
    label.className = 'split-checkbox-item';
    label.innerHTML = `
      <span>${escapeHtml(p.name)}</span>
      <input type="checkbox" value="${p.id}" checked />
    `;
    splitEqualContainer.appendChild(label);
  });

  // Populate Custom Split Inputs
  splitCustomContainer.innerHTML = '';
  group.participants.forEach((p) => {
    const row = document.createElement('div');
    row.className = 'split-custom-row';
    row.innerHTML = `
      <span>${escapeHtml(p.name)}</span>
      <input type="number" step="0.01" min="0" placeholder="0.00" class="custom-split-input" data-participant-id="${p.id}" />
    `;
    splitCustomContainer.appendChild(row);
  });

  splitCustomContainer.querySelectorAll('.custom-split-input').forEach((input) => {
    input.addEventListener('input', updateCustomSplitValidation);
  });
  inputExpenseAmount.addEventListener('input', updateCustomSplitValidation);

  // Switch views
  viewCreateGroup.classList.add('hidden');
  viewDashboard.classList.remove('hidden');

  await refreshDashboard();
}

async function refreshDashboard(): Promise<void> {
  if (!currentGroupId) return;
  const group = await repository.getById(currentGroupId);
  if (!group) return;
  currentGroup = group;

  const balancesRes = await viewBalancesUseCase.execute({ groupId: currentGroupId });

  // Update Stat Cards
  statTotalSpend.textContent = formatCurrency(balancesRes.totalSpendInCents, balancesRes.currency);
  statExpenseCount.textContent = `${group.expenses.length} recorded ${group.expenses.length === 1 ? 'expense' : 'expenses'}`;
  statParticipantCount.textContent = String(group.participants.length);
  statParticipantsPreview.textContent = group.participants.map((p) => p.name).join(', ');
  statSettlementCount.textContent = String(balancesRes.settlements.length);

  // Render Balances
  balancesList.innerHTML = '';
  balancesRes.participantBalances.forEach((pb) => {
    const item = document.createElement('div');
    const isPositive = pb.netBalanceInCents > 0;
    const isNegative = pb.netBalanceInCents < 0;
    const balanceClass = isPositive ? 'balance-creditor' : isNegative ? 'balance-debtor' : 'balance-settled';

    item.className = `balance-item ${balanceClass}`;
    item.innerHTML = `
      <div>
        <div class="balance-name">${escapeHtml(pb.participantName)}</div>
        <div class="balance-meta">Paid: ${formatCurrency(pb.totalPaidInCents, balancesRes.currency)} • Share: ${formatCurrency(pb.totalShareInCents, balancesRes.currency)}</div>
      </div>
      <div class="balance-amount">${formatCurrency(pb.netBalanceInCents, balancesRes.currency)}</div>
    `;
    balancesList.appendChild(item);
  });

  // Render Settlements
  settlementsList.innerHTML = '';
  if (balancesRes.settlements.length === 0) {
    settlementsList.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">🤝</span>
        <p>All group balances are settled! No payments required.</p>
      </div>
    `;
  } else {
    balancesRes.settlements.forEach((s) => {
      const card = document.createElement('div');
      card.className = 'settlement-card';
      card.innerHTML = `
        <div class="settlement-flow">
          <span class="settlement-payer">${escapeHtml(s.fromParticipantName)}</span>
          <span class="settlement-arrow">→ pays →</span>
          <span class="settlement-receiver">${escapeHtml(s.toParticipantName)}</span>
        </div>
        <div class="settlement-amount">${formatCurrency(s.amountInCents, balancesRes.currency)}</div>
      `;
      settlementsList.appendChild(card);
    });
  }

  // Render Expense Ledger
  expenseLedgerList.innerHTML = '';
  if (group.expenses.length === 0) {
    expenseLedgerList.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">🧾</span>
        <p>No expenses recorded yet.</p>
      </div>
    `;
  } else {
    // Reverse to show latest first
    const reversed = [...group.expenses].reverse();
    reversed.forEach((exp) => {
      const payer = group.participants.find((p) => p.id === exp.payerId)?.name || 'Unknown';
      const item = document.createElement('div');
      item.className = 'expense-item';
      item.innerHTML = `
        <div class="expense-main">
          <span class="expense-desc">${escapeHtml(exp.description)}</span>
          <span class="expense-meta">Paid by <strong>${escapeHtml(payer)}</strong> • ${exp.splitMode === 'EQUAL' ? 'Equal Share' : 'Custom Split'} • ${new Date(exp.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div class="expense-amount-badge">${formatCurrency(exp.amount.getCents(), group.currency)}</div>
      `;
      expenseLedgerList.appendChild(item);
    });
  }
}

// Initial Bootstrapping
async function bootstrap(): Promise<void> {
  renderParticipantChips();
  const savedActiveId = await repository.getCurrentGroupId();
  if (savedActiveId) {
    const group = await repository.getById(savedActiveId);
    if (group) {
      await loadGroupDashboard(savedActiveId);
    }
  }
}

bootstrap();
