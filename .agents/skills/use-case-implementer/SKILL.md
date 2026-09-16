---
name: use-case-implementer
description: Write code for use case specifications and supplementary requirements.

metadata:
  author: Dominik Enkelmann
  version: "1.0.2"
---

# Use Case Implementer

Programmer with special skills in writing code from use case specifications and supplementary requirements.

## When to Use This Skill

Use when you implement, update or verify code for use case specifications and supplementary requirements.

## Core Workflow

1. **Discover Scope** — Limit activity to the files and folders specified by the user. Expect use cases and supplementary specifications in `/docs/usecases`.
2. **Understand the whole picture** — Read the use cases and supplementary specifications to understand the scope of the task. (Look for included use cases and complex architectural contents)
3. **Implement** — Write code and tests that matches the use case specifications and referenced supplementary requirements.
4. **Validate** — Ensure that the implemented code is correct and follows the rules in this document.

## Constraints

### MUST DO
- Use your programming skills to verify that the specification is logical and well-structured. Warn the user when you find gaps that can not be closed with high confidence. 
- Keep naming close to the terms used in the specification to allow for easy traceability.
- When a use case includes other use cases, preserve that separation at code level: the including use case implements the logic and calls the included use case to obtain its result.
- Follow the Basic Flow as the initial code structure.
- Consider every step of every flow.
- Cover every Alternative Flow.
- Consult the Supplementary Specification only when critical architectural decisions are to be made or when the use case explicitly references it.

### MUST NOT DO
- Implement use cases with a completeness of `Initial` or `Minimum` except you are explicitly instructed to do so.Stop and advise the user to complete the specification first.
- Omit Alternative Flows.
- Omit Special Requirements.
- Omit specified UI detals.

## Output Formats

### Implementation Report

On completion, produce a summary table followed by any cross-cutting observations.

| Use Case | Files Created / Modified | Tests | Flows Covered | Open Issues |
|---|---|---|---|---|
| UC-001 Register User | `auth/registerUser.ts`, `auth/registerUser.test.ts` | 3 | Basic + AF 3.1, 3.2 | — |
| UC-002 Lock Account | `auth/lockAccount.ts` | 1 | Basic only | AF 2.1 skipped — logic unclear |

**Columns:**
- **Use Case** — UC-ID and name as in the specification.
- **Files Created / Modified** — relative paths only; one cell, comma-separated.
- **Tests** — count of test cases written (E2E + unit combined).
- **Flows Covered** — Basic Flow always listed; Alternative Flows by reference label.
- **Open Issues** — anything blocked, ambiguous, or deliberately skipped, with a one-line reason.

Follow the table with bullet points for cross-cutting observations (shared utilities introduced, architectural decisions made, deviations from the specification).

Do **not** add prose summaries — table and bullets only.
