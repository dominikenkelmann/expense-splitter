import type { Group } from '../entities/Group';

export interface IGroupRepository {
  save(group: Group): Promise<void>;
  getById(groupId: string): Promise<Group | null>;
  getCurrentGroupId(): Promise<string | null>;
  setCurrentGroupId(groupId: string): Promise<void>;
}
