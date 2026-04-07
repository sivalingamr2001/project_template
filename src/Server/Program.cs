using Microsoft.EntityFrameworkCore;
using Server.Common.Auth;
using Server.Common.Options;
using Server.Features.Dashboard;
using Server.Features.Requests.Create;
using Server.Features.Users.Login;
using Server.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

// 1. Setup Database Configuration
var databaseSection = builder.Configuration.GetSection(DatabaseOptions.SectionName);
builder.Services.Configure<DatabaseOptions>(databaseSection);

var databaseOptions = databaseSection.Get<DatabaseOptions>()
    ?? throw new InvalidOperationException("Database configuration is missing.");

// 2. Configure DbContext
builder.Services.AddDbContext<AppDbContext>(options =>
{
    var isMySql = string.Equals(databaseOptions.Provider, "MySql", StringComparison.OrdinalIgnoreCase);

    if (isMySql)
    {
        options.UseMySql(
            databaseOptions.MySqlConnectionString,
            ServerVersion.AutoDetect(databaseOptions.MySqlConnectionString));
    }
    else
    {
        options.UseSqlite(databaseOptions.SqliteConnectionString);
    }
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// If PasswordHasher has no state, Singleton is fine. 
// If it uses Scoped dependencies, change to AddScoped.
builder.Services.AddSingleton<PasswordHasher>();
builder.Services.AddScoped<DatabaseInitializer>();
builder.Services.AddScoped<LoginHandler>();
builder.Services.AddScoped<AccessRequestHandler>();
builder.Services.AddScoped<DashboardHandler>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactClient", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddHealthChecks()
    .AddDbContextCheck<AppDbContext>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var initializer = scope.ServiceProvider.GetRequiredService<DatabaseInitializer>();
    await initializer.InitializeAsync();
}

// 4. Middleware Pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseCors("AllowReactClient");

app.MapHealthChecks("/health");
app.MapLoginEndpoint();
app.MapAccessRequestEndpoints();
app.MapDashboardEndpoints();
app.MapFallbackToFile("index.html");

app.Run();
