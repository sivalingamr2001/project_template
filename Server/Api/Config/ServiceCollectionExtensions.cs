using Microsoft.EntityFrameworkCore;
using Pomelo.EntityFrameworkCore.MySql;
using Server.Features.AccessRequests.Common;
using Server.Features.AccessRequests.Create;
using Server.Features.AccessRequests.GetList;
using Server.Features.AuditLogs.GetList;
using Server.Features.Auth.Login;
using Server.Features.Auth.User;
using Server.Features.Dashboard.GetDashboard;
using Server.Infrastructure.Db;
using Server.Shared.Camunda;
using Server.Shared.Constants;

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

        services.AddEndpointsApiExplorer();
        services.AddSignalR();
        services.AddSwaggerGen();
        services.AddHealthChecks().AddDbContextCheck<AppDbContext>();

        services.AddScoped<DatabaseInitializer>();
        services.AddTransient<AccessRequestWorkflowService>();
        services.AddScoped<LoginService>();
        services.AddScoped<UserService>();
        services.AddScoped<CreateAccessRequestService>();
        services.AddScoped<GetAccessRequestsService>();
        services.AddScoped<GetDashboardService>();
        services.AddScoped<GetAuditLogsService>();
        services.Configure<CamundaOptions>(configuration.GetSection("Zeebe"));
        services.AddSingleton<CamundaService>();

        services.AddCors(options =>
        {
            options.AddPolicy(CorsPolicyNames.ReactClient, policy =>
            {
                policy.WithOrigins("http://localhost:5173")
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
            });
        });

        return services;
    }
}
