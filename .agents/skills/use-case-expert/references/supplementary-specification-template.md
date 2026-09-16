# Supplementary Specification Template

## {System Name} — Supplementary Specification

### 2. System Overview

{Write overview here — 3-5 sentences covering what the system does, who uses it, and its deployment context.}

---

### 3. Functionality (System-Wide)

#### 3.1 Authentication

**AUTH-001** {Authentication Method}

{e.g. "The system shall support authentication via JWT tokens."}

**AUTH-002** {Session Expiry}

{e.g. "Session tokens expire after 30 minutes of inactivity."}

**AUTH-003** {Brute Force Protection}

{e.g. "Failed login attempts are locked after 5 tries for 15 min."}

#### 3.2 Authorization

**AUTHZ-001** {Access Control Model}

{e.g. "Role-based access control (RBAC) with roles: Admin, Manager, User."}

**AUTHZ-002** {Endpoint Enforcement}

{e.g. "All API endpoints enforce authorization checks before processing."}

**AUTHZ-003** {Unauthorized Access Handling}

{e.g. "Unauthorized access attempts return 403 and are logged."}

**Role Definitions:**

| Role    | Description                   | Inherits From |
| ------- | ----------------------------- | ------------- |
| Admin   | {Full system access}          | Manager       |
| Manager | {Department-level management} | User          |
| User    | {Standard authenticated user} | None          |

#### 3.3 Auditing & Logging

**AUDIT-001** {Operation Logging}

{e.g. "All create, update, delete operations are logged with user ID, timestamp, and entity affected."}

**AUDIT-002** {Log Immutability & Retention}

{e.g. "Audit logs are immutable and retained for 7 years."}

**AUDIT-003** {Log Format}

{e.g. "Application logs use structured JSON format with correlation IDs."}

**Log Levels & Usage:**

| Level | When to Use                                                   |
| ----- | ------------------------------------------------------------- |
| ERROR | {Unrecoverable failures requiring attention}                  |
| WARN  | {Recoverable issues or degraded functionality}                |
| INFO  | {Key business events — use case start/end, state transitions} |
| DEBUG | {Developer-level detail, disabled in production}              |

#### 3.4 Notification Services

**NOTIF-001** {Delivery Mechanism}

{e.g. "Email notifications are sent asynchronously via a message queue."}

**NOTIF-002** {Template Management}

{e.g. "All notifications use templated content stored in the database."}

**NOTIF-003** {Retry Policy}

{e.g. "Failed notification delivery retries 3 times with exponential backoff."}

#### 3.5 Error Handling Strategy

**ERR-001** {Error Envelope Format}

{e.g. "All API errors return a standard JSON error envelope: `{ error, code, message, details }`."}

**ERR-002** {Information Exposure}

{e.g. "Internal errors never expose stack traces or implementation details to clients."}

**ERR-003** {Validation Error Response}

{e.g. "Validation errors return HTTP 422 with per-field error details."}

**Standard Error Response Format:**

```json
{
  "error": "{ERROR_CODE}",
  "code": 422,
  "message": "Human-readable summary",
  "details": [
    {
      "field": "fieldName",
      "constraint": "REQUIRED",
      "message": "Field is required"
    }
  ],
  "traceId": "uuid-for-log-correlation"
}
```

#### 3.6 Validation Rules

**VAL-001** {Validation Boundary}

{e.g. "Input validation occurs at the API boundary before business logic."}

**VAL-002** {Input Sanitization}

{e.g. "All string inputs are trimmed and sanitized against XSS."}

**VAL-003** {Date Format}

{e.g. "Date fields use ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)."}

---

### 4. Usability

**USAB-001** {Responsive Design}

{e.g. "The UI must be responsive and functional on viewports >= 375px."}

**USAB-002** {Inline Validation Feedback}

{e.g. "All forms provide inline validation feedback within 300ms."}

**USAB-003** {Accessibility Standard}

{e.g. "The system meets WCAG 2.1 Level AA accessibility standards."}

**USAB-004** {Loading State Feedback}

{e.g. "Loading states are shown for any operation taking > 500ms."}

---

### 5. Reliability

**REL-001** {Uptime Target}

{e.g. "System uptime target: 99.9% (excluding planned maintenance)."}

**REL-002** {Transaction Integrity}

{e.g. "All database writes use transactions with automatic rollback on failure."}

**REL-003** {Transient Failure Recovery}

{e.g. "The system recovers gracefully from transient failures (DB, network) with retry logic."}

**REL-004** {Backup Testing}

{e.g. "Backup and restore procedures are tested monthly."}

