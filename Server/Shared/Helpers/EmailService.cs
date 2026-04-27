using Dapper;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MySqlConnector;
using Server.Features.Notifications;

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
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;
    private readonly string _connectionString;
    private const string MailTableName = "jan_mail_system";

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));

        // Get the email connection string from appsettings, fallback to main database connection
        _connectionString = _configuration.GetConnectionString("EmailConnectionString")
            ?? _configuration["Database:MySqlConnectionString"]
            ?? throw new InvalidOperationException("EmailConnectionString or Database:MySqlConnectionString not found in appsettings.");
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
            response.MailNo = mailNo;
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

    private async Task<int> InsertMailRecordAsync(
        string mailFrom,
        string mailTo,
        string mailSubject,
        string mailBody,
        string mailProgram,
        string? mailCc = null,
        CancellationToken cancellationToken = default)
    {
        using var connection = new MySqlConnection(_connectionString);
        await connection.OpenAsync(cancellationToken);

        const string insertSql = $@"
            INSERT INTO {MailTableName} (mail_date, mail_program, mail_from, mail_to, mail_subject, mail_sent, mail_body, mail_cc)
            VALUES (@MailDate, @MailProgram, @MailFrom, @MailTo, @MailSubject, @MailSent, @MailBody, @MailCc);
            SELECT LAST_INSERT_ID();";

        var parameters = new
        {
            MailDate = DateTime.Now,
            MailProgram = mailProgram,
            MailFrom = mailFrom,
            MailTo = mailTo,
            MailSubject = mailSubject,
            MailSent = 0, // Not sent yet
            MailBody = mailBody,
            MailCc = mailCc ?? string.Empty
        };

        var mailNo = await connection.ExecuteScalarAsync<int>(insertSql, parameters);
        return mailNo;
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
