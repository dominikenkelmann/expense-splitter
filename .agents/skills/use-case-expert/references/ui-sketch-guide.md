# UI Sketch Specification Guide

This guide establishes the standard structure for Section 9 (UI Sketch) in use cases. Follow these patterns to ensure UI details are comprehensive, testable, and consistently structured.

---

## 1. Overview of Patterns

| Screen Type | Complexity | Recommended Pattern | Reference |
|---|---|---|---|
| **Simple Dialog / Single Form** | Low (Single card or linear form) | **Pattern A: Single Form** | Direct list of Fields, Active Elements, UI Requirements |
| **Cockpit / Split View / Dashboard** | High (Multi-panel, sidebars, modals) | **Pattern B: Multi-Panel Cockpit** | ASCII Layout Diagram + Panel Overview Table + Panel-by-Panel Breakdown |
| **Master-Detail / List + Inspector** | Medium-High (List column + detail panel) | **Pattern C: Master-Detail Layout** | ASCII Layout Diagram + Table + Panel Breakdown |
| **Tabbed View / Multi-Step Wizard** | Medium (Tabs or step progression) | **Pattern D: Tabbed / Stepped Layout** | ASCII Layout Diagram + Tab Breakdown |

---

## 2. Pattern A: Simple Dialog / Single Form

Use for straightforward modals or single-purpose forms (e.g. login form, simple confirmation dialog, upload modal).

```markdown
#### [UI Name]

**Fields**

- [Field Name]: Input type, formatting, placeholder, default value
- [Badge / Label]: Status indicator, badge variant

**Active elements**

- Action buttons, toggles, dropdowns, cancel/submit triggers

**UI functional requirements**

- Validation rules (e.g., submit disabled until mandatory fields valid)
- Conditional visibility and default states
- Confirmation prompts and dismissal behavior
```

---

## 3. Pattern B: Multi-Panel Cockpit / Complex View

Use for rich operational cockpits, full-page edit screens, and views containing multiple functional blocks, sidebars, or sub-components.

### 3.1 Structure of Pattern B

1. **Page Title**: `#### [UI Name - Screen Role]`
2. **Layout Overview**: ASCII Wireframe diagram visualizing the spatial layout (Command Bar, Main Work Column, Context Sidebar, Modal Portals).
3. **Panel Overview Table**: High-level map of all panels and information blocks.
4. **Panel-by-Panel Specifications**: Sub-sections (`##### 1. Panel Name (identifier)`) each containing:
   - `**Fields**`
   - `**Active elements**`
   - `**UI functional requirements**`
5. **Modal Dialogs**: Dedicated sub-sections for every modal spawned from the screen.

### 3.2 Template for Pattern B

````markdown
#### [Unified Issue View - Full Edit]

##### Cockpit Page & Panel Layout Overview

```
+---------------------------------------------------------------------------------------------------------+
| [Top Command Bar]: [Back Button]                                             [Action 1]  [Save Button]  |
+----------------------------------------------------+----------------------------------------------------+
| MAIN WORK COLUMN (Left)                            | CONTEXT & ACTORS SIDEBAR (Right)                   |
|                                                    |                                                    |
| 1. [Hero / Core Form Panel]                        | 4. [Context / Scope Panel]                         |
|    - Status badges, primary inputs                 |    - Locked object, filter chips                   |
|                                                    |                                                    |
| 2. [Workflow / Timeline Panel]                     | 5. [Secondary Attributes Panel]                    |
|    - Progress counter, inline creator, action list |    - Reporting channel, reporter info              |
|                                                    |                                                    |
| 3. [Attachments / Documents Panel]                 | 6. [Participants / Contacts Panel]                 |
|    - Documents table, upload trigger               |    - Participant list, inline add search           |
+----------------------------------------------------+----------------------------------------------------+
| MODAL DIALOGS:                                                                                          |
| - [Modal 1 Name]: Template selection, flag checklist switches                                           |
| - [Modal 2 Name]: Closure check resolution, blockers list                                               |
+---------------------------------------------------------------------------------------------------------+
```

