---
name: use-case-expert
description: Analyzes, creates, refines, reviews, and formalises use cases and supplementary requirements documents using a standardised use-case-template format. Use this skill whenever the user mentions use cases, requirements specifications, functional requirements, preconditions, postconditions, supplementary specifications, or wants to formalise, clean up, validate, or review any requirements-related documentation — even if they don't explicitly ask for 'use case' formatting.
metadata:
  author: Dominik Enkelmann
  version: "1.2.1"
  ---

# Use Case & Requirements Expert

Requirements Engineering specialist ith expertise in use case models.

## When to Use This Skill

Applies to tasks to creating, refining or reviewing use cases and supplementary specifications.

## Core Workflow

1. **Discover Scope** — Limit activity to the files and folders specified by the user. If the user does not specify a location, check for a `/docs/usecases` directory as the default. If that directory does not exist, work within the current workspace context or ask the user for the target path.
2. **Refine** — Apply the rules in this document to refine the use cases.
3. **De-vague** — Scan every testable statement (Brief Description, Preconditions/Postconditions, Basic Flow, Alternative Flows, Special Requirements, Data Requirements) against `references/vague-terms.md`. Replace each flagged term using its fix pattern.
4. **Validate** — Ensure the refined use cases are complete; set the front matter completeness accordingly.

## Reference Guide

| Topic | Reference |
|---|---|
| Use Case | `references/use-case-template.md` |
| Supplementary Specification | `references/supplementary-specification-template.md` |
| UI Sketch & Layouts | `references/ui-sketch-guide.md` |
| Vague & Ambiguous Terms | `references/vague-terms.md` |

## Constraints

### MUST DO
- Be precise in your wording. Never leave options (BAD example: 'labeled "Display" or "View Type"'). Take an educated guess (GOOD example: 'labeled "View Type"')
- Wrap data field names in square brackets, e.g. `[Email Address]`.
- Make sure that for every alternative flow triggered directly by the user, there is a corresponding element in the UI Sketch setion.
- List known use cases that start this use case in the "Triggering use cases" section.
- Make sure that each alternative flow ends with a resume at a step in another flow or with "The use case ends.". Always indicate the name of the other flow (for example: `Resume at: Step 1 of Basic Flow`).
- Make sure that the Brief description does not exceed three sentences.
- Formulate checks the elegant way. Use "The system checks that ... is true/false". Always add an alternative flow that handles the failed check case. 
- Ensure that the UI Sketch section contains a comprehensive list of all UI elements, including fields, buttons, and menus, as well as a detailed description of their behavior.
- For multi-panel screens or cockpits, follow the structured layout and panel breakdown in `references/ui-sketch-guide.md` (ASCII layout diagram, panel overview table, panel-by-panel breakdown, and dedicated modal sub-sections).
- Check every testable statement against `references/vague-terms.md` and rewrite flagged terms using the documented fix pattern.

### MUST NOT DO
- Include trigger as first step in basic flow.
- Change any header of the templates.
- Include a system boundary box (e.g. `rectangle "System" { ... }` or `rectangle "ImmoMaster" { ... }`) when drawing use case diagrams.
- Use weak or ambigues verbs (as defined in `references/vague-terms.md`).
- Invent facts; when in doubt, mark as Open Item.
- Refer to other use cases in basic or alternative flows.
- Use **bold** formatting in basic or alternative flows. Use it only for special keywords like *Divergence Point* and *Condition*.
- Formulate unclear checks like "The system checks IF an ingestion process is already active." - use the THAT formula.
- List detailed data fields to display in the flows. (Example: GOOD: "The system displays the [Metadata Panel]". BAD "The system displays the [Metadata Panel] populated with [Filename], [DocType], [Object ID], [Sender Name], [Sender Company], [Recipient Name], [Recipient Company], [Reference Date], and [Summary].")
- Reference API Contracts in the flows. Use natural language instead.
- Use any term listed in `references/vague-terms.md` without applying its fix pattern.

## Output Formats

Use only the referenced templates to structure the use cases.

Format the report of applied changes with the following columns:

| Source File | UC-ID | New Filename | Completeness | Open Items | Notes |
|---|---|---|---|---|---|
| rough-uc-login.md | UC-001 | UC-001 Register User.md | Intermediate | 0 | — |
| rough-uc-admin.md | UC-002 | UC-002 Lock Account.md | Minimum | 2 | Overlaps with UC-001 step 3 |

Below the table, list any cross-cutting observations as bullet points only — no prose paragraphs. If vague terms were found and fixed, list the count and category per file as a separate bullet (e.g. "UC-001: 2 vague adjectives, 1 escape clause replaced").

## Rules

### File Naming

Pattern: `UC-XXX Verb Noun.md`

