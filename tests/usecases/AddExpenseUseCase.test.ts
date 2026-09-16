import { describe, it, expect, beforeEach } from 'vitest';
import { AddExpenseUseCase } from '@usecases/add-expense/AddExpenseUseCase';
import { InMemoryGroupRepository } from '@infrastructure/storage/InMemoryGroupRepository';
import { Group } from '@domain/entities/Group';
import { Participant } from '@domain/entities/Participant';
import { NotFoundError, ValidationError } from '@domain/errors/DomainError';

describe('UC-002: Add Expense', () => {
  let repository: InMemoryGroupRepository;
  let useCase: AddExpenseUseCase;
  let sampleGroup: Group;
  const aliceId = 'p-alice';
  const bobId = 'p-bob';
  const charlieId = 'p-charlie';

  beforeEach(async () => {
    repository = new InMemoryGroupRepository();
    useCase = new AddExpenseUseCase(repository);

    sampleGroup = new Group({
      id: 'group-roadtrip',
      name: 'Summer Roadtrip 2026',
      currency: 'EUR',
      participants: [
        new Participant({ id: aliceId, name: 'Alice' }),
        new Participant({ id: bobId, name: 'Bob' }),
        new Participant({ id: charlieId, name: 'Charlie' }),
      ],
      expenses: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await repository.save(sampleGroup);
  });

  describe('Basic Flow · Equal Split (Steps 1-18)', () => {
    it('records an expense equally split across all group members and persists to storage', async () => {
      const response = await useCase.execute({
        groupId: sampleGroup.id,
        description: 'Alpine Hut Dinner & Drinks',
        amountInCents: 18000,
        payerId: aliceId,
        splitMode: 'EQUAL',
        splitParticipantIds: [aliceId, bobId, charlieId],
      });

      expect(response.expenseId).toBeDefined();
      expect(response.description).toBe('Alpine Hut Dinner & Drinks');
      expect(response.amountInCents).toBe(18000);
      expect(response.payerId).toBe(aliceId);
      expect(response.splitMode).toBe('EQUAL');
      expect(response.allocations).toHaveLength(3);
      expect(response.allocations).toEqual([
        { participantId: aliceId, shareInCents: 6000 },
        { participantId: bobId, shareInCents: 6000 },
        { participantId: charlieId, shareInCents: 6000 },
      ]);

      // Verify persistence (POST1)
      const persisted = await repository.getById(sampleGroup.id);
      expect(persisted?.expenses).toHaveLength(1);
      expect(persisted?.expenses[0]?.description).toBe('Alpine Hut Dinner & Drinks');
    });

    it('distributes remainder cents deterministically to initial participants (Special Requirement 10.1)', async () => {
      // €10.00 (1000 cents) split 3 ways => 334, 333, 333 cents
      const response = await useCase.execute({
        groupId: sampleGroup.id,
        description: 'Snacks',
        amountInCents: 1000,
        payerId: bobId,
        splitMode: 'EQUAL',
        splitParticipantIds: [aliceId, bobId, charlieId],
      });

      expect(response.allocations[0]?.shareInCents).toBe(334);
      expect(response.allocations[1]?.shareInCents).toBe(333);
      expect(response.allocations[2]?.shareInCents).toBe(333);

      const sum = response.allocations.reduce((acc, curr) => acc + curr.shareInCents, 0);
      expect(sum).toBe(1000);
    });

    it('splits expense equally across a subset of participants', async () => {
      const response = await useCase.execute({
        groupId: sampleGroup.id,
        description: 'Museum Tickets for Alice & Bob',
        amountInCents: 5000,
        payerId: aliceId,
        splitMode: 'EQUAL',
        splitParticipantIds: [aliceId, bobId],
      });

      expect(response.allocations).toHaveLength(2);
      expect(response.allocations).toEqual([
        { participantId: aliceId, shareInCents: 2500 },
        { participantId: bobId, shareInCents: 2500 },
      ]);
    });
  });

  describe('Alternative Flow 7.1 · Invalid Expense Description', () => {
    it('rejects blank expense description', async () => {
      await expect(
        useCase.execute({
          groupId: sampleGroup.id,
          description: '   ',
          amountInCents: 1000,
          payerId: aliceId,
          splitMode: 'EQUAL',
          splitParticipantIds: [aliceId, bobId],
        })
      ).rejects.toThrow(new ValidationError('Expense description must be between 1 and 100 characters'));
    });

    it('rejects expense description exceeding 100 characters', async () => {
      const longDesc = 'D'.repeat(101);
      await expect(
        useCase.execute({
          groupId: sampleGroup.id,
          description: longDesc,
          amountInCents: 1000,
          payerId: aliceId,
          splitMode: 'EQUAL',
          splitParticipantIds: [aliceId, bobId],
        })
      ).rejects.toThrow(new ValidationError('Expense description must be between 1 and 100 characters'));
    });
  });

  describe('Alternative Flow 7.2 · Invalid Expense Amount', () => {
    it('rejects zero amount', async () => {
      await expect(
        useCase.execute({
          groupId: sampleGroup.id,
          description: 'Free item',
          amountInCents: 0,
          payerId: aliceId,
          splitMode: 'EQUAL',
          splitParticipantIds: [aliceId, bobId],
        })
      ).rejects.toThrow(new ValidationError('Expense amount must be greater than zero'));
    });

    it('rejects negative amount', async () => {
      await expect(
        useCase.execute({
          groupId: sampleGroup.id,
          description: 'Refund',
          amountInCents: -500,
          payerId: aliceId,
          splitMode: 'EQUAL',
          splitParticipantIds: [aliceId, bobId],
        })
      ).rejects.toThrow(new ValidationError('Expense amount must be greater than zero'));
    });

    it('rejects non-integer decimal amount in cents', async () => {
      await expect(
        useCase.execute({
          groupId: sampleGroup.id,
          description: 'Decimal Cents',
          amountInCents: 12.34,
          payerId: aliceId,
          splitMode: 'EQUAL',
          splitParticipantIds: [aliceId, bobId],
        })
      ).rejects.toThrow(new ValidationError('Expense amount must be greater than zero'));
    });
  });

  describe('Alternative Flow 7.3 · No Participants Selected in Equal Split', () => {
    it('rejects equal split when split roster is empty', async () => {
      await expect(
        useCase.execute({
          groupId: sampleGroup.id,
          description: 'Nobody participating',
          amountInCents: 1000,
          payerId: aliceId,
          splitMode: 'EQUAL',
          splitParticipantIds: [],
        })
      ).rejects.toThrow(
        new ValidationError('At least one participant must be included in the split')
      );
    });
  });

  describe('Alternative Flow 7.4 & 7.5 · Custom Split Mode', () => {
    it('records an expense with custom share allocations when sum matches total', async () => {
      const response = await useCase.execute({
        groupId: sampleGroup.id,
        description: 'Custom Dinner',
        amountInCents: 18000,
        payerId: aliceId,
        splitMode: 'CUSTOM',
        customSplits: [
          { participantId: aliceId, shareInCents: 8000 },
          { participantId: bobId, shareInCents: 6000 },
          { participantId: charlieId, shareInCents: 4000 },
        ],
      });

      expect(response.splitMode).toBe('CUSTOM');
      expect(response.allocations).toEqual([
        { participantId: aliceId, shareInCents: 8000 },
        { participantId: bobId, shareInCents: 6000 },
        { participantId: charlieId, shareInCents: 4000 },
      ]);
    });

    it('rejects custom split when sum of shares does not equal total amount (AF 7.5)', async () => {
      await expect(
        useCase.execute({
          groupId: sampleGroup.id,
          description: 'Mismatch Custom Split',
          amountInCents: 18000,
          payerId: aliceId,
          splitMode: 'CUSTOM',
          customSplits: [
            { participantId: aliceId, shareInCents: 8000 },
            { participantId: bobId, shareInCents: 6000 },
            { participantId: charlieId, shareInCents: 3000 }, // sum is 17000 != 18000
          ],
        })
      ).rejects.toThrow(
        new ValidationError('Sum of custom shares must equal the total expense amount')
      );
    });

    it('rejects custom split with negative share values', async () => {
      await expect(
        useCase.execute({
          groupId: sampleGroup.id,
          description: 'Negative Share',
          amountInCents: 5000,
          payerId: aliceId,
          splitMode: 'CUSTOM',
          customSplits: [
            { participantId: aliceId, shareInCents: 6000 },
            { participantId: bobId, shareInCents: -1000 },
          ],
        })
      ).rejects.toThrow(
        new ValidationError('Custom share amounts must be non-negative integers in cents')
      );
    });
  });

  describe('Preconditions & Aggregate Invariant Guards', () => {
    it('throws NotFoundError when group does not exist (PRE1)', async () => {
      await expect(
        useCase.execute({
          groupId: 'non-existent-group',
          description: 'Coffee',
          amountInCents: 500,
          payerId: aliceId,
          splitMode: 'EQUAL',
          splitParticipantIds: [aliceId],
        })
      ).rejects.toThrow(NotFoundError);
    });

    it('rejects expense when payer is not a group member', async () => {
      await expect(
        useCase.execute({
          groupId: sampleGroup.id,
          description: 'Coffee',
          amountInCents: 500,
          payerId: 'stranger-id',
          splitMode: 'EQUAL',
          splitParticipantIds: [aliceId],
        })
      ).rejects.toThrow(new ValidationError('Payer must be a participant in the group'));
    });

    it('rejects expense when a split participant is not a group member', async () => {
      await expect(
        useCase.execute({
          groupId: sampleGroup.id,
          description: 'Coffee',
          amountInCents: 500,
          payerId: aliceId,
          splitMode: 'EQUAL',
          splitParticipantIds: [aliceId, 'stranger-id'],
        })
      ).rejects.toThrow(
        new ValidationError('Participant "stranger-id" does not belong to the group')
      );
    });
  });

  describe('Failure Postconditions (POST3)', () => {
    it('guarantees ledger remains unmodified if validation fails', async () => {
      await expect(
        useCase.execute({
          groupId: sampleGroup.id,
          description: '',
          amountInCents: 1000,
          payerId: aliceId,
          splitMode: 'EQUAL',
          splitParticipantIds: [aliceId, bobId],
        })
      ).rejects.toThrow(ValidationError);

      const persisted = await repository.getById(sampleGroup.id);
      expect(persisted?.expenses).toHaveLength(0);
    });
  });
});
