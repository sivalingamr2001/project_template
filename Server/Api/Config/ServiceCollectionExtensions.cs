using ConnectionDll;
using Microsoft.EntityFrameworkCore;
using Oracle.EntityFrameworkCore;
using Server.Features.Auth.Login;
using Server.Features.BudgetRecords;
using Server.Infrastructure.Db;
using Server.Infrastructure.Oracle;
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
            var isOracle = string.Equals(databaseOptions.Provider, "Oracle", StringComparison.OrdinalIgnoreCase);
            var isMySql = string.Equals(databaseOptions.Provider, "MySql", StringComparison.OrdinalIgnoreCase);

            if (isOracle)
            {
                var connectionString = string.IsNullOrWhiteSpace(databaseOptions.OracleConnectionString)
                    ? new Class1().oracon_prod_new.ConnectionString
                    : databaseOptions.OracleConnectionString;

                if (string.IsNullOrWhiteSpace(connectionString))
                {
                    throw new InvalidOperationException("Oracle provider is configured but the connection string from ConnectionDll is missing.");
                }

                options.UseOracle(connectionString);
                return;
            }

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
        services.AddScoped<LoginService>();
        services.AddScoped<BudgetRecordsService>();
        if (string.Equals(databaseOptions.Provider, "Oracle", StringComparison.OrdinalIgnoreCase))
        {
            services.AddScoped<OracleService>();
        }

        services.AddCors(options =>
        {
            options.AddPolicy(CorsPolicyNames.ReactClient, policy =>
            {
                var allowedOrigins = configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();

                if (allowedOrigins.Length > 0)
                {
                    policy.WithOrigins(allowedOrigins)
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials();
                    return;
                }

                // Same-origin deployments don't need CORS. When no origins are configured,
                // we intentionally do not allow cross-origin requests.
                policy.AllowAnyHeader().AllowAnyMethod();
            });
        });

        return services;
    }
}
