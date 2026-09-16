# 0003: Integer Cents for Monetary Representation

We represent all monetary amounts internally as non-negative integer cents (e.g. `€12.50` is stored and calculated as `1250`) encapsulated in a dedicated `Money` value object.

## Status
Accepted

## Context & Rationale
Standard JavaScript floating-point numbers (IEEE 754) produce rounding artifacts (e.g. `0.1 + 0.2 === 0.30000000000000004`), which can cause balancing equations (Total Paid == Total Split Allocations) to fail and lead to ledger discrepancies.

By strictly using integer cents and encapsulating monetary arithmetic inside a `Money` value object:
1. All division remainder cents (e.g. splitting €10.00 among 3 participants into 334¢, 333¢, 333¢) are explicitly accounted for and distributed deterministically.
2. Floating-point conversions only occur at the boundary when parsing user input and formatting currency for display.
