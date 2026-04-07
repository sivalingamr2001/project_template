1. AccessRequests (Main Header)

| Column | Data Type | Notes |
|---|---|---|
| RequestId | INT (PK) | Unique ID |
| TicketNumber | VARCHAR(20) | Example: `FAR-1001` |
| RequesterId | INT | Employee ID of requester |
| DepartmentId | INT | Department owning the request |
| AggregateStatus | VARCHAR(20) | `Pending`, `Granted`, `Rejected` |
| IsActive | BIT / BOOLEAN | Soft delete flag, default `1` |
| CreatedOn | DATETIME | Created timestamp |
| CreatedBy | INT | Actor who created the request |
| UpdatedOn | DATETIME | Last modified timestamp |
| ModifiedBy | INT | Last actor who modified the request |

2. AccessItems (Request Details)

| Column | Data Type | Notes |
|---|---|---|
| AccessItemId | INT (PK) | Unique item ID |
| RequestId | INT (FK) | Links to `AccessRequests` |
| FileName | VARCHAR(255) | Folder or share name |
| FolderPath | TEXT | Full folder path |
| AccessType | VARCHAR(50) | `Read`, `Write`, `ReadWrite` |
| Status | VARCHAR(20) | `PendingHodReview`, `PendingItReview`, `Granted`, `Rejected`, `Expired` |
| ApprovedUntilUtc | DATETIME | Populated only after IT grant |
| ParentAccessItemId | INT | Links resubmissions to the original item |
| ResubmissionCount | INT | Number of times the item has been resubmitted |
| IsActive | BIT / BOOLEAN | Soft delete flag, default `1` |
| CreatedOn | DATETIME | Created timestamp |
| CreatedBy | INT | Actor who created the item |
| UpdatedOn | DATETIME | Last modified timestamp |
| ModifiedBy | INT | Last actor who modified the item |

3. AccessItemReviews (Stage Review Log)

| Column | Data Type | Notes |
|---|---|---|
| ReviewId | INT (PK) | Unique review ID |
| AccessItemId | INT (FK) | Links to `AccessItems` |
| Stage | VARCHAR(20) | `Hod` or `ItTeam` |
| ReviewerId | INT | Reviewer employee ID |
| Note | TEXT | Reviewer comment |
| IsActive | BIT / BOOLEAN | Soft delete flag, default `1` |
| CreatedOn | DATETIME | Review timestamp |
| CreatedBy | INT | Same as reviewer in most cases |
| UpdatedOn | DATETIME | Optional update timestamp |
| ModifiedBy | INT | Optional last modifier |

4. RequestAuditTrail (Immutable History)

| Column | Data Type | Notes |
|---|---|---|
| AuditId | INT (PK) | Unique audit row ID |
| RequestId | INT (FK) | Links to `AccessRequests` |
| EventType | VARCHAR(50) | Example: `it.approved` |
| Message | TEXT | System-generated workflow message |
| IsActive | BIT / BOOLEAN | Always `1` for immutable rows |
| CreatedOn | DATETIME | Event timestamp |
| CreatedBy | INT | Actor ID, `0` for system events |
| UpdatedOn | DATETIME | Usually `NULL` for immutable rows |
| ModifiedBy | INT | Usually `NULL` for immutable rows |

Design Notes

- `AggregateStatus` is derived from active `AccessItems` and is not entered manually.
- Review outcomes are persisted on `AccessItems.Status`; `AccessItemReviews` stores who reviewed and the note for that stage.
- Resubmissions create a new `AccessItems` row tied back through `ParentAccessItemId`.
- `RequestAuditTrail` is append-only and records the business event history for the full request.
