# FairSplit

FairSplit is a lightweight, zero-friction group expense management tool designed to track shared costs and calculate deterministic, minimal debt settlement transfers without requiring user accounts.

## Language

**Expense Group**:
A named collection of participants sharing a common expense ledger.
_Avoid_: Trip, project, event, account

**Participant**:
An individual member belonging to an Expense Group who can pay for or share in expenses.
_Avoid_: User, member, account, attendee

**Organiser**:
The participant who initializes the Expense Group and defines the initial participant roster.
_Avoid_: Admin, owner, creator

**Expense**:
A recorded monetary spend incurred by a payer on behalf of one or more participants in the group.
_Avoid_: Bill, receipt, charge, cost

**Payer**:
The participant who paid the upfront monetary amount for an Expense.
_Avoid_: Buyer, purchaser, creditor

**Split Allocation**:
The specific share of an Expense assigned to an individual participant (either equal share or custom fixed amount).
_Avoid_: Contribution, breakdown, portion

**Net Balance**:
The net financial standing of a participant (Total Paid minus Total Incurred Share), where a positive balance indicates a creditor (surplus) and a negative balance indicates a debtor (deficit).
_Avoid_: Total debt, account status

**Settlement**:
A calculated pairwise payment recommendation instructing a debtor to pay a creditor a specific monetary amount in order to minimize group debt transactions.
_Avoid_: Transaction, transfer, refund, payout

**Debt Simplification**:
The graph reduction algorithm that transforms multi-party net balances into the minimal number of direct settlement transfers.
_Avoid_: Debt settling, balancing, clearing
