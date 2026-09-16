# Product Vision: FairSplit

> **Status**: Approved  
> **Date**: 16.09.2026  
> **Author**: Dominik Enkelmann  

---

## 1. Vision Statement

### Problem
Splitting group costs (travel, dinners, shared flats) typically forces users into account signups, intrusive ads, or complex multi-step sync workflows just to answer one question: *"Who owes whom what?"*

### Solution & Vision
FairSplit provides an instant, zero-friction web tool where any group can log expenses in seconds and immediately view deterministic balances with optimized, minimal-transaction settlement paths.

---

## 2. Core Value Pillars

1. **Zero Friction**: No login, no passwords, no mandatory server setup—open the application and start splitting immediately.
2. **Deterministic Clarity**: Clear, transparent arithmetic for both equal and custom expense splits.
3. **Debt Minimization**: Algorithmic reduction of complex multi-person debts to the smallest possible list of pairwise transfers.
4. **Local-First & Resilient**: In-browser persistence so data survives page reloads without requiring remote backend infrastructure.

---

## 3. The "Napkin Sketch" (Raw UI & Interaction)

```text
+-------------------------------------------------------------+
| FairSplit - Group Expense Splitter                          |
+-------------------------------------------------------------+
| [ Weekend Trip to Alps ]                      Total: €450.00|
| Participants: Alice, Bob, Charlie                           |
+-------------------------------------------------------------+
| Recent Expenses:                                            |
|  - Grocery Run (€120.00, paid by Alice, split equally)      |
|  - Mountain Hut (€300.00, paid by Bob, split equally)       |
|  - Coffee (€30.00, paid by Charlie, split equally)          |
+-------------------------------------------------------------+
| Net Balances:                                               |
|  * Alice:   -€30.00 (Paid €120, Share €150)                 |
|  * Bob:    +€150.00 (Paid €300, Share €150)                 |
|  * Charlie:-€120.00 (Paid €30,  Share €150)                 |
+-------------------------------------------------------------+
| Suggested Settlements (Minimal Transactions):               |
|  -> Charlie pays Bob €120.00                                |
|  -> Alice pays Bob €30.00                                   |
+-------------------------------------------------------------+
```

---

## 4. Scope Boundaries (Initial Release)

### In-Scope
- Creating an expense group with named participants.
- Logging individual expenses with a designated payer and participant split assignment.
- Calculating individual net balances and direct debt settlement suggestions.
- Browser local storage persistence.

### Out-of-Scope (Deferred)
- Multi-device real-time sync / WebSockets.
- Multi-currency conversion rates and external exchange APIs.
- Payment gateway integration (e.g., PayPal/Venmo deep linking).
- User authentication and access control.
