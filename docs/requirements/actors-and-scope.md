# Scope & Actors — Expense Splitter (FairSplit)

## System Vision
FairSplit is a lightweight, zero-backend browser application for groups (housemates, travel groups, event organizers) to track shared expenses and compute simplified settlement debts.

## Actors

| Actor | Description | Key Responsibilities |
|---|---|---|
| **Organiser** | A participant who creates the group and establishes the roster of participants. | Create group, add initial members. |
| **Participant** | Any member of an active expense group. | Log expenses, view shared balance ledger, view settlement debts. |

## Use Case Boundary & Identification

| Use Case ID | Name | Primary Actor | Summary Goal |
|---|---|---|---|
| **UC-001** | Create Expense Group | Organiser | Initialize a new group with a unique name and participant roster. |
| **UC-002** | Add Expense | Participant | Record a shared expense, identify the payer, and distribute splits among selected participants. |
| **UC-003** | View Balances & Settlements | Participant | Inspect net individual balances and view calculated debt-minimization settlement instructions. |
