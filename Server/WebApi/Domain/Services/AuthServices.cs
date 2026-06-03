using System.Data;
using Microsoft.Extensions.Configuration;
using MySqlConnector;
using WebApi.Domain.Dto;
using WebApi.Domain.Interfaces;
using WebApi.Shared;

namespace WebApi.Domain.Services;

public class AuthServices : IAuthService
{
    private readonly string _cmplConnectionString;
    private readonly string _defaultConnectionString;

    public AuthServices(IConfiguration configuration)
    {
        _cmplConnectionString = configuration.GetSection("Database:MySqlConnectionString_Cmpl").Value
            ?? throw new InvalidOperationException("Compliance DB connection string is missing.");

        _defaultConnectionString = configuration.GetSection("Database:MySqlConnectionString").Value
            ?? throw new InvalidOperationException("Default DB connection string is missing.");
    }

    public async Task<AuthResponse?> AuthenticateUserAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Identifier) || string.IsNullOrWhiteSpace(request.Password))
        {
            return null;
        }

        AuthResponse? authProfile = null;

        // Step 1: Validate credentials using extracted compliance verification context query
        await using (var cmplConnection = new MySqlConnection(_cmplConnectionString))
        {
            await cmplConnection.OpenAsync(cancellationToken);

            await using var command = new MySqlCommand(Queries.AuthenticateComplianceUser, cmplConnection);
            command.Parameters.AddWithValue("@id", request.Identifier.Trim());
            command.Parameters.AddWithValue("@pwd", request.Password);

            await using var reader = await command.ExecuteReaderAsync(CommandBehavior.SingleRow, cancellationToken);
            if (await reader.ReadAsync(cancellationToken))
            {
                authProfile = new AuthResponse
                {
                    CmplUserId = reader.GetInt32("UserId"),
                    CmplUserName = reader.GetString("UserName"),
                    EmpId = reader.IsDBNull("EmployeeId") ? null : reader.GetString("EmployeeId"),
                    MailId = reader.IsDBNull("Email") ? null : reader.GetString("Email"),
                    MobNo = reader.IsDBNull("Mobile") ? null : reader.GetString("Mobile"),
                    DeptId = reader.IsDBNull("DeptId") ? null : reader.GetInt32("DeptId")
                };
            }
        }

        if (authProfile == null) return null;

        // Step 2: Extract metadata or create a default user record via transaction if not found
        await using (var defaultConnection = new MySqlConnection(_defaultConnectionString))
        {
            await defaultConnection.OpenAsync(cancellationToken);

            await using var selectCommand = new MySqlCommand(Queries.FetchPortalUserAuthorization, defaultConnection);
            selectCommand.Parameters.AddWithValue("@UserId", authProfile.CmplUserId);

            await using var reader = await selectCommand.ExecuteReaderAsync(CommandBehavior.SingleRow, cancellationToken);
            if (await reader.ReadAsync(cancellationToken))
            {
                int roleIndex = reader.GetInt32("role");
                authProfile.Role = MapRoleEnumIndexToString(roleIndex);
                authProfile.Location = reader.GetString("location");
            }
            else
            {
                // Clean close the active data reader before starting the creation transaction block
                await reader.CloseAsync();

                // Start an isolated transaction to securely insert the missing user context
                await using var transaction = await defaultConnection.BeginTransactionAsync(cancellationToken);
                try
                {
                    await using var insertCommand = new MySqlCommand(Queries.CreateDefaultPortalUser, defaultConnection, transaction);
                    insertCommand.Parameters.AddWithValue("@UserId", authProfile.CmplUserId);

                    await insertCommand.ExecuteNonQueryAsync(cancellationToken);
                    await transaction.CommitAsync(cancellationToken);

                    // Map requested fallback baseline return models
                    authProfile.Role = "user";
                    authProfile.Location = "Unknown";
                }
                catch
                {
                    await transaction.RollbackAsync(cancellationToken);
                    throw; // Escalate database processing exceptions up the execution context
                }
            }
        }

        return authProfile;
    }

    private static string MapRoleEnumIndexToString(int index)
    {
        return index switch
        {
            1 => "Admin",
            2 => "operator",
            3 => "hod",
            4 => "user",
            _ => "user"
        };
    }
}
