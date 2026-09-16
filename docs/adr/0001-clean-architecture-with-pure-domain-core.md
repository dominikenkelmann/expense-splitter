# 0001: Clean Architecture with Pure Domain Core

We structure FairSplit using Clean Architecture (Ports & Adapters) with a 100% pure TypeScript domain core. All business rules, monetary split allocations, and debt minimization algorithms live in isolated domain modules devoid of UI or storage dependencies, orchestrated by standalone use-case interactors.

## Status
Accepted

## Considered Options
- **Clean / Hexagonal Architecture** (Selected): Maximizes testability with zero-mock unit testing and establishes clear seams for storage and UI frameworks.
- **Event-Sourced / State-Reducer**: Rejected due to unnecessary schema versioning and reducer ceremony for an in-browser single-group MVP.
- **Feature-Sliced UI Modular**: Rejected due to the high risk of shallow modules and leaky abstractions between calculation logic and component lifecycles.

## Consequences
- Every use case is implemented as an isolated interactor class/function with explicit input/output boundaries.
- UI components and persistence adapters depend inward on domain interfaces; domain models have zero outward dependencies.
