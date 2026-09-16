# 0002: Dual-Adapter Repository for LocalStorage and Testing

We isolate all group persistence behind an asynchronous repository interface (`IGroupRepository`), implemented via a `LocalStorageGroupRepository` for production in-browser storage and an `InMemoryGroupRepository` for sub-millisecond automated testing.

## Status
Accepted

## Context & Rationale
FairSplit requires zero-friction, local-first persistence without forcing account signups or backend servers. Browser `localStorage` is universally supported, requires zero configuration, and easily accommodates thousands of expense records under its 5 MB quota.

By defining an asynchronous interface (`Promise<T>`) at this seam:
1. Automated unit and integration tests run headlessly in memory without browser DOM mocks or storage shims.
2. The persistence layer can be migrated to `IndexedDB` or a cloud-synced backend in the future without changing a single line of domain or use-case code.
