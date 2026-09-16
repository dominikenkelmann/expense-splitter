# Building FairSplit: A Practical Use Case Driven Development Walkthrough

A step-by-step guide demonstrating how to build a web application from scratch using **Use Case Driven Development (UCDD)** in TypeScript.

---

## The Workflow at a Glance

Instead of jumping straight into ad-hoc code or writing loose user stories, we follow a deterministic, traceable pipeline:

```mermaid
graph LR
    P0[Phase 0: Napkin Idea] --> P1[Phase 1: Scope & Actors]
    P1 --> P2[Phase 2: Architecture]
    P2 --> P3[Phase 3: Formal Use Cases]
    P3 --> P4[Phase 4: Vertical Slices]
    P4 --> P5[Phase 5: Unit & Integration Tests]
    P5 --> P6[Phase 6: E2E Tests]
```

---

## Phase 0: The Napkin Idea

Every project starts with an informal, human concept. Here is our initial unrefined idea:

> *"We want a simple browser app where a group of friends can track shared expenses — like dinner, groceries, or a road trip. One person creates a group and adds participants. Anyone can log an expense and say who it's split between. At the end, the app tells everyone who owes whom and how much."*

Notice what this raw idea is missing:
- No validation rules (what if participant names are duplicate or empty?)
- No calculation specifications (how are uneven cents distributed in splits?)
- No architectural boundaries or state persistence lifecycle.

Rather than trying to solve all of this at once in code, UCDD structures the refinement into clear artifacts.

---

## Phase 1: Initial Requirements Capture (Actors & Scope)

In this phase, we translate the napkin idea into clear system boundaries and high-level use case goals.

### 1. Identifying Actors

We distinguish who interacts with the system:

| Actor | Description | Key Responsibilities |
|---|---|---|
| **Organiser** | Initiates and configures the expense group. | Creates group, sets up participant roster. |
| **Participant** | Any member belonging to an active group. | Logs shared expenses, reviews balances, inspects settlements. |

*(Note: An `Organiser` is a specialization of `Participant` who performs the initial group configuration).*

### 2. Scoping Core Use Cases

We break down the system into 3 focused, goal-oriented use cases:

1. **`UC-001: Create Expense Group`** (Primary Actor: *Organiser*)  
   *Goal*: Establish a new expense group with a designated name and participant list.
2. **`UC-002: Add Expense`** (Primary Actor: *Participant*)  
   *Goal*: Record a payment made by one participant and apportion shares to all or selected group members.
3. **`UC-003: View Balances & Settlements`** (Primary Actor: *Participant*)  
   *Goal*: View the net position of each participant and calculated instructions on how to settle debts with minimum transactions.

### 3. Visualizing the System Boundary

We formalize these relationships in a PlantUML use case diagram:

```plantuml
@startuml
left to right direction
skinparam packageStyle rectangle
skinparam shadowing false
skinparam monochrome true

actor "Organiser" as Organiser
actor "Participant" as Participant

Organiser -up-|> Participant

rectangle "FairSplit System" {
  usecase "UC-001: Create Expense Group" as UC1
  usecase "UC-002: Add Expense" as UC2
  usecase "UC-003: View Balances & Settlements" as UC3
}

Organiser --> UC1
Participant --> UC2
Participant --> UC3
@enduml
```

---
