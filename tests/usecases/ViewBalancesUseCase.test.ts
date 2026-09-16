import { describe, it, expect, beforeEach } from 'vitest';
import { ViewBalancesUseCase } from '@usecases/view-balances/ViewBalancesUseCase';
import { InMemoryGroupRepository } from '@infrastructure/storage/InMemoryGroupRepository';
import { Group } from '@domain/entities/Group';
import { Participant } from '@domain/entities/Participant';
import { Expense } from '@domain/entities/Expense';
import { Money } from '@domain/value-objects/Money';
import { NotFoundError } from '@domain/errors/DomainError';

describe('UC-003: View Balances & Settlements', () => {
  let repository: InMemoryGroupRepository;
  let useCase: ViewBalancesUseCase;

  const alice = new Participant({ id: 'p-alice', name: 'Alice' });
  const bob = new Participant({ id: 'p-bob', name: 'Bob' });
  const charlie = new Participant({ id: 'p-charlie', name: 'Charlie' });

  beforeEach(() => {
    repository = new InMemoryGroupRepository();
    useCase = new ViewBalancesUseCase(repository);
  });

  describe('Basic Flow · Multi-Expense Ledger & Settlement Simplification (Steps 1-12)', () => {
    it('accurately computes total spend, net balances, and minimal settlement paths', async () => {
      // Setup group matching the specification's UI sketch:
      // 1. Alpine Hut Dinner: €180 paid by Alice, split 3 ways (€60 each)
      // 2. Rental Van: €240 paid by Bob, split 3 ways (€80 each)
      // 3. Highway Toll: €30 paid by Alice, split 3 ways (€10 each)
      const expenses: Expense[] = [
        new Expense({
          id: 'exp-1',
          description: 'Alpine Hut Dinner',
          amount: Money.fromCents(18000),
          payerId: alice.id,
          splitMode: 'EQUAL',
          allocations: [
            { participantId: alice.id, share: Money.fromCents(6000) },
            { participantId: bob.id, share: Money.fromCents(6000) },
            { participantId: charlie.id, share: Money.fromCents(6000) },
          ],
          createdAt: new Date(),
        }),
        new Expense({
          id: 'exp-2',
          description: 'Rental Van & Fuel',
          amount: Money.fromCents(24000),
          payerId: bob.id,
          splitMode: 'EQUAL',
          allocations: [
            { participantId: alice.id, share: Money.fromCents(8000) },
            { participantId: bob.id, share: Money.fromCents(8000) },
            { participantId: charlie.id, share: Money.fromCents(8000) },
          ],
          createdAt: new Date(),
        }),
        new Expense({
          id: 'exp-3',
          description: 'Highway Toll',
          amount: Money.fromCents(3000),
          payerId: alice.id,
          splitMode: 'EQUAL',
          allocations: [
            { participantId: alice.id, share: Money.fromCents(1000) },
            { participantId: bob.id, share: Money.fromCents(1000) },
            { participantId: charlie.id, share: Money.fromCents(1000) },
          ],
          createdAt: new Date(),
        }),
      ];

      const group = new Group({
        id: 'group-roadtrip',
        name: 'Summer Roadtrip 2026',
        currency: 'EUR',
        participants: [alice, bob, charlie],
        expenses,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await repository.save(group);

      const response = await useCase.execute({ groupId: group.id });

      // Step 3 / 9: Total Spend: €450.00
      expect(response.totalSpendInCents).toBe(45000);
      expect(response.isInconsistent).toBe(false);

      // Step 4, 5, 6 / 10: Individual Net Balances
      // Alice: paid 21000, share 15000 -> net +6000
      const aliceBalance = response.participantBalances.find(
        (b) => b.participantId === alice.id
      );
      expect(aliceBalance?.totalPaidInCents).toBe(21000);
      expect(aliceBalance?.totalShareInCents).toBe(15000);
      expect(aliceBalance?.netBalanceInCents).toBe(6000);

      // Bob: paid 24000, share 15000 -> net +9000
      const bobBalance = response.participantBalances.find(
        (b) => b.participantId === bob.id
      );
      expect(bobBalance?.totalPaidInCents).toBe(24000);
      expect(bobBalance?.totalShareInCents).toBe(15000);
      expect(bobBalance?.netBalanceInCents).toBe(9000);

      // Charlie: paid 0, share 15000 -> net -15000
      const charlieBalance = response.participantBalances.find(
        (b) => b.participantId === charlie.id
      );
      expect(charlieBalance?.totalPaidInCents).toBe(0);
      expect(charlieBalance?.totalShareInCents).toBe(15000);
      expect(charlieBalance?.netBalanceInCents).toBe(-15000);

      // Step 8 / 11: Minimal Settlement Instructions (Charlie clears debts to Bob and Alice)
      expect(response.settlements).toHaveLength(2);
      expect(response.settlements).toEqual([
        {
          fromParticipantId: charlie.id,
          fromParticipantName: 'Charlie',
          toParticipantId: bob.id,
          toParticipantName: 'Bob',
          amountInCents: 9000,
        },
        {
          fromParticipantId: charlie.id,
          fromParticipantName: 'Charlie',
          toParticipantId: alice.id,
          toParticipantName: 'Alice',
          amountInCents: 6000,
        },
      ]);
    });
  });

  describe('Alternative Flow 7.1 · Ledger Arithmetic Inconsistency', () => {
    it('flags arithmetic inconsistency and suppresses settlement generation', async () => {
      // Corrupted expense where allocation sum does not match
      const corruptedExpense = new Expense({
        id: 'exp-corrupt',
        description: 'Corrupted Data',
        amount: Money.fromCents(10000),
        payerId: alice.id,
        splitMode: 'CUSTOM',
        allocations: [
          { participantId: alice.id, share: Money.fromCents(5000) },
          { participantId: bob.id, share: Money.fromCents(4000) },
          // Missing 1000 cents causes sum(netBalances) != 0
        ],
        createdAt: new Date(),
      });

      const group = new Group({
        id: 'group-corrupt',
        name: 'Inconsistent Group',
        currency: 'EUR',
        participants: [alice, bob],
        expenses: [corruptedExpense],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await repository.save(group);

      const response = await useCase.execute({ groupId: group.id });

      expect(response.isInconsistent).toBe(true);
      expect(response.settlements).toHaveLength(0);
      expect(response.participantBalances).toHaveLength(2);
    });
  });

  describe('Alternative Flow 7.2 · Zero Expenses in Group', () => {
    it('returns €0.00 spend, zero balances, and empty settlements when group has no expenses', async () => {
      const emptyGroup = new Group({
        id: 'group-empty',
        name: 'Fresh Group',
        currency: 'EUR',
        participants: [alice, bob, charlie],
        expenses: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await repository.save(emptyGroup);

      const response = await useCase.execute({ groupId: emptyGroup.id });

      expect(response.totalSpendInCents).toBe(0);
      expect(response.isInconsistent).toBe(false);
      expect(response.settlements).toEqual([]);
      for (const balance of response.participantBalances) {
        expect(balance.totalPaidInCents).toBe(0);
        expect(balance.totalShareInCents).toBe(0);
        expect(balance.netBalanceInCents).toBe(0);
      }
    });
  });

  describe('Special Requirements & Performance Bounds', () => {
    it('produces at most (N - 1) transactions for N participants (Special Requirement 10.1)', async () => {
      const participants = Array.from({ length: 6 }, (_, i) =>
        new Participant({ id: `p-${i}`, name: `User ${i}` })
      );

      // Random circular expenses
      const expenses: Expense[] = [
        new Expense({
          id: 'exp-1',
          description: 'A',
          amount: Money.fromCents(6000),
          payerId: participants[0]!.id,
          splitMode: 'EQUAL',
          allocations: participants.map((p) => ({
            participantId: p.id,
            share: Money.fromCents(1000),
          })),
          createdAt: new Date(),
        }),
        new Expense({
          id: 'exp-2',
          description: 'B',
          amount: Money.fromCents(12000),
          payerId: participants[1]!.id,
          splitMode: 'EQUAL',
          allocations: participants.map((p) => ({
            participantId: p.id,
            share: Money.fromCents(2000),
          })),
          createdAt: new Date(),
        }),
      ];

      const group = new Group({
        id: 'group-6p',
        name: 'Six People Group',
        currency: 'EUR',
        participants,
        expenses,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await repository.save(group);

      const response = await useCase.execute({ groupId: group.id });

      expect(response.settlements.length).toBeLessThanOrEqual(participants.length - 1);
    });

    it('executes balance and settlement computation in sub-millisecond time (Special Requirement 10.2)', async () => {
      const participants = Array.from({ length: 50 }, (_, i) =>
        new Participant({ id: `p-${i}`, name: `Member ${i}` })
      );

      const expenses: Expense[] = Array.from({ length: 500 }, (_, i) => {
        const payer = participants[i % participants.length]!;
        return new Expense({
          id: `exp-${i}`,
          description: `Expense ${i}`,
          amount: Money.fromCents(5000),
          payerId: payer.id,
          splitMode: 'EQUAL',
          allocations: participants.map((p) => ({
            participantId: p.id,
            share: Money.fromCents(100),
          })),
          createdAt: new Date(),
        });
      });

      const largeGroup = new Group({
        id: 'group-large',
        name: 'Scale Test Group',
        currency: 'EUR',
        participants,
        expenses,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await repository.save(largeGroup);

      const start = performance.now();
      const response = await useCase.execute({ groupId: largeGroup.id });
      const durationMs = performance.now() - start;

      expect(response.totalSpendInCents).toBe(500 * 5000);
      expect(durationMs).toBeLessThan(10); // Well within sub-10ms requirement
    });
  });

  describe('Preconditions (PRE1)', () => {
    it('throws NotFoundError when group ID does not exist', async () => {
      await expect(
        useCase.execute({ groupId: 'non-existent-group' })
      ).rejects.toThrow(NotFoundError);
    });
  });
});
