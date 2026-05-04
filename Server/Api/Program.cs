using Server.Api.Config;
using Server.Api.Middleware;
using Server.Shared.Constants;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApplicationServices(builder.Configuration);

var app = builder.Build();

await app.InitializeDatabaseAsync();

// --- CHANGE 1 & 2: Swagger Configuration ---
app.UseSwagger();
app.UseSwaggerUI();

app.UseMiddleware<GlobalExceptionHandlingMiddleware>();

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseStaticFiles();
app.UseRouting();
app.UseDefaultFiles();
app.UseCors(CorsPolicyNames.ReactClient);

app.MapHealthChecks("/health");
app.MapFeatureEndpoints();

// --- CHANGE 3: Explicit Fallback Path ---
app.MapFallbackToFile("index.html");

app.Run();

public partial class Program;
