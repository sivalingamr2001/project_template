using Application.Contracts;
using Application.Implementation;
using Domain.RepositoryInterface;
using Infrastructure.Persistence.Entities;
using Infrastructure.Persistence.Oracle;
using Infrastructure.Repository;
using Microsoft.EntityFrameworkCore;

namespace API
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(
            this IServiceCollection services, IConfiguration configuration)
        {
            var connectionString = configuration.GetConnectionString("DatabaseConnection");
            var dbProvider = configuration.GetSection("Database:Provider").Value ?? "Sqlite";

            // Register OracleService into DI first so it can be resolved below
            services.AddScoped<OracleService>();

            services.AddDbContext<AppDbContext>((serviceProvider, options) =>
            {
                if (dbProvider.Equals("Oracle", StringComparison.OrdinalIgnoreCase))
                {
                    // 1. Resolve OracleService directly from DI container
                    using var scope = serviceProvider.CreateScope();
                    var oracleService = scope.ServiceProvider.GetRequiredService<OracleService>();

                    // 2. Fetch connection string via OracleService
                    var oracleCs = oracleService.GetConnectionString();

                    // 3. Fail fast if connection string is missing or empty
                    if (string.IsNullOrWhiteSpace(oracleCs))
                    {
                        throw new InvalidOperationException("Oracle provider is configured but the connection string from OracleService is missing.");
                    }

                    // 4. Use the Oracle extension method (requires Oracle.EntityFrameworkCore package)
                    options.UseOracle(oracleCs);
                }
                else
                {
                    // Default to SQLite
                    options.UseSqlite(connectionString);
                }
            });

            services.AddAutoMapper(cfg =>
            {
                cfg.AddMaps(typeof(Program).Assembly);
                cfg.AddMaps(typeof(Infrastructure.Mappers.UserMappingExtension).Assembly);
            });

            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IRequisitionRepository, RequisitionRepository>();
            services.AddScoped<ISearchService, SearchService>();

            return services;
        }

        public static IServiceCollection AddApplication(
            this IServiceCollection services)
        {
            services.AddAutoMapper(cfg =>
            {
                cfg.AddMaps(typeof(Program).Assembly);
                cfg.AddMaps(typeof(Application.Mappers.UserMappingExtension).Assembly);
            });

            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IRequisitionService, RequisitionService>();
            services.AddSingleton<RequisitionExcelReportBuilder>();

            return services;
        }
    }
}
