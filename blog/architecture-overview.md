# FairSplit Architecture Overview

> **Status**: Approved  
> **Date**: 16.09.2026  
> **Style**: Clean / Hexagonal Architecture with Pure Domain Core  
> **ADR References**: [ADR-0001](../adr/0001-clean-architecture-with-pure-domain-core.md), [ADR-0002](../adr/0002-dual-adapter-repository-for-localstorage-and-testing.md), [ADR-0003](../adr/0003-integer-cents-for-monetary-representation.md)

---

## 1. System Layer Diagram

FairSplit strictly follows Clean Architecture's **Inward Dependency Rule**: outer layers may depend on inner layers, but inner layers have zero dependencies on outer layers.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Presentation Layer                              │
│         (UI Views, Card Components, Form Controllers, ViewModels)      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ calls
┌───────────────────────────────────▼────────────────────────────────────┐
│                        Application / Use Cases                         │
│           (CreateGroupUseCase, AddExpenseUseCase, GetBalancesUseCase)  │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │ uses                           │ persists via
┌───────────────────▼────────────────┐   ┌───────────▼───────────────────┐
│           Domain Layer             │   │    Infrastructure Adapters    │
│  - Entities: Group, Expense        │   │  (LocalStorageGroupRepository,│
│  - Value Objects: Money, Split     │   │   InMemoryGroupRepository)    │
│  - Engines: SplitCalculator,       │   └───────────────────────────────┘
│             SettlementEngine       │                   ▲
│  - Ports: IGroupRepository         │ ◄─────────────────┘ implements
└────────────────────────────────────┘
```

---

## 2. Directory & Package Structure

```
expense-splitter/
├── docs/
│   ├── adr/                         # Architectural Decision Records (0001..0003)
│   ├── architecture/                # System architecture documentation
│   ├── requirements/                # Actors and high-level use case catalog
│   └── usecases/                    # Formal Use Case specifications (UC-001..UC-003)
├── src/
│   ├── domain/                      # 100% pure TypeScript (zero framework deps)
│   │   ├── entities/                # Group.ts, Expense.ts, Participant.ts
│   │   ├── value-objects/           # Money.ts, SplitAllocation.ts
│   │   ├── engines/                 # SplitCalculator.ts, SettlementEngine.ts
│   │   ├── ports/                   # IGroupRepository.ts
│   │   └── errors/                  # DomainError.ts (e.g. ValidationError)
│   ├── usecases/                    # Application interactors & DTOs
│   │   ├── CreateGroup.ts
│   │   ├── AddExpense.ts
│   │   ├── GetBalancesAndSettlements.ts
│   │   └── dtos/                    # Input / Output boundary payloads
│   ├── infrastructure/              # External adapters satisfying domain ports
│   │   ├── storage/
│   │   │   ├── LocalStorageGroupRepository.ts
│   │   │   └── InMemoryGroupRepository.ts
│   │   └── serialization/           # JSON mappers / DTO serializers
│   └── presentation/                # UI Layer (Vite + TypeScript)
│       ├── components/              # GroupHeader, ExpenseList, SettlementCard
│       ├── state/                   # AppState store / reactive view models
│       └── main.ts                  # Application entry & dependency composition root
└── tests/
    ├── unit/                        # Fast tests for domain engines & Money (no mocks)
    ├── integration/                 # Use case tests using InMemoryGroupRepository
    └── e2e/                         # Playwright end-to-end browser flows
```

---

## 3. Deep Modules & Core Interfaces

### A. The Money Value Object (`src/domain/value-objects/Money.ts`)
Encapsulates integer cent math and currency formatting to ensure arithmetic integrity across the entire application:
```typescript
export class Money {
  private constructor(private readonly cents: number) {}

  static fromCents(cents: number): Money;
  static fromDecimal(amount: number): Money;
  
  getCents(): number;
  add(other: Money): Money;
  subtract(other: Money): Money;
  format(currencySymbol?: string): string; // e.g. "€12.50"
}
```

### B. The Settlement Engine (`src/domain/engines/SettlementEngine.ts`)
A deep module exposing a simple interface for complex graph debt minimization:
```typescript
export interface BalanceSummary {
  participantId: string;
  totalPaid: Money;
  totalIncurred: Money;
  netBalance: Money; // positive = creditor, negative = debtor
}

export interface SettlementTransfer {
  fromParticipantId: string;
  toParticipantId: string;
  amount: Money;
}

export class SettlementEngine {
  static calculateNetBalances(group: Group): BalanceSummary[];
  static simplifyDebts(balances: BalanceSummary[]): SettlementTransfer[];
}
```

### C. The Repository Port (`src/domain/ports/IGroupRepository.ts`)
The clean persistence seam decoupling business logic from browser storage:
```typescript
export interface IGroupRepository {
  save(group: Group): Promise<void>;
  getById(groupId: string): Promise<Group | null>;
  getCurrentGroupId(): Promise<string | null>;
  setCurrentGroupId(groupId: string): Promise<void>;
}
```

---

## 4. Layer Boundary & Dependency Invariants

1. **Pure Domain Core**: Code inside `src/domain/` must **never** import from `src/usecases/`, `src/infrastructure/`, `src/presentation/`, or browser DOM APIs (`window`, `localStorage`, `document`).
2. **Use Case Isolation**: Each use case is a single-purpose class or function that takes a plain DTO input and returns a typed `Result<OutputDTO, DomainError>`.
3. **Composition Root**: Wiring of concrete adapters (`LocalStorageGroupRepository`) to use cases happens exclusively at the entry point (`src/presentation/main.ts`), keeping all other layers decoupled.
