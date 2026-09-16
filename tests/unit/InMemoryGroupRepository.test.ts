import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryGroupRepository } from '../../src/infrastructure/storage/InMemoryGroupRepository';
import { Group } from '../../src/domain/entities/Group';

describe('InMemoryGroupRepository Adapter', () => {
  let repo: InMemoryGroupRepository;

  beforeEach(() => {
    repo = new InMemoryGroupRepository();
  });

  it('should save and retrieve a group by id', async () => {
    const group = new Group({
      id: 'grp-1',
      name: 'Test Group',
      currency: 'EUR',
      participants: [],
      expenses: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await repo.save(group);
    const retrieved = await repo.getById('grp-1');

    expect(retrieved).not.toBeNull();
    expect(retrieved?.id).toBe('grp-1');
    expect(retrieved?.name).toBe('Test Group');
  });

  it('should track and update current active group id', async () => {
    expect(await repo.getCurrentGroupId()).toBeNull();
    await repo.setCurrentGroupId('grp-1');
    expect(await repo.getCurrentGroupId()).toBe('grp-1');
  });
});
