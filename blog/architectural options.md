# Architectural Options & Trade-Off Analysis: FairSplit

> **Status**: Approved (Option 1 Selected with LocalStorage/InMemory Adapters)  
> **Date**: 16.09.2026  
> **Context**: Evaluating architectural styles, module depth, seam placement, and data storage strategies prior to formal use case specification.

---

## 1. Context & Architectural Goals

FairSplit is a client-side expense splitting application designed around zero-friction onboarding, local-first resilience, and algorithmic debt settlement. 

To ensure the architecture directly supports **Use Case Driven Development (UCDD)** and **Deep Module** principles, candidate architectures are evaluated against four key criteria:
1. **First-Class Use Cases**: Use cases/interactors have explicit input/output boundaries and exist independently of framework lifecycles.
2. **Deterministic Domain Core**: Mathematical operations (currency rounding, remainder distribution, graph debt reduction) are 100% pure and headless-testable.
3. **Clean Seams & Swappable Persistence**: Storage interfaces (`IGroupRepository`) isolate in-browser `localStorage` from in-memory test doubles or future remote synchronization engines.
4. **Locality and Leverage**: High behavioral depth behind minimal interface surfaces.

---

## 2. Architectural Candidates

### Option 1: Clean / Hexagonal Architecture (Ports & Adapters) with Pure Domain Core *(Selected)*

```
┌─────────────────────────────────────────────────────────┐
│                      UI / Presentation                  │
│             (Components, Views, Form Handlers)          │
└────────────────────────────┬────────────────────────────┘
                             │ calls
┌────────────────────────────▼────────────────────────────┐
│                    Use Case / Service                   │
│        (CreateGroup, AddExpense, CalculateSettlement)   │
└──────────────┬────────────────────────────┬─────────────┘
               │ uses                       │ persists via
┌──────────────▼─────────────┐ ┌────────────▼─────────────┐
│     Pure Domain Core       │ │   Repository Port/Seam   │
│  - Group & Expense Entities│ │    (IGroupRepository)    │
│  - Split Arithmetic Engine │ └────────────┬─────────────┘
│  - Debt Settlement Engine  │              │ implemented by
└────────────────────────────┘ ┌────────────▼─────────────┐
                               │  LocalStorage / Memory   │
                               │        Adapters          │
                               └──────────────────────────┘
```

#### Description
- **Domain Layer**: Contains entities (`Group`, `Expense`, `Participant`) and pure calculation engines (`SplitCalculator`, `SettlementEngine`). Zero external dependencies or framework code.
- **Application / Use Case Layer**: Interactors (`CreateGroupUseCase`, `AddExpenseUseCase`, `GetBalancesUseCase`) coordinate domain entities and enforce application flow rules.
- **Infrastructure / Adapters**: Pluggable adapters at clean seams (`LocalStorageGroupRepository`, `InMemoryGroupRepository`).
- **Presentation Layer**: Thin UI layer that dispatches user intentions to use cases and renders view models.

#### Pros
- **Maximum Testability**: 100% of domain rules and algorithmic settlements are tested in millisecond-fast, zero-mock unit tests.
- **High Seam Leverage**: Changing persistence from `localStorage` to IndexedDB, SQLite-WASM, or a remote REST/WebSocket sync backend requires zero modifications to domain or use case interactors.
- **Deep Modules**: The debt settlement module exposes a tiny interface (`simplifyDebts(balances): Settlement[]`) while encapsulating complex graph reduction logic internally.

#### Trade-Offs
- Slight initial ceremony in defining explicit repository ports, DTOs, and mapping boundaries.

---

### Option 2: Event-Sourced / State-Reducer (Redux / CQRS-Lite)

```
┌─────────────────┐       dispatch(Action)       ┌────────────────────────┐
│  UI / Action    │ ───────────────────────────> │ Reducer / Event Store  │
└─────────────────┘                              └───────────┬────────────┘
         ▲                                                   │ state
         │               derived view (selectors)            │
         └───────────────────────────────────────────────────┘
```

#### Description
- State is an append-only event stream (`GroupCreated`, `ParticipantAdded`, `ExpenseAdded`, `ExpenseDeleted`).
- Current balances and minimal settlements are pure materialized views (selectors) computed over the event stream.

#### Pros
- Natural audit log of all financial edits.
- Trivial undo/redo functionality and clear forward-compatibility with multi-device peer-to-peer sync (CRDTs).

