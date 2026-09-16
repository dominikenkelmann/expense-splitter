import type { IGroupRepository } from '../../domain/ports/IGroupRepository';
import type { Group } from '../../domain/entities/Group';

export class InMemoryGroupRepository implements IGroupRepository {
  private groups: Map<string, Group> = new Map();
  private currentGroupId: string | null = null;

  async save(group: Group): Promise<void> {
    this.groups.set(group.id, group);
  }

  async getById(groupId: string): Promise<Group | null> {
    return this.groups.get(groupId) || null;
  }

  async getCurrentGroupId(): Promise<string | null> {
    return this.currentGroupId;
  }

  async setCurrentGroupId(groupId: string): Promise<void> {
    this.currentGroupId = groupId;
  }

  clear(): void {
    this.groups.clear();
    this.currentGroupId = null;
  }
}
