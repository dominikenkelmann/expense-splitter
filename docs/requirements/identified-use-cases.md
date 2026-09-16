# Identified Actors and Use Cases: FairSplit

> **Status**: Approved  
> **Date**: 16.09.2026  
> **Source Reference**: [docs/VISION.md](../VISION.md)  

---

## 1. Identified Actors

| Actor | Description | Primary Responsibilities |
|---|---|---|
| **`Organiser`** | The user who initiates and configures a shared expense context. | Creates the group, sets the group name, and defines the initial participant roster. |
| **`Participant`** | Any member belonging to the expense group (can also be the Organiser). | Logs expenses, selects payers/split allocations, reviews net balances, and views debt settlement suggestions. |

---

## 2. Core High-Level Use Cases (Initial Scope)

### `UC-001: Create Expense Group`
- **Primary Actor**: `Organiser`
- **Brief Description**: The Organiser wants to initialize a new expense group with a name and participant roster in order to establish a shared ledger for tracking group expenses.
- **Key Capabilities**:
  - Specify group name.
  - Add initial participant names (minimum 2 participants).
  - Validate uniqueness of participant names.
  - Initialize persistent local storage structure.

### `UC-002: Add Expense`
- **Primary Actor**: `Participant`
- **Brief Description**: The Participant wants to record an incurred group expense with a payer and split allocation in order to update the group ledger.
- **Key Capabilities**:
  - Input title/description and monetary amount.
  - Select paying participant from the group roster.
  - Choose split method: Equal Split across selected members or Custom fixed amounts.
  - Validate that split breakdown matches the total expense amount.
  - Append to group expense history and update balances.

### `UC-003: View Balances & Settlements`
- **Primary Actor**: `Participant`
- **Brief Description**: The Participant wants to inspect individual net balances and optimized settlement instructions in order to settle debts with the minimum number of transactions.
- **Key Capabilities**:
  - Display group total spend summary.
  - Display per-member net balances (Surplus / Deficit).
  - Compute and display simplified pairwise debt settlement transactions (e.g., *“Charlie pays Bob €120.00”*).

---

## 3. Backlog Candidates (Deferred Scope)

- **`UC-004: Delete Expense`**: The Participant wants to remove an incorrectly entered expense in order to restore accurate ledger balances.
- **`UC-005: Mark Settlement as Paid`**: The Participant wants to record a direct payment transfer between members in order to clear outstanding debt.
