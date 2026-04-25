using Server.Api.Config;
using Server.Api.Middleware;
using Server.Shared.Constants;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApplicationServices(builder.Configuration);

var app = builder.Build();

await app.InitializeDatabaseAsync();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseHsts();
}

app.UseMiddleware<GlobalExceptionHandlingMiddleware>();
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UsePathBase("/budget-portal");
app.UseStaticFiles();
app.UseRouting();
app.UseDefaultFiles();
app.UseCors(CorsPolicyNames.ReactClient);

app.MapHealthChecks("/health");
app.MapFeatureEndpoints();
app.MapFallbackToFile("index.html");

app.Run();

public partial class Program;