#### Trade-Offs
- Event versioning, reducer ceremony, and state upcasting introduce accidental complexity for a single-device, low-concurrency MVP.
- Domain invariants can be fragmented across action creators and reducer branches instead of encapsulated entity methods.

---

### Option 3: Feature-Sliced / Modular UI-Centric Architecture

```
src/
├── features/
│   ├── group-management/ (UI + State + Helpers)
│   ├── expense-logging/  (UI + State + Helpers)
│   └── settlement/       (UI + Calculations)
```

#### Description
- Code is co-located by visual feature slices. Each slice owns its UI components, local state, and helper utilities.

#### Pros
- Rapid initial prototyping and scaffolding for component-first developers.

#### Trade-Offs
- Shallow modules: business rules and debt minimization calculations tend to leak directly into React/Vue/Svelte component lifecycles.
- Weaker testability: testing inter-participant settlements often requires mounting UI components or creating complex UI state harnesses.

---

## 3. Comparative Summary

| Criteria | Option 1: Clean / Hexagonal | Option 2: Event-Sourced | Option 3: Feature-Sliced UI |
|---|---|---|---|
| **Use Case Isolation** | **High** (First-class interactors) | **Medium** (Action / Reducer flow) | **Low** (Tangled in UI components) |
| **Algorithmic Testability** | **High** (Pure functions, zero mocks) | **High** (Pure reducer tests) | **Medium** (Coupled to feature harness) |
| **Storage Independence** | **High** (Interface seam) | **Medium** (Event storage adapter) | **Low** (Direct storage access common) |
| **Complexity for MVP** | **Low–Medium** (Balanced & explicit) | **High** (Event schema overhead) | **Low** (Quick to start) |
| **Long-Term Maintainability** | **High** | **High** | **Low–Medium** |

---

## 4. Storage Strategy & Data Persistence Options

To preserve the zero-friction, local-first value proposition while maintaining clean architectural seams, we evaluated three client-side data storage candidates:

```
                          ┌───────────────────────────┐
                          │     IGroupRepository      │  (Async Port / Seam)
                          │   - save(group): Promise  │
                          │   - getById(id): Promise  │
                          │   - listAll(): Promise    │
                          └─────────────┬─────────────┘
                                        │
                 ┌──────────────────────┴──────────────────────┐
                 │                                             │
      ┌──────────▼──────────┐                       ┌──────────▼──────────┐
      │  LocalStorageAdapter │                       │   InMemoryAdapter   │
      │   (Production / UI)  │                       │  (Unit Tests & CI)  │
      └─────────────────────┘                       └─────────────────────┘
```

### Storage Candidates Evaluated

| Storage Option | Strengths | Trade-Offs | Decision |
|---|---|---|---|
| **1. Browser `localStorage`** | • Zero dependencies & instant setup<br>• Universal browser support<br>• Effortless debugging in DevTools | • String-only JSON format<br>• 5 MB quota limit (sufficient for thousands of expenses) | **Selected for Production** (`LocalStorageGroupRepository`) |
| **2. In-Memory `Map<string, Group>`** | • Microsecond execution<br>• Pure headless test isolation<br>• No DOM / browser mocks needed | • Non-persistent across page refreshes | **Selected for Tests** (`InMemoryGroupRepository`) |
| **3. `IndexedDB` (idb / Dexie)** | • Async native, larger storage quota<br>• Structured clone support | • Higher boilerplate / external library requirement<br>• Unnecessary complexity for small group JSON payloads | **Deferred** (Can be swapped in behind `IGroupRepository` if needed) |
| **4. Remote Database (REST / Supabase)** | • Cross-device synchronization | • Requires authentication, violates zero-friction pillar | **Deferred** (Future enhancement) |

---

## 5. Key Cross-Cutting Decisions Confirmed

1. **Monetary Representation**: Store all monetary values as **integer cents** (e.g., `€12.50` = `1250`) to eliminate IEEE 754 floating-point inaccuracies.
2. **Rounding Remainder Strategy**: Distribute split remainder cents deterministically across selected participants (e.g., €10.00 / 3 = 3.34, 3.33, 3.33).
3. **Repository Interface Asynchrony**: Define repository interfaces with asynchronous signatures (`Promise<T>`) to guarantee seamless migration to indexed/remote databases without changing call signatures.
4. **Storage Key Namespaces**:
   - `fairsplit:groups:<groupId>` → Serialized group entity JSON.
   - `fairsplit:current_group_id` → Active group reference.