**REL-005** {Recovery Time}

{e.g. "Mean Time to Recovery (MTTR) target: < 1 hour."}

---

### 6. Performance

**PERF-001** {API Response Time}

{e.g. "API response time: < 200ms at 95th percentile under normal load."}

**PERF-002** {Page Load Time}

{e.g. "Page load time (LCP): < 2.5 seconds on 4G connections."}

**PERF-003** {Concurrent User Support}

{e.g. "The system supports 500 concurrent users without degradation."}

**PERF-004** {Query Performance}

{e.g. "Database queries must not exceed 100ms; use indexes and query plans."}

**PERF-005** {Bulk Operation Handling}

{e.g. "Bulk operations (> 100 records) execute asynchronously."}

**Scalability Targets:**

| Metric                | Current Target | Growth Target (12 months) |
| --------------------- | -------------- | ------------------------- |
| Concurrent Users      | {500}          | {2,000}                   |
| Records in DB         | {100,000}      | {1,000,000}               |
| API Requests / Second | {100}          | {500}                     |

---

### 7. Supportability

**SUP-001** {Code Style Enforcement}

{e.g. "Code follows {language} style guide and passes linting on CI."}

**SUP-002** {API Documentation}

{e.g. "All public API endpoints have OpenAPI 3.0 documentation."}

**SUP-003** {Test Coverage}

{e.g. "Unit test coverage: >= 80%. Integration test coverage: >= 60%."}

**SUP-004** {Health Check Endpoint}

{e.g. "Health check endpoint (`GET /health`) reports service status."}

**SUP-005** {Configuration Management}

{e.g. "Configuration is externalized via environment variables (12-factor)."}

**SUP-006** {Schema Migrations}

{e.g. "Database schema changes are managed via versioned migrations."}

**Coding Standards:**

| Concern              | Standard                                                       |
| -------------------- | -------------------------------------------------------------- |
| Language / Framework | {e.g. "TypeScript 5.x / Next.js 14"}                           |
| Code Style           | {e.g. "ESLint + Prettier with project config"}                 |
| Naming Conventions   | {e.g. "camelCase for variables, PascalCase for types/classes"} |
| File Organization    | {e.g. "Feature-based folder structure"}                        |
| Commit Messages      | {e.g. "Conventional Commits format"}                           |

---

### 8. Design Constraints

> Architectural and design decisions that constrain implementation.

**DC-001** {Layered Architecture}

{e.g. "The system follows a layered architecture: Controller → Service → Repository."}

**DC-002** {Inter-Service Communication}

{e.g. "All inter-service communication uses REST over HTTPS."}

**DC-003** {Controller Responsibility}

{e.g. "No business logic in controllers — controllers only validate input and delegate."}

**DC-004** {Domain Model Purity}

{e.g. "Domain entities are persistence-agnostic (no ORM annotations in domain layer)."}

**Architecture Diagram (optional):**

```
[Client (Browser/App)]
        │
        ▼
[API Gateway / Load Balancer]
        │
        ▼
[Application Server]
   ├── Controllers (HTTP boundary)
   ├── Services (business logic)
   ├── Repositories (data access)
   └── Domain Models (entities, value objects)
        │
        ▼
[Database]    [Cache]    [Message Queue]    [External APIs]
```

---

### 9. Technology Stack

> Specify the mandatory technology choices. This prevents AI agents from making incompatible technology decisions.

| Layer             | Technology                 | Version  | Notes                       |
| ----------------- | -------------------------- | -------- | --------------------------- |
| Language          | {e.g. TypeScript}          | {5.x}    |                             |
| Runtime           | {e.g. Node.js}             | {20 LTS} |                             |
| Web Framework     | {e.g. Next.js}             | {14.x}   |                             |
| Database          | {e.g. PostgreSQL}          | {16.x}   |                             |
| ORM / Data Access | {e.g. Prisma}              | {5.x}    |                             |
| Cache             | {e.g. Redis}               | {7.x}    | {Session + query cache}     |
| Message Queue     | {e.g. RabbitMQ}            | {3.x}    | {Async jobs, notifications} |
| Testing           | {e.g. Vitest + Playwright} | {latest} |                             |
| CI/CD             | {e.g. GitHub Actions}      | {N/A}    |                             |
| Hosting           | {e.g. Docker on AWS ECS}   | {N/A}    |                             |

---

### 10. Integration Interfaces

> External systems the application communicates with. Defines contracts so AI agents generate correct integration code.

#### 10.1 {External System Name}