| # | Panel / Block Name | Component / Container | Area | Purpose |
|---|---|---|---|---|
| 1 | Top Command Bar | `HeaderNav` | Top Bar | Global navigation and primary actions |
| 2 | Hero & Core Metadata | `MainFormSection` | Main Column (Top) | Core metadata inputs, status badges, timestamps |
| 3 | Massnahmen & Workflow | `ActionsTimeline` | Main Column (Middle) | Action lifecycle, checklist, action comments |
| 4 | Dokumente & Anhänge | `DocumentsPanel` | Main Column (Bottom) | Table of linked files and upload modal trigger |
| 5 | Liegenschaft & Einheiten | `PropertyUnitsSection` | Sidebar (Top) | Scope selection, unit chips, immutable object info |
| 6 | Meldeweg & Melder | `MelderOriginSection` | Sidebar (Middle) | Channel selection, reporter autocomplete |
| 7 | Beteiligte Personen | `ContactsPanel` | Sidebar (Bottom) | Participant roster, inline search, removal |
| 8 | Modals | `ModalA`, `ModalB` | Overlay Portals | Specific workflows executed in modal overlays |

##### 1. Top Command Bar (`container-identifier`)

**Fields**

- None (or global status chips)

**Active elements**

- "Zurück" navigation button
- "Änderungen speichern" primary submit button

**UI functional requirements**

- State management for disable/loading states...

##### 2. Hero & Core Metadata Section (`component-name`)

**Fields**

- [Ticket-ID] badge: Read-only formatted string
- [Status] badge: Status indicator (`Neu`, `In Bearbeitung`, `Wartet Extern`, `Erledigt`)
- [Title] input field: Text input (mandatory, placeholder "...")
- [Created At] timestamp: Formatted as `DD.MM.YYYY, HH:MM`

**Active elements**

- [Title] text input
- [Issue Type] dropdown select

**UI functional requirements**

- Mandatory field validation disables the primary submit button when empty.
- Dynamic panel visibility based on selected type...

...

##### N. Modal Dialogs

###### N.1 [Modal Name] (`ModalComponent`)

**Fields**
- [Field 1]: ...

**Active elements**
- Action buttons, close triggers...

**UI functional requirements**
- Submission payload, confirmation behavior, refresh callbacks...
````

---

## 4. Drafting Rules for UI Elements

### 4.1 Fields (`**Fields**`)
- **Wrap in square brackets**: All data items, badges, and labels must be enclosed in `[Square Brackets]`, e.g. `[Ticket-ID]`, `[Status]`, `[Due Date]`.
- **Specify type and constraints**: Indicate whether an element is an input, textarea, dropdown, date picker, read-only badge, chip, or counter.
- **Date/Time Formatting**: Always specify dates as `DD.MM.YYYY` and timestamps as `DD.MM.YYYY, HH:MM`.
- **Placeholders and Defaults**: State explicit placeholders and default values.

### 4.2 Active Elements (`**Active elements**`)
- List every clickable control, button, link, toggle switch, chevron expander, inline action icon, and autocomplete dropdown row.
- Use explicit button labels in quotes (e.g. `"Änderungen speichern"`, `"Abbrechen"`, `"Download"`).

### 4.3 UI Functional Requirements (`**UI functional requirements**`)
- **Validation**: Define when buttons are disabled or enabled (e.g., submit disabled when required field is empty or saving is in progress).
- **Conditional Visibility**: Define exact conditions for showing or hiding panels, badges, or buttons (e.g., *"[Closed At] is rendered only when closed_at is not null"*).
- **Expansion / Collapsing**: Specify initial expansion states (e.g., *On page load, the first open action is expanded; all others are collapsed*).
- **Immutability & Locking**: Explicitly state read-only rules (e.g., *[Property Object] is locked and cannot be edited after creation*).
- **Deduplication & Sorting**: Specify sort order (e.g., *reverse-chronological newest first*) and deduplication logic.
