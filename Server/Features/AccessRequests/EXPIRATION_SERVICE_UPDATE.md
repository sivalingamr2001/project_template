# Updated Integration - AccessRequestExpirationService

## Method Signature Change

### Before

```csharp
Task<int> CreateExpirationTrackingAsync(
    int accessItemId,
    int accessReqId,
    DateTime grantedDate,
    CancellationToken cancellationToken);
```

### After

```csharp
Task<int> CreateExpirationTrackingAsync(
    int accessItemId,
    int accessReqId,
    AccessApprovalEntity approval,
    CancellationToken cancellationToken);
```

---

## Why This Change?

**Goal**: Use the actual approval timestamp rather than the current date/time.

**Benefit**:

- If an approval is modified (updated), we use the latest timestamp (ModifiedOn)
- If never modified, we use the creation timestamp (CreatedOn)
- This ensures expiration dates are based on when access was actually granted, not when we create the tracking record

**Calculation**:

```csharp
grantedDate = approval.ModifiedOn ?? approval.CreatedOn;
expirationDate = grantedDate + 365 days;
notificationDate = expirationDate - 7 days;
```

---

## Integration Example

### In ReviewByItAsync (When IT Approves)

```csharp
if (request.Approved)
{
    // Send IT approval email
    await emailNotificationService.SendItApprovalEmailAsync(
        accessRequest,
        accessItem,
        reviewer,
        requester,
        cancellationToken);

    // Retrieve the approval entity (fetch from database)
    var approval = await dbContext.AccessApprovals
        .FirstOrDefaultAsync(x => x.AccessItemId == accessItemId
            && x.AccessReqId == accessReqId,
            cancellationToken);

    if (approval != null)
    {
        // CREATE EXPIRATION TRACKING with approval entity
        try
        {
            var expirationId = await expirationService.CreateExpirationTrackingAsync(
                accessItem.AccessItemId,
                accessRequest.AccessReqId,
                approval,  // Pass the approval entity
                cancellationToken);

            var grantedDate = approval.ModifiedOn ?? approval.CreatedOn;
            var expirationDate = grantedDate.AddDays(365);

            _logger.LogInformation(
                "Access granted and expiration tracking created. " +
                "AccessItemId: {AccessItemId}, ExpirationId: {ExpirationId}, " +
                "Granted: {GrantedDate}, Expires: {ExpirationDate}",
                accessItem.AccessItemId,
                expirationId,
                grantedDate,
                expirationDate);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating expiration tracking for AccessItemId: {AccessItemId}",
                accessItem.AccessItemId);
            // Don't fail the approval if expiration tracking fails
        }
    }
}
```

---

## AccessApprovalEntity Structure

```csharp
public sealed class AccessApprovalEntity : BaseEntity
{
    public int AccessApproveId { get; set; }
    public int AccessReqId { get; set; }
    public int AccessItemId { get; set; }
    public int ApproverId { get; set; }
    public RequestStatus ApprovalStatus { get; set; }
    public string Comments { get; set; }

    // Inherited from BaseEntity
    public DateTime CreatedOn { get; set; }           // When approval was created
    public string CreatedBy { get; set; }
    public DateTime? ModifiedOn { get; set; }         // When approval was last updated
    public string? ModifiedBy { get; set; }
}
```

---

## Key Points

1. **Use ModifiedOn if available**: If the approval was updated, ModifiedOn is the latest timestamp
2. **Fall back to CreatedOn**: If ModifiedOn is null, use CreatedOn
3. **365 days from approval**: Expiration is calculated from the actual approval timestamp
4. **Database query**: Retrieve the AccessApprovalEntity from the database when needed

---

## Before & After Comparison

### Before (Current Implementation)

```csharp
// In ReviewByItAsync
var grantedDate = DateTime.Now;  // ❌ Current time when we create the tracking
var expirationId = await expirationService.CreateExpirationTrackingAsync(
    accessItem.AccessItemId,
    accessRequest.AccessReqId,
    grantedDate,  // Pass the current time
    cancellationToken);
```

### After (Updated Implementation)

```csharp
// In ReviewByItAsync
var approval = await dbContext.AccessApprovals
    .FirstOrDefaultAsync(...);  // ✅ Get the approval entity

var expirationId = await expirationService.CreateExpirationTrackingAsync(
    accessItem.AccessItemId,
    accessRequest.AccessReqId,
    approval,  // ✅ Pass the approval entity with its timestamps
    cancellationToken);

// Inside the service, it calculates:
// grantedDate = approval.ModifiedOn ?? approval.CreatedOn;
```

---

## Service Implementation

The service now handles the timestamp calculation internally:

```csharp
public async Task<int> CreateExpirationTrackingAsync(
    int accessItemId,
    int accessReqId,
    AccessApprovalEntity approval,
    CancellationToken cancellationToken)
{
    if (approval == null)
        throw new ArgumentNullException(nameof(approval));

    try
    {
        // ✅ Use ModifiedOn if available (most recent), otherwise CreatedOn
        var grantedDate = approval.ModifiedOn ?? approval.CreatedOn;
        var expirationDate = grantedDate.AddDays(365);
        var notificationDate = expirationDate.AddDays(-7);

        _logger.LogInformation(
            "Creating expiration tracking: AccessItemId={AccessItemId}, " +
            "GrantedDate={GrantedDate}, ExpirationDate={ExpirationDate}",
            accessItemId, grantedDate, expirationDate);

        // Insert into database...
        return expirationId;
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error creating expiration tracking");
        throw;
    }
}
```

---

## Benefits of This Approach

| Aspect                   | Before                            | After                              |
| ------------------------ | --------------------------------- | ---------------------------------- |
| **Timestamp Source**     | Current system time               | Approval entity's timestamps       |
| **Handles Updates**      | No                                | Yes (uses ModifiedOn if available) |
| **Accuracy**             | Approximate                       | Exact (based on actual approval)   |
| **Timestamp Precedence** | Always Now()                      | ModifiedOn > CreatedOn             |
| **Data Consistency**     | Created time could be hours later | Uses actual approval timestamp     |

---

## Quick Reference

```csharp
// Step 1: Get the approval entity
var approval = await dbContext.AccessApprovals
    .FirstOrDefaultAsync(x => x.AccessItemId == accessItemId
        && x.AccessReqId == accessReqId);

// Step 2: Pass it to the service
await expirationService.CreateExpirationTrackingAsync(
    accessItem.AccessItemId,
    accessRequest.AccessReqId,
    approval,  // Not a DateTime, but the full entity
    cancellationToken);

// Step 3: Service calculates internally
// grantedDate = approval.ModifiedOn ?? approval.CreatedOn
// expirationDate = grantedDate.AddDays(365)
// notificationDate = expirationDate.AddDays(-7)
```