| Field              | Value                                                     |
| ------------------ | --------------------------------------------------------- |
| **Direction**      | Inbound / Outbound / Bidirectional                        |
| **Protocol**       | {REST / GraphQL / gRPC / WebSocket / SMTP / etc.}         |
| **Base URL**       | {e.g. `https://api.external-service.com/v2`}              |
| **Authentication** | {e.g. "API Key via `X-API-Key` header"}                   |
| **Rate Limits**    | {e.g. "100 requests/minute"}                              |
| **Retry Policy**   | {e.g. "3 retries with exponential backoff (1s, 2s, 4s)"}  |
| **Timeout**        | {e.g. "5 seconds"}                                        |
| **Fallback**       | {e.g. "Return cached data if available; else return 503"} |

**Key Endpoints Used:**

| Method | Path           | Purpose                  |
| ------ | -------------- | ------------------------ |
| GET    | /resource/{id} | {Fetch resource details} |
| POST   | /resource      | {Create new resource}    |

---

### 11. Data Architecture

#### 11.1 Persistence Strategy

| Concern          | Approach                                                     |
| ---------------- | ------------------------------------------------------------ |
| Primary Database | {e.g. "PostgreSQL — relational data"}                        |
| Migrations       | {e.g. "Prisma Migrate — versioned, forward-only"}            |
| Soft Deletes     | {e.g. "Use `deletedAt` timestamp; never hard delete"}        |
| Timestamps       | {e.g. "All entities have `createdAt` and `updatedAt` (UTC)"} |
| ID Strategy      | {e.g. "UUID v4 for primary keys"}                            |

#### 11.2 Caching Strategy

| Concern            | Approach                                                      |
| ------------------ | ------------------------------------------------------------- |
| Cache Layer        | {e.g. "Redis"}                                                |
| Cache Invalidation | {e.g. "Write-through for critical data; TTL for read caches"} |
| Default TTL        | {e.g. "300 seconds"}                                          |
| Cache Key Pattern  | {e.g. "`{entity}:{id}` or `{entity}:list:{hash}`"}            |

#### 11.3 Data Retention & Privacy

**DATA-001** {Encryption at Rest}

{e.g. "Personal data is encrypted at rest (AES-256)."}

**DATA-002** {Data Portability}

{e.g. "User data can be exported in JSON format (GDPR Art. 20)."}

**DATA-003** {Right to Erasure}

{e.g. "User data is fully deletable upon request (GDPR Art. 17)."}

---

### 12. Security

**SEC-001** {Transport Security}

{e.g. "All communication uses TLS 1.2+."}

**SEC-002** {Password Hashing}

{e.g. "Passwords are hashed using bcrypt with cost factor 12."}

**SEC-003** {SQL Injection Prevention}

{e.g. "SQL injection prevention via parameterized queries (enforced by ORM)."}

**SEC-004** {CSRF Protection}

{e.g. "CSRF protection on all state-changing endpoints."}

**SEC-005** {Content Security Policy}

{e.g. "Content Security Policy (CSP) headers configured."}

**SEC-006** {Secret Management}

{e.g. "Secrets stored in environment variables, never in code."}

**SEC-007** {Dependency Scanning}

{e.g. "Dependency vulnerability scanning runs on every CI build."}

**Security Headers:**

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'; script-src 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
```

---

### 13. Internationalization (i18n) & Localization (l10n)

**I18N-001** {String Externalization}

{e.g. "All user-facing strings are externalized in locale files."}

**I18N-002** {Supported Locales}

{e.g. "Supported locales: en-US, de-DE."}

**I18N-003** {Timezone Handling}

{e.g. "Date/time displayed in user's local timezone."}

**I18N-004** {Number & Currency Formatting}

{e.g. "Number and currency formatting follows locale conventions."}

---

### 14. Legal & Compliance

**LEGAL-001** {GDPR Compliance}

{e.g. "System complies with GDPR for EU user data."}

**LEGAL-002** {Cookie Consent}

{e.g. "Cookie consent banner required before non-essential cookies."}

**LEGAL-003** {Terms of Service Recording}

{e.g. "Terms of Service acceptance is recorded with timestamp."}

---

### 15. Glossary

> Define domain-specific terms to ensure consistent naming in code (class names, variable names, API fields).

| Term               | Definition                                           | Code Identifier |
| ------------------ | ---------------------------------------------------- | --------------- |
| {e.g. "Tenant"}    | {An organizational account that owns multiple users} | `Tenant`        |
| {e.g. "Workspace"} | {A project-level container within a Tenant}          | `Workspace`     |
| {e.g. "Artifact"}  | {A versioned output document produced by a process}  | `Artifact`      |
