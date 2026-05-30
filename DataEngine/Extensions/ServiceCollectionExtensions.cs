using DataEngine.Abstractions;
using DataEngine.Repository;
using DataEngine.Services;
using Microsoft.Extensions.DependencyInjection;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddDynamicDataEngine(this IServiceCollection services)
    {
        // CRUD Mutations Layer
        services.AddSingleton<ApplicationTableMetadataRepository>();
        services.AddSingleton<ITransactionValidator, TransactionValidator>();
        services.AddScoped<IDynamicTransactionProcessor, DynamicTransactionProcessor>();

        // Pure Fetch Query Engine Layer
        services.AddSingleton<IQueryValidator, QueryValidator>();
        services.AddScoped<IDynamicReadEngine, DynamicReadEngine>();

        return services;
    }
}
