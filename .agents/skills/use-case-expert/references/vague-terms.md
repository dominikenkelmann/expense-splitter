# Vague & Ambiguous Terms in Requirements

Flag any term below when refining use cases, flows, or supplementary specifications. For each flag, name the category and apply the fix pattern. This applies to Brief Description, Preconditions/Postconditions, Basic Flow, Alternative Flows, Special Requirements, and Data Requirements — anywhere a testable statement is expected.

## 1. Vague Quantifiers
**Problem:** No measurable amount, frequency, or threshold.
**Fix pattern:** Replace with a number, range, or explicit condition.

| Term |
|---|
| about |
| a few |
| a lot of |
| allowable |
| almost |
| almost always |
| any |
| approximate |
| close to |
| few |
| frequently |
| generally |
| many |
| many times |
| minimal |
| most |
| most of the time |
| nearly |
| numerous |
| occasionally |
| periodically |
| rarely |
| several |
| several times |
| some |
| very nearly |

## 2. Vague Adjectives / Subjective Qualifiers
**Problem:** Describes a quality with no testable standard.
**Fix pattern:** Replace with a measurable criterion or named reference standard.

| Term |
|---|
| acceptable |
| adequate |
| ancillary |
| appropriate |
| common |
| convenient |
| customary |
| easy-to-use |
| effective |
| efficient |
| fast |
| flexible |
| friendly / user-friendly |
| generic |
| good |
| improved |
| intuitive |
| logical |
| modern |
| normal |
| optimal |
| powerful |
| proficient |
| quality |
| reasonable |
| robust |
| routine |
| seamless |
| significant |
| simple |
| standard |
| state-of-the-art |
| strong |
| sufficient |
| suitable |
| timely |
| typical |
| usable |

## 3. Vague Verbs / Open-Ended Capability Claims
**Problem:** Implies unbounded or undefined behavior. Overlaps with the existing MUST NOT DO weak-verb rule for flows — also applies to Special Requirements and Brief Description text.
**Fix pattern:** Name the specific action and its observable result.

| Term |
|---|
| enable |
| enhance |
| facilitate |
| handle |
| improve |
| manage |
| optimize |
| process (used alone, undefined) |
| provide for |
| streamline |
| support (used alone, e.g. "shall support X" without defining what support means) |

## 4. No-Go Words / Ambiguous Operators
**Problem:** Meaning shifts by interpretation, or hides an undocumented dependency or scope.
**Fix pattern:** State the dependency or scope explicitly; split and/or into separate conditions; enumerate the full list instead of using etc.

| Term |
|---|
| according to |
| and/or |
| automatically |
| etc. |
| including but not limited to |
| respectively (when list mapping is not obviously 1:1) |

## 5. Escape Clauses
**Problem:** Makes a requirement unenforceable because compliance depends on undefined judgment.
**Fix pattern:** State the fallback behavior explicitly — what happens in the excluded case.

| Term |
|---|
| as appropriate |
| as applicable |
| as little as possible |
| as much as possible |
| as needed |
| as required |
| but not limited to |
| if it should prove necessary |
| if necessary |
| if practicable |
| or equivalent |
| so far as is possible |
| subject to availability |
| to the extent necessary |
| to the extent practical |
| where feasible |
| where possible |
| whenever possible |

## 6. Negation / Absolute Ambiguity
**Problem:** Creates logical traps or untestable absolutes; often hides unhandled edge cases.
**Fix pattern:** Verify the absolute is truly exhaustive, or replace with the specific enumerated condition.

| Term |
|---|
| all |
| always |
| every |
| except (without enumerating exceptions) |
| never |
| none |
| not |

## 7. Comparative Words Without a Defined Baseline
**Problem:** Implies comparison with no stated reference point or number.
**Fix pattern:** State the baseline and the target value or delta.

| Term |
|---|
| better |
| faster |
| higher |
| increased |
| lower |
| maximum / minimum (without a stated number) |
| optimized |
| reduced |

## 8. Ambiguous Pronouns
**Problem:** Unclear referent, especially across multi-step flows.
**Fix pattern:** Replace the pronoun with the explicit noun or field name.

| Term |
|---|
| it / this / that / these / those (when antecedent is unclear) |
| respective (when mapping is not obviously 1:1) |

## 9. Time-Related Ambiguity
**Problem:** Implies timing with no measurable bound.
**Fix pattern:** State a concrete duration, deadline, or SLA; place cross-cutting timing NFRs in the Supplementary Specification.

| Term |
|---|
| eventually |
| immediately (without a numeric SLA) |
| instantaneous |
| real-time (without a defined latency) |
| shortly |
| soon |

## 10. Passive Voice / Missing Actor
**Problem:** Omits who or what performs the action, leaving responsibility untestable. Directly relevant to the existing "one actor or system per step" rule for Basic and Alternative Flows.
**Fix pattern:** Rewrite in active voice naming the actor or system explicitly.

Example: *"The data shall be validated"* → *"The system validates [Email Address]."*
