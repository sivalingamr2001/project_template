using Server.Domain.Entities;
using Server.Features.Notifications;
using Server.Shared.Helpers;

namespace Server.Features.AccessRequests.Common;

/// <summary>
/// Service to handle email notifications for access request approval stages
/// </summary>
public interface IAccessRequestEmailNotificationService
{
    Task SendRequestSubmittedEmailAsync(AccessRequestEntity request, EmployeeEntity requester, EmployeeEntity hodApprover, CancellationToken cancellationToken);
    Task SendHodApprovalEmailAsync(AccessRequestEntity request, AccessItemEntity item, EmployeeEntity approver, EmployeeEntity requester, string comments, CancellationToken cancellationToken);
    Task SendHodRejectionEmailAsync(AccessRequestEntity request, AccessItemEntity item, EmployeeEntity approver, EmployeeEntity requester, string comments, CancellationToken cancellationToken);
    Task SendItApprovalEmailAsync(AccessRequestEntity request, AccessItemEntity item, EmployeeEntity approver, EmployeeEntity requester, CancellationToken cancellationToken);
    Task SendItRejectionEmailAsync(AccessRequestEntity request, AccessItemEntity item, EmployeeEntity approver, EmployeeEntity requester, string comments, CancellationToken cancellationToken);
}

public class AccessRequestEmailNotificationService : IAccessRequestEmailNotificationService
{
    private readonly IEmailService _emailService;
    private readonly ILogger<AccessRequestEmailNotificationService> _logger;
    private const string FromEmail = "feedback@janatics.co.in";
    private const string ProgramName = "AccessRequestApproval";

