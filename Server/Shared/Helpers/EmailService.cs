using Dapper;
using Server.Features.Notifications;
using Server.Infrastructure.Oracle;

namespace Server.Shared.Helpers;

public interface IEmailService
{
    Task<EmailNotificationResponse> SendEmailAsync(EmailNotificationRequest request, CancellationToken cancellationToken = default);
    Task<EmailNotificationResponse> SendEmailAsync(
        string mailFrom,
        string mailTo,
        string mailSubject,
        string mailBody,
        string mailProgram,
        string? mailCc = null,
        CancellationToken cancellationToken = default);
}

public class EmailService : IEmailService
{
    private readonly IOracleService _oracleService;
    private readonly ILogger<EmailService> _logger;
    private const string MailTableName = "jan_mail_system";

    public EmailService(IOracleService oracleService, ILogger<EmailService> logger)
    {
        _oracleService = oracleService ?? throw new ArgumentNullException(nameof(oracleService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// Sends an email and logs it to the database.
    /// </summary>
    public async Task<EmailNotificationResponse> SendEmailAsync(EmailNotificationRequest request, CancellationToken cancellationToken = default)
    {
        if (request == null)
            throw new ArgumentNullException(nameof(request));

        return await SendEmailAsync(
            request.MailFrom,
            request.MailTo,
            request.MailSubject,
            request.MailBody,
            request.MailProgram,
            request.MailCc,
            cancellationToken);
    }

    /// <summary>
    /// Logs an email record to the jan_mail_system table.
    /// A background mail system monitors this table and sends emails automatically.
    /// This service is responsible for data validation and database logging only.
    /// </summary>
    public async Task<EmailNotificationResponse> SendEmailAsync(
        string mailFrom,
        string mailTo,
        string mailSubject,
        string mailBody,
        string mailProgram,
        string? mailCc = null,
        CancellationToken cancellationToken = default)
    {
        ValidateEmailParameters(mailFrom, mailTo, mailSubject, mailBody, mailProgram);

        var response = new EmailNotificationResponse();

        try
        {
            // Insert email record into database for background mail system to process
            var mailNo = await InsertMailRecordAsync(mailFrom, mailTo, mailSubject, mailBody, mailProgram, mailCc, cancellationToken);
            response.MailNo = (int)mailNo;
            response.IsSuccessful = true;
            response.Message = $"Email record logged successfully to jan_mail_system. Mail No: {mailNo}. Background system will send to {mailTo}.";
            _logger.LogInformation("Email record logged to database. MailNo: {MailNo}, To: {MailTo}, Program: {Program}", mailNo, mailTo, mailProgram);
        }
        catch (Exception ex)
        {
            response.IsSuccessful = false;
            response.Message = $"Error logging email to database: {ex.Message}";
            _logger.LogError(ex, "Error logging email record to database for {MailTo}", mailTo);
        }

        return response;
    }

    private async Task<long> InsertMailRecordAsync(
    string mailFrom, string mailTo, string mailSubject, string mailBody,
    string mailProgram, string? mailCc = null, CancellationToken cancellationToken = default)
    {
        const string insertSql = @"
        INSERT INTO jan_mail_system (
            mail_no, mail_date, mail_program, mail_from, 
            mail_to, mail_subject, mail_sent, mail_body, mail_cc
        )
        VALUES (
            jan_test_seq.nextval, :MailDate, :MailProgram, :MailFrom, 
            :MailTo, :MailSubject, :MailSent, :MailBody, :MailCc
        )
        RETURNING mail_no INTO :newId";

        var parameters = new DynamicParameters();
        parameters.Add("MailDate", DateTime.Now);
        parameters.Add("MailProgram", mailProgram);
        parameters.Add("MailFrom", mailFrom);
        parameters.Add("MailTo", mailTo);
        parameters.Add("MailSubject", mailSubject);
        parameters.Add("MailSent", 0);
        parameters.Add("MailBody", mailBody);
        parameters.Add("MailCc", mailCc ?? string.Empty);

        // FIX: Use DbType.Decimal to stop the OverflowException from the Oracle Driver
        parameters.Add("newId", dbType: System.Data.DbType.Decimal, direction: System.Data.ParameterDirection.Output, size: 38);

        try
        {
            await _oracleService.ExecuteAsync(insertSql, parameters, cancellationToken);

            // FIX: Retrieve as decimal first, then convert to long
            return Convert.ToInt64(parameters.Get<decimal>("newId"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Database error during mail insert.");
            throw;
        }
    }

    private void ValidateEmailParameters(string mailFrom, string mailTo, string mailSubject, string mailBody, string mailProgram)
    {
        if (string.IsNullOrWhiteSpace(mailFrom))
            throw new ArgumentException("Mail From cannot be null or empty.", nameof(mailFrom));

        if (string.IsNullOrWhiteSpace(mailTo))
            throw new ArgumentException("Mail To cannot be null or empty.", nameof(mailTo));

        if (string.IsNullOrWhiteSpace(mailSubject))
            throw new ArgumentException("Mail Subject cannot be null or empty.", nameof(mailSubject));

        if (string.IsNullOrWhiteSpace(mailBody))
            throw new ArgumentException("Mail Body cannot be null or empty.", nameof(mailBody));

        if (string.IsNullOrWhiteSpace(mailProgram))
            throw new ArgumentException("Mail Program cannot be null or empty.", nameof(mailProgram));
    }
}
