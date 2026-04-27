using Server.Domain.Entities;
using Server.Features.Notifications;
using Server.Shared.Helpers;

namespace Server.Features.AccessRequests.Common;

/// <summary>
/// Service for managing access request expiration notifications.
/// Calculates expiration dates (365 days from granting) and logs notifications
/// 7 days before expiration to both employee and manager.
/// </summary>
public interface IAccessRequestExpirationService
{
    /// <summary>
    /// Create expiration tracking record when access is granted.
    /// Uses the approval entity's ModifiedOn (if available) or CreatedOn timestamp.
    /// </summary>
    Task<int> CreateExpirationTrackingAsync(
        int accessItemId,
        int accessReqId,
        AccessApprovalEntity approval,
        CancellationToken cancellationToken);

    /// <summary>
    /// Log expiration notification emails 7 days before expiration
    /// </summary>
    Task<bool> LogExpirationNotificationAsync(
        int expirationId,
        string employeeEmail,
        string employeeName,
        string managerEmail,
        string managerName,
        string folderPath,
        DateTime expirationDate,
        CancellationToken cancellationToken);

    /// <summary>
    /// Check for pending notifications and process them
    /// </summary>
    Task ProcessPendingExpirationNotificationsAsync(CancellationToken cancellationToken);

    /// <summary>
    /// Mark notification as sent
    /// </summary>
    Task<bool> MarkNotificationAsSentAsync(int expirationId, CancellationToken cancellationToken);
}

public class AccessRequestExpirationService : IAccessRequestExpirationService
{
    private readonly IEmailService _emailService;
    private readonly ILogger<AccessRequestExpirationService> _logger;
    private const int ExpirationDays = 365;
    private const int NotificationAdvanceDays = 7;
    private const string MailProgram = "AccessRequest_ExpirationNotification";
    private const string FromEmail = "feedback@janatics.co.in";

