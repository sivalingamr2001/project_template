using Microsoft.EntityFrameworkCore;
using Application;
using Application.Contracts;
using Application.Implementation;
using Domain.RepositoryInterface;
using Infrastructure;
using Infrastructure.Persistence.Entities;
using Infrastructure.Repository;

namespace API
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(
            this IServiceCollection services, IConfiguration configuration)
        {
            var connectionString = configuration.GetConnectionString("DatabaseConnection");
            var dbProvider = configuration.GetSection("Database:Provider").Value ?? "Sqlite";

            services.AddDbContext<AppDbContext>(options =>
            {
                if (dbProvider.Equals("MySql", StringComparison.OrdinalIgnoreCase))
                {
                    // Use MySQL
                    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString));
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

            return services;
        }
    }
}
