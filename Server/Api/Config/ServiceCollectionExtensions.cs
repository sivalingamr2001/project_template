using Microsoft.EntityFrameworkCore;
using Server.Features.AccessRequests.Common;
using Server.Features.AccessRequests.Create;
using Server.Features.AccessRequests.GetList;
using Server.Features.Auth.Login;
using Server.Features.Dashboard.GetDashboard;
using Server.Infrastructure.Db;
using Server.Shared.Constants;
using Server.Shared.Helpers;

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

            if (isMySql)
            {
                options.UseMySql(
                    databaseOptions.MySqlConnectionString,
                    ServerVersion.AutoDetect(databaseOptions.MySqlConnectionString));

                return;
            }

            options.UseSqlite(databaseOptions.SqliteConnectionString);
        });

        services.AddEndpointsApiExplorer();
        services.AddSignalR();
        services.AddSwaggerGen();
        services.AddHealthChecks().AddDbContextCheck<AppDbContext>();

        services.AddSingleton<PasswordHasher>();
        services.AddScoped<DatabaseInitializer>();
        services.AddScoped<AccessRequestWorkflowService>();
        services.AddScoped<LoginService>();
        services.AddScoped<CreateAccessRequestService>();
        services.AddScoped<GetAccessRequestsService>();
        services.AddScoped<GetDashboardService>();

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
