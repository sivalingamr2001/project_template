using Microsoft.EntityFrameworkCore;
using Server.Features.AccessRequests;
using Server.Features.Users.Login;
using Server.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(builder.Configuration.GetConnectionString("DefaultConnection"),
        new MySqlServerVersion(new Version(8, 0, 23))));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddScoped<LoginHandler>();
builder.Services.AddScoped<AccessWorkflowService>();
builder.Services.AddScoped<CreateAccessRequestHandler>();
builder.Services.AddScoped<UpdateApprovalHandler>();
builder.Services.AddScoped<RevokeAccessRequestHandler>();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactClient", policy =>
    {
        policy.WithOrigins("http://localhost:3001") // Vite default port
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Add health checks
builder.Services.AddHealthChecks()
    .AddDbContextCheck<AppDbContext>();

var app = builder.Build();

// Configure the HTTP request pipeline.
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

// Serve React SPA
app.MapFallbackToFile("index.html");

app.Run();
