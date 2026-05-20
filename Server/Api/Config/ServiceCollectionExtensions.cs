using Microsoft.EntityFrameworkCore;
using Pomelo.EntityFrameworkCore.MySql;
using Server.Features.AccessRequests.Common;
using Server.Features.AccessRequests.Create;
using Server.Features.AuditLogs.GetList;
using Server.Features.Auth.Login;
using Server.Features.Dashboard.AccessRequestDashboard;
using Server.Features.Dashboard.GetDashboard;
using Server.Features.Departments.Create;
using Server.Features.Departments.GetList;
using Server.Features.Departments.Update;
using Server.Features.Employees;
using Server.Infrastructure.Db;
using Server.Infrastructure.Oracle;
using Server.Shared.Camunda;
using Server.Shared.Constants;
using Server.Features.AccessRequests.GetList;
using Server.Features.HOD;
using Server.Shared.Helpers;
using Server.Features.Admin.FolderMapping;

namespace Server.Api.Config;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration configuration)
    {
        var databaseSection = configuration.GetSection(DatabaseOptions.SectionName);
        services.Configure<DatabaseOptions>(databaseSection);

        var databaseOptions = databaseSection.Get<DatabaseOptions>()
            ?? throw new InvalidOperationException("Database configuration is missing.");

        services.AddDbContext<AppDbContext>(options =>
        {
            var isMySql = string.Equals(databaseOptions.Provider, "MySql", StringComparison.OrdinalIgnoreCase);
            var serverVersion = ServerVersion.Parse(databaseOptions.MySqlServerVersion);

            if (isMySql)
            {
                options.UseMySql(
                    databaseOptions.MySqlConnectionString,
                    serverVersion);

                return;
            } else if (string.Equals(databaseOptions.Provider, "local_mysql", StringComparison.OrdinalIgnoreCase))
            {
                options.UseMySql(
                    databaseOptions.MySqlConnectionString_local,
                    serverVersion);

                return;
            }

            options.UseSqlite(databaseOptions.SqliteConnectionString);
        });

        services.AddMemoryCache();
        services.AddEndpointsApiExplorer();
        services.AddSignalR();
        services.AddSwaggerGen();
        services.AddHealthChecks().AddDbContextCheck<AppDbContext>();

        services.AddSingleton<ConnectionStrings>();
        services.AddScoped<DatabaseInitializer>();
        services.AddTransient<AccessRequestWorkflowService>();
        services.AddScoped<LoginService>();
        services.AddScoped<EmployeeService>();
        services.AddScoped<FolderService>();
        services.AddScoped<FolderMappingService>();
        services.AddScoped<CreateAccessRequestService>();
        services.AddScoped<GetAccessRequestsService>();
        services.AddScoped<GetDepartmentsService>();
        services.AddScoped<CreateDepartmentService>();
        services.AddScoped<UpdateDepartmentService>();
        services.AddScoped<HODService>();
        services.AddScoped<GetDashboardService>();
        services.AddScoped<AccessRequestDashboardService>();
        services.AddScoped<GetAuditLogsService>();
        services.AddScoped<IOracleService, OracleService>();
        services.AddScoped<IEmailService, EmailService>();
        services.AddScoped<IAccessRequestEmailNotificationService, AccessRequestEmailNotificationService>();
        services.AddScoped<IAccessRequestExpirationService, AccessRequestExpirationService>();
        services.Configure<CamundaOptions>(configuration.GetSection("Zeebe"));
        services.AddSingleton<CamundaService>();

        services.AddCors(options =>
        {
            options.AddPolicy(CorsPolicyNames.ReactClient, policy =>
            {
                policy.WithOrigins("http://localhost:5174", "http://localhost:5173")
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
            });
        });

        return services;
    }
}