    public AccessRequestExpirationService(IEmailService emailService, ILogger<AccessRequestExpirationService> logger)
    {
        _emailService = emailService ?? throw new ArgumentNullException(nameof(emailService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// Create expiration tracking record when access is granted (IT approval).
    /// Uses the approval's ModifiedOn timestamp if available, otherwise CreatedOn.
    /// Expiration = GrantedDate + 365 days
    /// NotificationDate = ExpirationDate - 7 days
    /// </summary>
    public async Task<int> CreateExpirationTrackingAsync(
        int accessItemId,
        int accessReqId,
        AccessApprovalEntity approval,
        CancellationToken cancellationToken)
    {
        if (approval == null)
            throw new ArgumentNullException(nameof(approval), "Access approval entity is required");

        try
        {
            // Use ModifiedOn if available (most recent update), otherwise use CreatedOn
            var grantedDate = approval.ModifiedOn ?? approval.CreatedOn;
            var expirationDate = grantedDate.AddDays(ExpirationDays);
            var notificationDate = expirationDate.AddDays(-NotificationAdvanceDays);

            _logger.LogInformation(
                "Creating expiration tracking: AccessItemId={AccessItemId}, ApprovalId={ApprovalId}, GrantedDate={GrantedDate}, ExpirationDate={ExpirationDate}, NotificationDate={NotificationDate}",
                accessItemId,
                approval.AccessApproveId,
                grantedDate,
                expirationDate,
                notificationDate);

            // TODO: Insert into AccessRequestExpiration table via EF Core or Dapper
            // For now, return a placeholder
            var expirationId = 0; // This would be returned from database insert
            return expirationId;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating expiration tracking for AccessItemId: {AccessItemId}", accessItemId);
            throw;
        }
    }

    /// <summary>
    /// Log expiration notification emails to be sent 7 days before access expires.
    /// Sends to both employee and their manager.
    /// </summary>
    public async Task<bool> LogExpirationNotificationAsync(
        int expirationId,
        string employeeEmail,
        string employeeName,
        string managerEmail,
        string managerName,
        string folderPath,
        DateTime expirationDate,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(employeeEmail))
            throw new ArgumentException("Employee email is required", nameof(employeeEmail));

        if (string.IsNullOrWhiteSpace(managerEmail))
            throw new ArgumentException("Manager email is required", nameof(managerEmail));

        try
        {
            var notificationBody = BuildExpirationNotificationBody(employeeName, managerName, folderPath, expirationDate);
            var subject = $"Access Expiration Notice - {folderPath} expires on {expirationDate:dd-MMM-yyyy}";

            // Send to employee
            var employeeEmailRequest = new EmailNotificationRequest
            {
                MailFrom = FromEmail,
                MailTo = employeeEmail,
                MailCc = managerEmail,
                MailSubject = subject,
                MailBody = notificationBody,
                MailProgram = MailProgram
            };

            var employeeResponse = await _emailService.SendEmailAsync(employeeEmailRequest, cancellationToken);

            if (!employeeResponse.IsSuccessful)
            {
                _logger.LogWarning("Failed to log expiration notification for employee {EmployeeEmail}. Error: {Error}",
                    employeeEmail, employeeResponse.Message);
                return false;
            }

            // Send copy to manager
            var managerEmailRequest = new EmailNotificationRequest
            {
                MailFrom = FromEmail,
                MailTo = managerEmail,
                MailCc = employeeEmail,
                MailSubject = $"[Manager] {subject}",
                MailBody = BuildExpirationNotificationBodyForManager(employeeName, managerName, folderPath, expirationDate),
                MailProgram = MailProgram
            };

            var managerResponse = await _emailService.SendEmailAsync(managerEmailRequest, cancellationToken);

            if (!managerResponse.IsSuccessful)
            {
                _logger.LogWarning("Failed to log expiration notification for manager {ManagerEmail}. Error: {Error}",
                    managerEmail, managerResponse.Message);
                return false;
            }

            _logger.LogInformation("Expiration notification logged for ExpirationId: {ExpirationId}, Employee: {EmployeeEmail}, Manager: {ManagerEmail}",
                expirationId, employeeEmail, managerEmail);

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error logging expiration notification for ExpirationId: {ExpirationId}", expirationId);
            throw;
        }
    }

    /// <summary>
    /// Check for pending notifications and log them to the database.
    /// This would typically be called by a background job/scheduler.
    /// </summary>
    public async Task ProcessPendingExpirationNotificationsAsync(CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Starting to process pending expiration notifications");

            // TODO: Query AccessRequestExpiration table for records where:
            // - NotificationSent = 0
            // - NotificationDate <= NOW()
            // - ExpirationDate > NOW() (not yet expired)
            // - IsRenewed = 0 (not renewed)
            // 
            // For each record:
            // 1. Load employee and manager info
            // 2. Call LogExpirationNotificationAsync
            // 3. Call MarkNotificationAsSentAsync

            _logger.LogInformation("Completed processing pending expiration notifications");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing pending expiration notifications");
        }
    }

    /// <summary>
    /// Mark expiration notification as sent in the database.
    /// </summary>
    public async Task<bool> MarkNotificationAsSentAsync(int expirationId, CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Marking notification as sent for ExpirationId: {ExpirationId}", expirationId);

            // TODO: Update AccessRequestExpiration table:
            // SET NotificationSent = 1, NotificationSentDate = NOW()
            // WHERE ExpirationId = @ExpirationId

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error marking notification as sent for ExpirationId: {ExpirationId}", expirationId);
            return false;
        }
    }