    public AccessRequestEmailNotificationService(IEmailService emailService, ILogger<AccessRequestEmailNotificationService> logger)
    {
        _emailService = emailService ?? throw new ArgumentNullException(nameof(emailService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task SendRequestSubmittedEmailAsync(
        AccessRequestEntity request,
        EmployeeEntity requester,
        EmployeeEntity hodApprover,
        CancellationToken cancellationToken)
    {
        try
        {
            var subject = $"New Access Request #{request.AccessReqId} - Awaiting HOD Approval";
            var body = BuildRequestSubmittedEmailBody(request, requester, hodApprover);

            var emailRequest = new EmailNotificationRequest
            {
                MailFrom = FromEmail,
                MailTo = hodApprover.Email,
                MailCc = requester.Email,
                MailSubject = subject,
                MailBody = body,
                MailProgram = $"{ProgramName}_RequestSubmitted"
            };

            var response = await _emailService.SendEmailAsync(emailRequest, cancellationToken);

            if (response.IsSuccessful)
                _logger.LogInformation("Request submitted email sent for Request ID: {RequestId} to HOD: {HodEmail}", request.AccessReqId, hodApprover.Email);
            else
                _logger.LogWarning("Failed to send request submitted email. Error: {Error}", response.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending request submitted email for Request ID: {RequestId}", request.AccessReqId);
        }
    }

    public async Task SendHodApprovalEmailAsync(
        AccessRequestEntity request,
        AccessItemEntity item,
        EmployeeEntity approver,
        EmployeeEntity requester,
        string comments,
        CancellationToken cancellationToken)
    {
        try
        {
            var subject = $"Access Request #{request.AccessReqId} - Approved by HOD";
            var body = BuildHodApprovalEmailBody(request, item, approver, requester, comments);

            var emailRequest = new EmailNotificationRequest
            {
                MailFrom = FromEmail,
                MailTo = requester.Email,
                MailCc = approver.Email,
                MailSubject = subject,
                MailBody = body,
                MailProgram = $"{ProgramName}_HodApproved"
            };

            var response = await _emailService.SendEmailAsync(emailRequest, cancellationToken);

            if (response.IsSuccessful)
                _logger.LogInformation("HOD approval email sent for Request ID: {RequestId}, Item ID: {ItemId}", request.AccessReqId, item.AccessItemId);
            else
                _logger.LogWarning("Failed to send HOD approval email. Error: {Error}", response.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending HOD approval email for Request ID: {RequestId}", request.AccessReqId);
        }
    }

    public async Task SendHodRejectionEmailAsync(
        AccessRequestEntity request,
        AccessItemEntity item,
        EmployeeEntity approver,
        EmployeeEntity requester,
        string comments,
        CancellationToken cancellationToken)
    {
        try
        {
            var subject = $"Access Request #{request.AccessReqId} - Rejected by HOD";
            var body = BuildHodRejectionEmailBody(request, item, approver, requester, comments);

            var emailRequest = new EmailNotificationRequest
            {
                MailFrom = FromEmail,
                MailTo = requester.Email,
                MailCc = approver.Email,
                MailSubject = subject,
                MailBody = body,
                MailProgram = $"{ProgramName}_HodRejected"
            };

            var response = await _emailService.SendEmailAsync(emailRequest, cancellationToken);

            if (response.IsSuccessful)
                _logger.LogInformation("HOD rejection email sent for Request ID: {RequestId}, Item ID: {ItemId}", request.AccessReqId, item.AccessItemId);
            else
                _logger.LogWarning("Failed to send HOD rejection email. Error: {Error}", response.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending HOD rejection email for Request ID: {RequestId}", request.AccessReqId);
        }
    }

    public async Task SendItApprovalEmailAsync(
        AccessRequestEntity request,
        AccessItemEntity item,
        EmployeeEntity approver,
        EmployeeEntity requester,
        CancellationToken cancellationToken)
    {
        try
        {
            var subject = $"Access Request #{request.AccessReqId} - Approved by IT";
            var body = BuildItApprovalEmailBody(request, item, approver, requester);

            var emailRequest = new EmailNotificationRequest
            {
                MailFrom = FromEmail,
                MailTo = requester.Email,
                MailCc = approver.Email,
                MailSubject = subject,
                MailBody = body,
                MailProgram = $"{ProgramName}_ItApproved"
            };

            var response = await _emailService.SendEmailAsync(emailRequest, cancellationToken);

            if (response.IsSuccessful)
                _logger.LogInformation("IT approval email sent for Request ID: {RequestId}, Item ID: {ItemId}", request.AccessReqId, item.AccessItemId);
            else
                _logger.LogWarning("Failed to send IT approval email. Error: {Error}", response.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending IT approval email for Request ID: {RequestId}", request.AccessReqId);
        }
    }

    public async Task SendItRejectionEmailAsync(
        AccessRequestEntity request,
        AccessItemEntity item,
        EmployeeEntity approver,
        EmployeeEntity requester,
        string comments,
        CancellationToken cancellationToken)
    {
        try
        {
            var subject = $"Access Request #{request.AccessReqId} - Rejected by IT";
            var body = BuildItRejectionEmailBody(request, item, approver, requester, comments);

            var emailRequest = new EmailNotificationRequest
            {
                MailFrom = FromEmail,
                MailTo = requester.Email,
                MailCc = approver.Email,
                MailSubject = subject,
                MailBody = body,
                MailProgram = $"{ProgramName}_ItRejected"
            };

            var response = await _emailService.SendEmailAsync(emailRequest, cancellationToken);

            if (response.IsSuccessful)
                _logger.LogInformation("IT rejection email sent for Request ID: {RequestId}, Item ID: {ItemId}", request.AccessReqId, item.AccessItemId);
            else
                _logger.LogWarning("Failed to send IT rejection email. Error: {Error}", response.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending IT rejection email for Request ID: {RequestId}", request.AccessReqId);
        }
    }

    private string BuildRequestSubmittedEmailBody(AccessRequestEntity request, EmployeeEntity requester, EmployeeEntity hodApprover)
    {
        return $@"
<!DOCTYPE html>
<html>
<body>
    <h3>Access Request Submitted</h3>
    <p>Dear {hodApprover.FirstName},</p>
    <p>A new access request has been submitted for your approval.</p>
    
    <table border='1' cellpadding='10'>
        <tr>
            <td><strong>Request ID:</strong></td>
            <td>#{request.AccessReqId}</td>
        </tr>
        <tr>
            <td><strong>Requester:</strong></td>
            <td>{requester.FirstName} {requester.LastName} ({requester.UserName})</td>
        </tr>
        <tr>
            <td><strong>Employee ID:</strong></td>
            <td>{requester.EmployeeId}</td>
        </tr>
        <tr>
            <td><strong>Department:</strong></td>
            <td>{requester.Department?.DepartmentName}</td>
        </tr>
        <tr>
            <td><strong>ITSR Number:</strong></td>
            <td>{request.ItsrNo}</td>
        </tr>
        <tr>
            <td><strong>Submitted On:</strong></td>
            <td>{request.CreatedOn:dd-MM-yyyy HH:mm:ss}</td>
        </tr>
    </table>
    
    <p>Please review the request and take appropriate action.</p>
    <p>Regards,<br>Access Management System</p>
</body>
</html>";
    }

    private string BuildHodApprovalEmailBody(AccessRequestEntity request, AccessItemEntity item, EmployeeEntity approver, EmployeeEntity requester, string comments)
    {
        return $@"
<!DOCTYPE html>
<html>
<body>
    <h3>Access Request Approved by HOD</h3>
    <p>Dear {requester.FirstName},</p>
    <p>Your access request has been approved by HOD.</p>
    
    <table border='1' cellpadding='10'>
        <tr>
            <td><strong>Request ID:</strong></td>
            <td>#{request.AccessReqId}</td>
        </tr>
        <tr>
            <td><strong>Item ID:</strong></td>
            <td>{item.AccessItemId}</td>
        </tr>
        <tr>
            <td><strong>Folder Path:</strong></td>
            <td>{item.FolderPath}</td>
        </tr>
        <tr>
            <td><strong>Access Type:</strong></td>
            <td>{item.ConfirmAccessType}</td>
        </tr>
        <tr>
            <td><strong>Reason:</strong></td>
            <td>{item.Reason}</td>
        </tr>
        <tr>
            <td><strong>Approved By:</strong></td>
            <td>{approver.FirstName} {approver.LastName}</td>
        </tr>
        <tr>
            <td><strong>HOD Comments:</strong></td>
            <td>{comments}</td>
        </tr>
        <tr>
            <td><strong>Status:</strong></td>
            <td>Now awaiting IT approval</td>
        </tr>
    </table>
    
    <p>Regards,<br>Access Management System</p>
</body>
</html>";
    }

    private string BuildHodRejectionEmailBody(AccessRequestEntity request, AccessItemEntity item, EmployeeEntity approver, EmployeeEntity requester, string comments)
    {
        return $@"
<!DOCTYPE html>
<html>
<body>
    <h3>Access Request Rejected by HOD</h3>
    <p>Dear {requester.FirstName},</p>
    <p>Unfortunately, your access request has been rejected.</p>
    
    <table border='1' cellpadding='10'>
        <tr>
            <td><strong>Request ID:</strong></td>
            <td>#{request.AccessReqId}</td>
        </tr>
        <tr>
            <td><strong>Item ID:</strong></td>
            <td>{item.AccessItemId}</td>
        </tr>
        <tr>
            <td><strong>Folder Path:</strong></td>
            <td>{item.FolderPath}</td>
        </tr>
        <tr>
            <td><strong>Rejected By:</strong></td>
            <td>{approver.FirstName} {approver.LastName}</td>
        </tr>
        <tr>
            <td><strong>Reason for Rejection:</strong></td>
            <td>{comments}</td>
        </tr>
    </table>
    
    <p>If you believe this is incorrect, please contact your HOD or the IT support team.</p>
    <p>Regards,<br>Access Management System</p>
</body>
</html>";
    }

    private string BuildItApprovalEmailBody(AccessRequestEntity request, AccessItemEntity item, EmployeeEntity approver, EmployeeEntity requester)
    {
        return $@"
<!DOCTYPE html>
<html>
<body>
    <h3>Access Request Approved by IT - Access Granted</h3>
    <p>Dear {requester.FirstName},</p>
    <p>Your access request has been approved and access has been granted.</p>
    
    <table border='1' cellpadding='10'>
        <tr>
            <td><strong>Request ID:</strong></td>
            <td>#{request.AccessReqId}</td>
        </tr>
        <tr>
            <td><strong>Item ID:</strong></td>
            <td>{item.AccessItemId}</td>
        </tr>
        <tr>
            <td><strong>Folder Path:</strong></td>
            <td>{item.FolderPath}</td>
        </tr>
        <tr>
            <td><strong>Access Type Granted:</strong></td>
            <td>{item.AccessType}</td>
        </tr>
        <tr>
            <td><strong>Approved By:</strong></td>
            <td>{approver.FirstName} {approver.LastName}</td>
        </tr>
        <tr>
            <td><strong>Status:</strong></td>
            <td>Access Granted</td>
        </tr>
    </table>
    
    <p>You should now have access to the requested resource. If you don't, please contact IT support.</p>
    <p>Regards,<br>Access Management System</p>
</body>
</html>";
    }

    private string BuildItRejectionEmailBody(AccessRequestEntity request, AccessItemEntity item, EmployeeEntity approver, EmployeeEntity requester, string comments)
    {
        return $@"
<!DOCTYPE html>
<html>
<body>
    <h3>Access Request Rejected by IT</h3>
    <p>Dear {requester.FirstName},</p>
    <p>Your access request has been rejected by the IT team.</p>
    
    <table border='1' cellpadding='10'>
        <tr>
            <td><strong>Request ID:</strong></td>
            <td>#{request.AccessReqId}</td>
        </tr>
        <tr>
            <td><strong>Item ID:</strong></td>
            <td>{item.AccessItemId}</td>
        </tr>
        <tr>
            <td><strong>Folder Path:</strong></td>
            <td>{item.FolderPath}</td>
        </tr>
        <tr>
            <td><strong>Rejected By:</strong></td>
            <td>{approver.FirstName} {approver.LastName}</td>
        </tr>
        <tr>
            <td><strong>Reason for Rejection:</strong></td>
            <td>{comments}</td>
        </tr>
    </table>
    
    <p>If you believe this is incorrect, please contact IT support.</p>
    <p>Regards,<br>Access Management System</p>
</body>
</html>";
    }
}
