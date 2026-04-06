1. AccessRequests (Main Header)

Column Data Type Notes
RequestId INT (PK) Unique ID
TicketNumber VARCHAR(20) FAR-1001
RequesterId INT Anitha's ID
DepartmentId INT Finance ID
AggregateStatus VARCHAR(20) Granted/Pending/Rejected
IsActive BIT / BOOLEAN Default: 1 (True)
CreatedOn DATETIME Time of request creation
CreatedBy INT 1001 (Anitha)
UpdatedOn DATETIME Last update timestamp
ModifiedBy INT ID of last person who updated

2. AccessItems (Request Details)

Column Data Type Notes
AccessItemId INT (PK) Unique ID
RequestId INT (FK) Links to Header
FileName VARCHAR(255) Folder Name
FolderPath TEXT Full path
AccessType VARCHAR(50) Read/Write
Status VARCHAR(20) Item-specific status
ApprovedUntilUtc DATETIME Expiry date
ParentAccessItemId INT
ResubmissionCount INT
IsActive BIT / BOOLEAN Default: 1
CreatedOn DATETIME
CreatedBy INT
UpdatedOn DATETIME
ModifiedBy INT

3. AccessItemReviews (Approval Log)

Column Data Type Notes
ReviewId INT (PK)
AccessItemId INT (FK) Links to Item
Stage VARCHAR(20) "Hod" or "ItTeam"
ReviewerId INT Rahul (2001) or Sanjay (3001)
Note TEXT Comments
IsActive BIT / BOOLEAN Default: 1
CreatedOn DATETIME Time of approval
CreatedBy INT Reviewer's ID
UpdatedOn DATETIME
ModifiedBy INT

4. RequestAuditTrail (Immutable History)

Column Data Type Notes
AuditId INT (PK)
RequestId INT (FK)
EventType VARCHAR(50) e.g., it.approved
Message TEXT System generated message
IsActive BIT / BOOLEAN Default: 1
CreatedOn DATETIME Event timestamp
CreatedBy INT Actor ID
UpdatedOn DATETIME
ModifiedBy INT

Soft Deletes: IsActive allows you to "delete" a record without actually removing it from the database, maintaining data integrity for audits.
Audit Trail: The Created/Updated columns provide a quick look at the current state, while the RequestAuditTrail table provides the full story of how it got there.
Normalization: Splitting headers, items, and reviews prevents data duplication (e.g., you don't store "Anitha" or "Finance" multiple times for the same request).
