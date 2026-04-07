# Access Management — EF Core Setup

This sample has been aligned to the latest four-table request design documented in [table.MD](./table.MD):

- `AccessRequests`
- `AccessItems`
- `AccessItemReviews`
- `RequestAuditTrail`

The supporting employee and department master data can still live in separate tables or services, but the access workflow persistence is centered on those four tables.

## Register in Program.cs

```csharp
builder.Services.AddDbContext<AccessManagementDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<AccessWorkflowService>();
```

## First Migration

```bash
dotnet ef migrations add InitialCreate --project Infrastructure --startup-project API
dotnet ef database update
```

## Updated Mapping

| Table | Purpose |
|---|---|
| `AccessRequests` | One row per submitted request header |
| `AccessItems` | One row per requested folder or file access line |
| `AccessItemReviews` | HOD and IT review entries for each item |
| `RequestAuditTrail` | Immutable request-level business events |

## Key Design Decisions

| Decision | Rationale |
|---|---|
| Enums stored as strings | Database stays readable and traceable |
| `AggregateStatus` derived in service | Prevents request header from drifting away from item states |
| Resubmission stored as a new `AccessItems` row | Keeps full history without mutating previous items |
| `ParentAccessItemId` links resubmissions | Simple lineage for retried access items |
| `AccessItemReviews` stores stage + reviewer + note only | Outcome is represented by the current item status |
| `RequestAuditTrail` is append-only | Full workflow story is preserved per request |

## Workflow Enforcement (AccessWorkflowService)

```text
Submit request
  -> AccessRequest.AggregateStatus = Pending
  -> AccessItems.Status = PendingHodReview

HOD review
  -> Approve: AccessItems.Status = PendingItReview
  -> Reject : AccessItems.Status = Rejected
  -> Review row added to AccessItemReviews
  -> Audit row added to RequestAuditTrail

IT review
  -> Approve: AccessItems.Status = Granted
               AccessItems.ApprovedUntilUtc = now + 365 days
  -> Reject : AccessItems.Status = Rejected
  -> Review row added to AccessItemReviews
  -> Audit row added to RequestAuditTrail

Resubmission
  -> New AccessItems row
  -> ParentAccessItemId points to the rejected item
  -> ResubmissionCount increments on the new row

Expiry job
  -> Granted items older than ApprovedUntilUtc become Expired
  -> Audit row added to RequestAuditTrail
```

## Ticket Number Generation

Generate `TicketNumber` before inserting `AccessRequest`:

```csharp
var count = await db.AccessRequests.CountAsync();
request.TicketNumber = $"FAR-{(count + 1):D4}";
```