    /// <summary>
    /// Build HTML email body for employee expiration notification
    /// </summary>
    private string BuildExpirationNotificationBody(
        string employeeName,
        string managerName,
        string folderPath,
        DateTime expirationDate)
    {
        var daysUntilExpiration = (expirationDate - DateTime.Now).Days;

        return $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; color: #333; }}
        .header {{ background-color: #ff9800; color: white; padding: 20px; text-align: center; }}
        .content {{ padding: 20px; background-color: #f5f5f5; }}
        .alert {{ background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }}
        table {{ width: 100%; border-collapse: collapse; margin: 20px 0; }}
        td {{ padding: 10px; border: 1px solid #ddd; }}
        th {{ background-color: #f0f0f0; padding: 10px; border: 1px solid #ddd; text-align: left; }}
        .footer {{ text-align: center; font-size: 12px; color: #999; margin-top: 20px; }}
    </style>
</head>
<body>
    <div class='header'>
        <h2>Access Expiration Notice</h2>
    </div>
    
    <div class='content'>
        <p>Dear {employeeName},</p>
        
        <div class='alert'>
            <strong>⚠️ Your access to the following resource will expire in {daysUntilExpiration} days:</strong>
        </div>
        
        <table>
            <tr>
                <th>Resource Details</th>
                <th>Information</th>
            </tr>
            <tr>
                <td><strong>Folder/Resource:</strong></td>
                <td>{folderPath}</td>
            </tr>
            <tr>
                <td><strong>Expiration Date:</strong></td>
                <td>{expirationDate:dd-MMM-yyyy HH:mm:ss}</td>
            </tr>
            <tr>
                <td><strong>Days Remaining:</strong></td>
                <td>{daysUntilExpiration} days</td>
            </tr>
            <tr>
                <td><strong>Your Manager:</strong></td>
                <td>{managerName}</td>
            </tr>
        </table>
        
        <h3>Action Required</h3>
        <p>If you need to continue accessing this resource beyond {expirationDate:dd-MMM-yyyy}, please:</p>
        <ol>
            <li>Contact your manager ({managerName}) to request renewal</li>
            <li>Submit a new access request through the portal</li>
            <li>Submit the renewal request before {expirationDate:dd-MMM-yyyy}</li>
        </ol>
        
        <p>If you no longer need access to this resource, no action is required and your access will automatically expire on {expirationDate:dd-MMM-yyyy}.</p>
        
        <div class='footer'>
            <p>This is an automated notification from the Access Management System.</p>
            <p>For questions, contact your manager or IT Support.</p>
        </div>
    </div>
</body>
</html>";
    }

    /// <summary>
    /// Build HTML email body for manager expiration notification
    /// </summary>
    private string BuildExpirationNotificationBodyForManager(
        string employeeName,
        string managerName,
        string folderPath,
        DateTime expirationDate)
    {
        var daysUntilExpiration = (expirationDate - DateTime.Now).Days;

        return $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; color: #333; }}
        .header {{ background-color: #ff9800; color: white; padding: 20px; text-align: center; }}
        .content {{ padding: 20px; background-color: #f5f5f5; }}
        .alert {{ background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }}
        table {{ width: 100%; border-collapse: collapse; margin: 20px 0; }}
        td {{ padding: 10px; border: 1px solid #ddd; }}
        th {{ background-color: #f0f0f0; padding: 10px; border: 1px solid #ddd; text-align: left; }}
        .footer {{ text-align: center; font-size: 12px; color: #999; margin-top: 20px; }}
    </style>
</head>
<body>
    <div class='header'>
        <h2>Access Expiration Notice - Manager Review</h2>
    </div>
    
    <div class='content'>
        <p>Dear {managerName},</p>
        
        <div class='alert'>
            <strong>⚠️ Access expiration notification for your team member:</strong>
        </div>
        
        <p>The following employee's access to a resource will expire in {daysUntilExpiration} days:</p>
        
        <table>
            <tr>
                <th>Access Details</th>
                <th>Information</th>
            </tr>
            <tr>
                <td><strong>Employee Name:</strong></td>
                <td>{employeeName}</td>
            </tr>
            <tr>
                <td><strong>Folder/Resource:</strong></td>
                <td>{folderPath}</td>
            </tr>
            <tr>
                <td><strong>Expiration Date:</strong></td>
                <td>{expirationDate:dd-MMM-yyyy HH:mm:ss}</td>
            </tr>
            <tr>
                <td><strong>Days Remaining:</strong></td>
                <td>{daysUntilExpiration} days</td>
            </tr>
        </table>
        
        <h3>Manager Action Items</h3>
        <p>Please review and take appropriate action:</p>
        <ul>
            <li><strong>If renewal is needed:</strong> Ensure {employeeName} submits a renewal request before expiration</li>
            <li><strong>If access should be revoked:</strong> Notify IT to proceed with access removal after expiration</li>
            <li><strong>If access details need updating:</strong> Coordinate with {employeeName} on new access requirements</li>
        </ul>
        
        <p>The employee has also been notified of this impending expiration.</p>
        
        <div class='footer'>
            <p>This is an automated notification from the Access Management System.</p>
            <p>For questions or to process renewals, contact IT Support.</p>
        </div>
    </div>
</body>
</html>";
    }
}
