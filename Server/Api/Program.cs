using Server.Api.Config;
using Server.Api.Middleware;
using Server.Shared.Camunda;
using Server.Shared.Constants;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApplicationServices(builder.Configuration);

var app = builder.Build();

var databaseOptions = builder.Configuration.GetSection(DatabaseOptions.SectionName).Get<DatabaseOptions>();
if (databaseOptions?.AutoMigrateOnStartup != false)
{
    await app.InitializeDatabaseAsync();
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseDefaultFiles();
app.UseMiddleware<GlobalExceptionHandlingMiddleware>();
app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseCors(CorsPolicyNames.ReactClient);

app.MapHealthChecks("/health");
app.MapFeatureEndpoints();
app.MapFallbackToFile("index.html");

app.Run();

public partial class Program;
