import { describe, it, expect, beforeEach } from 'vitest';
import { CreateGroupUseCase } from '@usecases/create-group/CreateGroupUseCase';
import { InMemoryGroupRepository } from '@infrastructure/storage/InMemoryGroupRepository';
import { ValidationError } from '@domain/errors/DomainError';

describe('UC-001: Create Expense Group', () => {
  let repository: InMemoryGroupRepository;
  let useCase: CreateGroupUseCase;

  beforeEach(() => {
    repository = new InMemoryGroupRepository();
    useCase = new CreateGroupUseCase(repository);
  });

  describe('Basic Flow · Successful Group Creation', () => {
    it('creates and persists an expense group with unique IDs and initial participants (Steps 1-12)', async () => {
      const response = await useCase.execute({
        name: 'Summer Roadtrip 2026',
        participantNames: ['Alice Enkelmann', 'Bob Miller', 'Charlie Davis'],
      });

      expect(response.groupId).toBeDefined();
      expect(response.name).toBe('Summer Roadtrip 2026');
      expect(response.currency).toBe('EUR');
      expect(response.participants).toHaveLength(3);
      expect(response.participants.map((p) => p.name)).toEqual([
        'Alice Enkelmann',
        'Bob Miller',
        'Charlie Davis',
      ]);
      expect(new Set(response.participants.map((p) => p.id)).size).toBe(3);

      // Verify persistence in repository (POST1)
      const storedGroup = await repository.getById(response.groupId);
      expect(storedGroup).not.toBeNull();
      expect(storedGroup?.name).toBe('Summer Roadtrip 2026');
      expect(storedGroup?.participants).toHaveLength(3);
      expect(storedGroup?.expenses).toHaveLength(0);

      // Verify active session state (POST2)
      const currentGroupId = await repository.getCurrentGroupId();
      expect(currentGroupId).toBe(response.groupId);
    });

    it('supports custom currency selection when specified', async () => {
      const response = await useCase.execute({
        name: 'London Weekend',
        currency: 'GBP',
        participantNames: ['Alice', 'Bob'],
      });

      expect(response.currency).toBe('GBP');
      const storedGroup = await repository.getById(response.groupId);
      expect(storedGroup?.currency).toBe('GBP');
    });

    it('trims leading and trailing whitespace from group and participant names', async () => {
      const response = await useCase.execute({
        name: '  Ski Vacation  ',
        participantNames: ['  Alice  ', '  Bob  '],
      });

      expect(response.name).toBe('Ski Vacation');
      expect(response.participants[0]?.name).toBe('Alice');
      expect(response.participants[1]?.name).toBe('Bob');
    });
  });

  describe('Alternative Flow 7.1 · Invalid Group Name', () => {
    it('rejects empty group name', async () => {
      await expect(
        useCase.execute({
          name: '',
          participantNames: ['Alice', 'Bob'],
        })
      ).rejects.toThrow(new ValidationError('Group name must be between 1 and 50 characters'));
    });

    it('rejects whitespace-only group name', async () => {
      await expect(
        useCase.execute({
          name: '     ',
          participantNames: ['Alice', 'Bob'],
        })
      ).rejects.toThrow(new ValidationError('Group name must be between 1 and 50 characters'));
    });

    it('rejects group name exceeding 50 characters', async () => {
      const longName = 'A'.repeat(51);
      await expect(
        useCase.execute({
          name: longName,
          participantNames: ['Alice', 'Bob'],
        })
      ).rejects.toThrow(new ValidationError('Group name must be between 1 and 50 characters'));
    });
  });

  describe('Alternative Flow 7.2 · Insufficient Participants', () => {
    it('rejects group creation with 0 participants', async () => {
      await expect(
        useCase.execute({
          name: 'Solo Project',
          participantNames: [],
        })
      ).rejects.toThrow(
        new ValidationError('At least 2 participants are required to create a group')
      );
    });

    it('rejects group creation with only 1 participant', async () => {
      await expect(
        useCase.execute({
          name: 'Solo Trip',
          participantNames: ['Alice'],
        })
      ).rejects.toThrow(
        new ValidationError('At least 2 participants are required to create a group')
      );
    });
  });

  describe('Alternative Flow 7.3 · Duplicate Participant Names', () => {
    it('rejects roster with identical participant names', async () => {
      await expect(
        useCase.execute({
          name: 'Ski Trip',
          participantNames: ['Alice', 'Bob', 'Alice'],
        })
      ).rejects.toThrow(
        new ValidationError('Participant names must be unique within the group')
      );
    });

    it('rejects roster with duplicate names differing only by case and whitespace', async () => {
      await expect(
        useCase.execute({
          name: 'Ski Trip',
          participantNames: ['Alice Enkelmann', 'Bob', '  alice enkelmann  '],
        })
      ).rejects.toThrow(
        new ValidationError('Participant names must be unique within the group')
      );
    });
  });

  describe('Alternative Flow 7.4 · Invalid Participant Name', () => {
    it('rejects participant with empty or whitespace-only name', async () => {
      await expect(
        useCase.execute({
          name: 'Road Trip',
          participantNames: ['Alice', '   '],
        })
      ).rejects.toThrow(
        new ValidationError('Participant name must be between 1 and 50 characters')
      );
    });

    it('rejects participant name exceeding 50 characters', async () => {
      const longParticipantName = 'P'.repeat(51);
      await expect(
        useCase.execute({
          name: 'Road Trip',
          participantNames: ['Alice', longParticipantName],
        })
      ).rejects.toThrow(
        new ValidationError('Participant name must be between 1 and 50 characters')
      );
    });
  });

  describe('Failure Postconditions (POST3)', () => {
    it('ensures no group or session state is persisted when validation fails', async () => {
      await expect(
        useCase.execute({
          name: '',
          participantNames: ['Alice', 'Bob'],
        })
      ).rejects.toThrow(ValidationError);

      const currentGroupId = await repository.getCurrentGroupId();
      expect(currentGroupId).toBeNull();
    });
  });
});
