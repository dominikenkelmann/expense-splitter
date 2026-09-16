import { NotFoundError } from '@domain/errors/DomainError';
import type { IGroupRepository } from '@domain/ports/IGroupRepository';
import type {
  ViewBalancesRequest,
  ViewBalancesResponse,
  ParticipantBalanceDTO,
  SettlementInstructionDTO,
} from './ViewBalancesDTO';

export class ViewBalancesUseCase {
  constructor(private readonly groupRepository: IGroupRepository) {}

  async execute(request: ViewBalancesRequest): Promise<ViewBalancesResponse> {
    // Step 2: Retrieve the Expense Group from storage
    const group = await this.groupRepository.getById(request.groupId);
    if (!group) {
      throw new NotFoundError(`Expense group with ID "${request.groupId}" not found`);
    }

    const participantMap = new Map<string, string>();
    for (const participant of group.participants) {
      participantMap.set(participant.id, participant.name);
    }

    // Step 3: Calculate total group expenditure across all recorded expenses
    const totalSpendInCents = group.expenses.reduce(
      (acc, exp) => acc + exp.amount.getCents(),
      0
    );

    // Step 4 & 5: Calculate total paid and total share incurred per participant
    const paidMap = new Map<string, number>();
    const shareMap = new Map<string, number>();

    for (const participant of group.participants) {
      paidMap.set(participant.id, 0);
      shareMap.set(participant.id, 0);
    }

    for (const expense of group.expenses) {
      const currentPaid = paidMap.get(expense.payerId) ?? 0;
      paidMap.set(expense.payerId, currentPaid + expense.amount.getCents());

      for (const allocation of expense.allocations) {
        const currentShare = shareMap.get(allocation.participantId) ?? 0;
        shareMap.set(
          allocation.participantId,
          currentShare + allocation.share.getCents()
        );
      }
    }

    // Step 6: Calculate Net Balance (totalPaid - totalShare)
    const participantBalances: ParticipantBalanceDTO[] = group.participants.map(
      (participant) => {
        const totalPaidInCents = paidMap.get(participant.id) ?? 0;
        const totalShareInCents = shareMap.get(participant.id) ?? 0;
        const netBalanceInCents = totalPaidInCents - totalShareInCents;

        return {
          participantId: participant.id,
          participantName: participant.name,
          totalPaidInCents,
          totalShareInCents,
          netBalanceInCents,
        };
      }
    );

    // Step 7: Check that the sum of all participant Net Balances equals 0 (AF 7.1)
    const sumNetBalances = participantBalances.reduce(
      (acc, pb) => acc + pb.netBalanceInCents,
      0
    );

    if (sumNetBalances !== 0) {
      // AF 7.1: Ledger Arithmetic Inconsistency detected
      return {
        groupId: group.id,
        groupName: group.name,
        currency: group.currency,
        totalSpendInCents,
        participantBalances,
        settlements: [],
        isInconsistent: true,
      };
    }

    // Step 8: Execute debt simplification algorithm for minimal settlement transfers
    const settlements = this.computeMinimalSettlements(
      participantBalances,
      participantMap
    );

    return {
      groupId: group.id,
      groupName: group.name,
      currency: group.currency,
      totalSpendInCents,
      participantBalances,
      settlements,
      isInconsistent: false,
    };
  }

  /**
   * Greedy Debt Simplification Algorithm
   * Matches maximum debtor with maximum creditor iteratively.
   * Guaranteed to produce at most (N - 1) settlement transfers.
   */
  private computeMinimalSettlements(
    balances: ParticipantBalanceDTO[],
    participantMap: Map<string, string>
  ): SettlementInstructionDTO[] {
    const settlements: SettlementInstructionDTO[] = [];

    // Separate debtors (< 0) and creditors (> 0)
    const debtors: { id: string; amount: number }[] = [];
    const creditors: { id: string; amount: number }[] = [];

    for (const b of balances) {
      if (b.netBalanceInCents < 0) {
        debtors.push({ id: b.participantId, amount: -b.netBalanceInCents });
      } else if (b.netBalanceInCents > 0) {
        creditors.push({ id: b.participantId, amount: b.netBalanceInCents });
      }
    }

    while (debtors.length > 0 && creditors.length > 0) {
      // Sort descending by amount to minimize total transactions
      debtors.sort((a, b) => b.amount - a.amount);
      creditors.sort((a, b) => b.amount - a.amount);

      const debtor = debtors[0]!;
      const creditor = creditors[0]!;

      const transferAmount = Math.min(debtor.amount, creditor.amount);

      settlements.push({
        fromParticipantId: debtor.id,
        fromParticipantName: participantMap.get(debtor.id) ?? debtor.id,
        toParticipantId: creditor.id,
        toParticipantName: participantMap.get(creditor.id) ?? creditor.id,
        amountInCents: transferAmount,
      });

      debtor.amount -= transferAmount;
      creditor.amount -= transferAmount;

      if (debtor.amount === 0) {
        debtors.shift();
      }
      if (creditor.amount === 0) {
        creditors.shift();
      }
    }

    return settlements;
  }
}
