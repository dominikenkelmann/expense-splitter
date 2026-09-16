import { Group } from '@domain/entities/Group';
import { Participant } from '@domain/entities/Participant';
import { ValidationError } from '@domain/errors/DomainError';
import type { IGroupRepository } from '@domain/ports/IGroupRepository';
import type { CreateGroupRequest, CreateGroupResponse } from './CreateGroupDTO';

export class CreateGroupUseCase {
  constructor(private readonly groupRepository: IGroupRepository) {}

  async execute(request: CreateGroupRequest): Promise<CreateGroupResponse> {
    // Step 4: Validate [Group Name] (AF 7.1)
    const trimmedGroupName = request.name?.trim() ?? '';
    if (trimmedGroupName.length < 1 || trimmedGroupName.length > 50) {
      throw new ValidationError('Group name must be between 1 and 50 characters');
    }

    // Step 5: Validate participant count >= 2 (AF 7.2)
    if (!request.participantNames || request.participantNames.length < 2) {
      throw new ValidationError('At least 2 participants are required to create a group');
    }

    // Step 6 & 7: Validate each participant name and uniqueness (AF 7.3 & AF 7.4)
    const seenNames = new Set<string>();
    const sanitizedNames: string[] = [];

    for (const rawName of request.participantNames) {
      const trimmedParticipantName = rawName?.trim() ?? '';

      // Step 7 (AF 7.4): Invalid participant name length
      if (trimmedParticipantName.length < 1 || trimmedParticipantName.length > 50) {
        throw new ValidationError('Participant name must be between 1 and 50 characters');
      }

      // Step 6 (AF 7.3): Duplicate participant name check (case-insensitive)
      const normalizedKey = trimmedParticipantName.toLowerCase();
      if (seenNames.has(normalizedKey)) {
        throw new ValidationError('Participant names must be unique within the group');
      }
      seenNames.add(normalizedKey);
      sanitizedNames.push(trimmedParticipantName);
    }

    // Step 8: Generate unique identifier for Expense Group
    const groupId = crypto.randomUUID();

    // Step 9: Generate unique identifier for each Participant
    const participants = sanitizedNames.map(
      (name) =>
        new Participant({
          id: crypto.randomUUID(),
          name,
        })
    );

    // Step 10: Create Expense Group entity
    const now = new Date();
    const group = new Group({
      id: groupId,
      name: trimmedGroupName,
      currency: request.currency?.trim() || 'EUR',
      participants,
      expenses: [],
      createdAt: now,
      updatedAt: now,
    });

    // Step 11: Persist Expense Group to storage seam
    await this.groupRepository.save(group);
    await this.groupRepository.setCurrentGroupId(group.id);

    // Step 12: Return created group response
    return {
      groupId: group.id,
      name: group.name,
      currency: group.currency,
      participants: group.participants.map((p) => ({
        id: p.id,
        name: p.name,
      })),
      createdAt: group.createdAt,
    };
  }
}