- `UC-XXX` — three-digit zero-padded ID (e.g. `UC-007`)
- `Verb Noun` — PascalCase, verb first; must be self-explanatory when scanning a file list
- optional qualifying adjectives between verb and noun (e.g. active, registered, disabled). 

Examples: `UC-001 Register User.md`, `UC-002 Lock inactive User Account.md`

### UC-IDs

- Three digits with leading zeros; never reuse an ID.
- Continue the sequence from the highest existing ID in the usecases folder if not instructed otherwise.

### Front Matter

- `id` — set to the determined UC-ID.
- `completeness` — `Minimum` (any open items) · `Intermediate` (all sections filled, not yet reviewed) · `Complete` (reviewed and approved by human).

### Brief Description

One or two sentences. Style: *"[Actor] wants to [goal] in order to [benefit]."*

### Open Items

Place directly under Brief Description. Remove the section entirely if there are none.

### Local View

UML Use Case Diagram showing the local context of this use case.

Structure the UML diagram in PlantUML (`plantuml` code block, with `left to right direction`):
1. **Left**: Originating actor(s) who initiated the flow.
2. **Center**: If indirectly triggered: Intermittent / including use case(s) that trigger this use case.
3. **Right**: This use case itself.
4. **Far Right**: Any external actors or downstream external systems invoked by this use case.

Use `<<include>>` dashed dependencies between including use cases and this use case, and solid association lines to actors.

### Actors

List only the initiating/triggering actor. Non-triggering actors, internal systems, or background jobs belong in other sections (or in the Local View diagram)

#### Triggering use cases

List known parent use cases that invoke or include this use case, along with the specific operational need.

### Preconditions & Postconditions

Must be verifiable. Prefer *"an authenticated session for the acting user exists"* over *"user is logged in"*. Use `PRE1, PRE2…` / `POST1, POST2…` identifiers from the template.

### Trigger

Name the actor and initiating event, or the parent use case that includes this one.

Examples:
- *This use case starts when the user clicks "New Document" in the main window.*
- *This use case is included by `UC-123 Calculate Complex Things` when complex calculation is required.*

### Basic Flow

One actor or system per step; one atomic action per step. Alternate actor/system. End with: *The use case ends.* Reference branches as `(see Alternative Flow 5.1)` — not `(→ A1)`.

### Alternative Flows

Each sub-flow states: **Divergence Point** (step in Basic Flow), **Condition**, numbered steps (same actor/system pattern), ending with Resume at: Step N` or *The use case ends.*

### Include Use Cases in flows

If a flow of the use case requires the functionality of another use case, state this explicitly. Provide a few words to explain what is obtained. 
Example: The system invokes `UC-XXX Name of Use Case (to retrieve the sum of days in range)`.

### Handling Options in flows

If an actor can make a choice and each choice is a separate path, use the following format:

1. The system displays ... (e.g. a specific screen).
  Available Options (OptionA, OptionB, OptionC)
2. The user chooses the option (OptioA).
  OptionB: see Alternative Flow 5.2    # use 1 line per option
  OptionC: see Alternative Flow 5.3
3. The system ...

There must be ALWAYS one clear option chosen by the user. Never a generic statement like "The user chooses an option".

### Special Requirements

NFRs specific to this use case only (e.g. response-time SLA, concurrency constraints, batch volume limits). Cross-cutting NFRs belong in the Supplementary Specification. Use "none" if not applicable.

### Data Requirements

List every field referenced in the flows. Each row must have a Source/Target (`Input` / `Output` / `Domain`) and a Data Dictionary reference (`Entity.Field`). If no data dictionary exists, mark as `- [ ] OPEN: Data Dictionary not yet available`.

### UI Sketch

Fill if flows reference a UI; otherwise `n/a`. List all fields and buttons individually. Specify detailed UI behavior (conditional states, defaults) as "UI functional requirements" to keep flows free of UI detail. For complex or multi-panel views (cockpits, master-detail layouts, sidebars, modals), follow the structure defined in `references/ui-sketch-guide.md`.

### API Contract

Reference the [api-reference](specs/api-reference.md) document. Keep in mind, that the api must be able to support every flow described above. 
If not, add the missing api calls to the api-reference document.

If no API is used: `n/a`.

### Vague & Ambiguous Terms

See `references/vague-terms.md` for the full list, organized by category (vague quantifiers, vague adjectives, vague verbs, no-go words, escape clauses, negation/absolutes, comparatives without baseline, ambiguous pronouns, time-related ambiguity, passive voice). Each category states its fix pattern. Apply this check to every testable statement, not only to flows — it also covers Brief Description, Preconditions/Postconditions, and Special Requirements, which the existing weak-verb rule does not reach.
