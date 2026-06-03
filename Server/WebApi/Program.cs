using DataEngine.Extensions;
using Microsoft.OpenApi.Models;
using Serilog;
using WebApi.API.Features._Common;
using WebApi.Domain.Interfaces;
using WebApi.Domain.Services;

/**
* Instantiates a new logging configuration engine.
* Allocates a setup workspace in memory to define how logs behave.
*/
Log.Logger = new LoggerConfiguration()

/**
* Attaches the terminal window as an output destination.
* Ensures developers see real-time errors and logs during local debugging.
*/
    .WriteTo.Console()

/**
* Configures Serilog to save logs into a text file.
* Saves files inside a 'logs' folder right next to your running application executable.
* 'RollingInterval.Day' creates a brand new log file automatically every single day.
* 'retainedFileCountLimit: 7' automatically deletes files older than 7 days to save disk space.
*/
    .WriteTo.File(
        path: "logs/app-log-.txt",
        rollingInterval: RollingInterval.Day,
        retainedFileCountLimit: 7)

/**
* Finalizes and starts a temporary, lightweight fallback logger.
* Captures early startup crashes if appsettings.json or the server fails immediately.
*/
    .CreateBootstrapLogger();

try
{
    Log.Information("Starting web application host...");

    /**
    * Initializes the core web server orchestrator engine.
    * Automatically loads appsettings.json, reads environment variables, and prepares dependency injection.
    */
    var builder = WebApplication.CreateBuilder(args);

    /**
    * Swaps the native .NET logging engine with your advanced Serilog engine.
    * 'ReadFrom.Configuration' forces Serilog to look inside appsettings.json for log filtering levels.
    * 'ReadFrom.Services' lets Serilog access internal system tools if it needs them.
    * 'Enrich.FromLogContext' automatically tags logs with useful tracking data like Request IDs.
    */
    builder.Host.UseSerilog((hostingContext, services, configuration) =>
        configuration.ReadFrom.Configuration(hostingContext.Configuration)
                     .ReadFrom.Services(services)
                     .Enrich.FromLogContext());

    // --- SERVICE REGISTRATION LAYER ---

    /**
    * Registers your custom controllers or minimal API endpoint systems to map routing pathways.
    */
    builder.Services.AddControllers();

    /**
    * Registers endpoints metadata details for OpenAPI discovery generation engines.
    */
    builder.Services.AddEndpointsApiExplorer();

    /**
    * Configures the Swagger generation tool context rules.
    * Builds the interactive contract schema layouts for testing your APIs.
    */
    builder.Services.AddSwaggerGen(options =>
    {
        options.SwaggerDoc("v1", new OpenApiInfo
        {
            Title = "Dynamic Data Engine API Portal",
            Version = "v1",
            Description = "Automated metadata-driven CRUD core gateway engine for MySQL data layers."
        });
    });

    /**
    * Registers your database infrastructure into the Dependency Injection service container.
    * This loads the Metadata Repository, Validator, and Core Dynamic Transaction Processor.
    */
    builder.Services.AddDynamicDataEngine();

    /**
    * Registers the WebApi common transaction routing helper class into the service scope context.
    */
    builder.Services.AddScoped<ProcessTransactionService>();
    builder.Services.AddScoped<IAuthService, AuthServices>();

    // --- APPLICATION BUILDING LAYER ---

    var app = builder.Build();

    // --- MIDDLEWARE EXECUTION PIPELINE ---

    /**
    * Directs Serilog to capture HTTP request processing metadata metrics (URLs, status codes, and execution speeds).
    */
    app.UseSerilogRequestLogging();

    /**
    * Exposes Swagger Interactive Documentation UI testing dashboard only within Development environments.
    */
    if (app.Environment.IsDevelopment())
    {
        // Generates the raw /swagger/v1/swagger.json engine configuration file
        app.UseSwagger();

        // Spins up the browser visual webpage dashboard endpoint at /swagger
        app.UseSwaggerUI(options =>
        {
            options.SwaggerEndpoint("/swagger/v1/swagger.json", "Dynamic Engine API v1");
            options.RoutePrefix = "swagger"; // Opens straight at http://localhost:<port>/swagger
        });
    }

    /**
    * Forces the server routing engine to inspect incoming URL strings and match them to valid code endpoints.
    */
    app.UseRouting();

    /**
    * Binds matching endpoints to HTTP controllers or minimal routing pathways.
    */
    app.MapControllers();

    /**
    * Starts the execution pipeline engine, putting the API into an active state listening for incoming traffic.
    */
    await app.RunAsync();
}
catch (Exception ex)
{
    Log.Fatal(ex, "The application host terminated unexpectedly during startup.");
}
finally
{
    Log.CloseAndFlush();
}
