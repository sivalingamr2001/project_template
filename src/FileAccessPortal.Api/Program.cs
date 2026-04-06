using FileAccessPortal.Api.Common.Extensions;
using Microsoft.OpenApi.Models;

//var builder = WebApplication.CreateBuilder(args);
//var spaDistPath = Path.GetFullPath(Path.Combine(builder.Environment.ContentRootPath, "..", "..", "Artifact", "client"));

//if (Directory.Exists(spaDistPath))
//{
//    builder.WebHost.UseWebRoot(spaDistPath);
//}

//builder.WebHost.ConfigureKestrel(options => options.AddServerHeader = false);
//builder.Services.AddPortalApi(builder.Configuration);

var contentRoot = Directory.GetCurrentDirectory();
var spaDistPath = Path.GetFullPath(Path.Combine(contentRoot, "..", "..", "Artifact", "client"));

// 2. Configure WebApplicationOptions to handle the WebRoot change
var options = new WebApplicationOptions
{
    Args = args,
    // If the folder exists, set it as the WebRoot immediately
    WebRootPath = Directory.Exists(spaDistPath) ? spaDistPath : null
};

var builder = WebApplication.CreateBuilder(options);

// 3. Configure services (No more builder.WebHost.UseWebRoot call)
builder.WebHost.ConfigureKestrel(kestrelOptions => kestrelOptions.AddServerHeader = false);
builder.Services.AddPortalApi(builder.Configuration);

// Add Swagger services
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new()
    {
        Title = "File Access Portal API",
        Version = "v1",
        Description = "API for managing file access requests and approvals"
    });
});

var app = builder.Build();
var spaIndexPath = app.Environment.WebRootFileProvider.GetFileInfo("index.html");

await app.InitializePortalDatabaseAsync();

// Enable Swagger middleware (must be before UsePortalApi to be in correct middleware pipeline position)
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.DocumentTitle = "File Access Portal API Documentation";
    });
}

app.UseStaticFiles();
app.UsePortalApi();

if (spaIndexPath.Exists)
{
    app.MapFallbackToFile("index.html");
}

app.Run();
