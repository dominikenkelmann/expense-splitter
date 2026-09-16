import { Expense, type SplitAllocation } from '@domain/entities/Expense';
import { Money } from '@domain/value-objects/Money';
import { NotFoundError, ValidationError } from '@domain/errors/DomainError';
import type { IGroupRepository } from '@domain/ports/IGroupRepository';
import type { AddExpenseRequest, AddExpenseResponse } from './AddExpenseDTO';

export class AddExpenseUseCase {
  constructor(private readonly groupRepository: IGroupRepository) {}

  async execute(request: AddExpenseRequest): Promise<AddExpenseResponse> {
    // 1. Retrieve the existing group aggregate
    const group = await this.groupRepository.getById(request.groupId);
    if (!group) {
      throw new NotFoundError(`Expense group with ID "${request.groupId}" not found`);
    }

    // 2. Validate payer existence in group
    if (!group.hasParticipant(request.payerId)) {
      throw new ValidationError('Payer must be a participant in the group');
    }

    // Step 9: Validate [Expense Description] (AF 7.1)
    const trimmedDescription = request.description?.trim() ?? '';
    if (trimmedDescription.length < 1 || trimmedDescription.length > 100) {
      throw new ValidationError('Expense description must be between 1 and 100 characters');
    }

    // Step 10: Validate [Amount in Cents] (AF 7.2)
    if (!Number.isInteger(request.amountInCents) || request.amountInCents <= 0) {
      throw new ValidationError('Expense amount must be greater than zero');
    }

    let allocations: SplitAllocation[] = [];

    // Step 6 & 11: Split method handling
    if (request.splitMode === 'EQUAL') {
      // Step 11: Validate at least 1 participant selected (AF 7.3)
      if (!request.splitParticipantIds || request.splitParticipantIds.length === 0) {
        throw new ValidationError('At least one participant must be included in the split');
      }

      // Check all selected participants belong to group
      for (const participantId of request.splitParticipantIds) {
        if (!group.hasParticipant(participantId)) {
          throw new ValidationError(`Participant "${participantId}" does not belong to the group`);
        }
      }

      // Step 12: Remainder cent deterministic distribution
      const participantCount = request.splitParticipantIds.length;
      const baseShare = Math.floor(request.amountInCents / participantCount);
      const remainderCents = request.amountInCents % participantCount;

      allocations = request.splitParticipantIds.map((participantId, index) => {
        const extraCent = index < remainderCents ? 1 : 0;
        return {
          participantId,
          share: Money.fromCents(baseShare + extraCent),
        };
      });
    } else if (request.splitMode === 'CUSTOM') {
      // AF 7.4 & AF 7.5: Custom split handling
      if (!request.customSplits || request.customSplits.length === 0) {
        throw new ValidationError('At least one custom allocation must be provided');
      }

      let totalCustomSum = 0;
      for (const customSplit of request.customSplits) {
        if (!group.hasParticipant(customSplit.participantId)) {
          throw new ValidationError(
            `Participant "${customSplit.participantId}" does not belong to the group`
          );
        }
        if (!Number.isInteger(customSplit.shareInCents) || customSplit.shareInCents < 0) {
          throw new ValidationError('Custom share amounts must be non-negative integers in cents');
        }
        totalCustomSum += customSplit.shareInCents;
      }

      // AF 7.5: Custom split sum mismatch check
      if (totalCustomSum !== request.amountInCents) {
        throw new ValidationError('Sum of custom shares must equal the total expense amount');
      }

      allocations = request.customSplits.map((customSplit) => ({
        participantId: customSplit.participantId,
        share: Money.fromCents(customSplit.shareInCents),
      }));
    } else {
      throw new ValidationError(`Unsupported split mode "${request.splitMode}"`);
    }

    // Step 13: Create Expense entity
    const expenseId = crypto.randomUUID();
    const now = new Date();
    const expense = new Expense({
      id: expenseId,
      description: trimmedDescription,
      amount: Money.fromCents(request.amountInCents),
      payerId: request.payerId,
      splitMode: request.splitMode,
      allocations,
      createdAt: now,
    });

    // Step 14, 15, 16: Append to ledger, update group state and persist
    const updatedGroup = group.addExpense(expense);
    await this.groupRepository.save(updatedGroup);

    // Step 17: Return created expense response
    return {
      expenseId: expense.id,
      groupId: group.id,
      description: expense.description,
      amountInCents: expense.amount.getCents(),
      payerId: expense.payerId,
      splitMode: expense.splitMode,
      allocations: expense.allocations.map((a) => ({
        participantId: a.participantId,
        shareInCents: a.share.getCents(),
      })),
      createdAt: expense.createdAt,
    };
  }
}
