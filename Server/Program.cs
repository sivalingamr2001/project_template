using Microsoft.EntityFrameworkCore;
using Server.Features.AccessRequests;
using Server.Features.Users.Login;
using Server.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
var provider = builder.Configuration.GetValue("DbProvider", "Sqlite"); // Default to Sqlite
var connectionString = provider == "MySql"
    ? builder.Configuration.GetConnectionString("DefaultConnection")
    : builder.Configuration.GetConnectionString("SqliteConnection");

builder.Services.AddDbContext<AppDbContext>(options =>
{
    if (provider == "MySql")
    {
        options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString));
    }
    else
    {
        options.UseSqlite(connectionString);
    }
});

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
        policy.WithOrigins("http://localhost:3001", "http://localhost:5173") // Vite default port
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

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    context.Database.EnsureCreated();

    // Seed data if database is empty
    if (!context.Users.Any())
    {
        // Create departments first
        var itDept = new Server.Domain.Entities.Department
        {
            Name = "Information Technology"
        };

        var hrDept = new Server.Domain.Entities.Department
        {
            Name = "Human Resources"
        };

        context.Departments.AddRange(itDept, hrDept);
        context.SaveChanges();

        // Create users
        var hodUser = new Server.Domain.Entities.User
        {
            EmployeeId = 1,
            UserName = "John HOD",
            Email = "hod@company.com",
            Password = "password123", // In production, this should be hashed
            Role = Server.Domain.Enums.Roles.HOD,
            Location = "New York",
            PhoneNumber = 1234567890,
            DepartmentId = itDept.Id
        };

        var hrHodUser = new Server.Domain.Entities.User
        {
            EmployeeId = 2,
            UserName = "Jane HR",
            Email = "hr@company.com",
            Password = "password123",
            Role = Server.Domain.Enums.Roles.HOD,
            Location = "New York",
            PhoneNumber = 1234567891,
            DepartmentId = hrDept.Id
        };

        var itUser = new Server.Domain.Entities.User
        {
            EmployeeId = 3,
            UserName = "Bob IT",
            Email = "it@company.com",
            Password = "password123",
            Role = Server.Domain.Enums.Roles.IT,
            Location = "New York",
            PhoneNumber = 1234567892,
            DepartmentId = itDept.Id
        };

        var regularUser = new Server.Domain.Entities.User
        {
            EmployeeId = 4,
            UserName = "Alice User",
            Email = "user@company.com",
            Password = "password123",
            Role = Server.Domain.Enums.Roles.User,
            Location = "New York",
            PhoneNumber = 1234567893,
            DepartmentId = hrDept.Id
        };

        context.Users.AddRange(hodUser, hrHodUser, itUser, regularUser);
        context.SaveChanges();

        // Update departments with HOD references
        itDept.HodId = hodUser.Id;
        hrDept.HodId = hrHodUser.Id;
        context.SaveChanges();
    }
}

app.Run();
