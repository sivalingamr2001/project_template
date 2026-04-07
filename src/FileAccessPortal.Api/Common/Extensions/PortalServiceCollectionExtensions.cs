using System.Text;
using System.IO.Compression;
using System.Text.Json.Serialization;
using System.Threading.RateLimiting;
using FileAccessPortal.Api.Common.Auth;
using FileAccessPortal.Api.Common.Middleware;
using FileAccessPortal.Api.Common.Options;
using FileAccessPortal.Api.Common.Persistence;
using FileAccessPortal.Api.Common.Realtime;
using FileAccessPortal.Api.Common.Storage;
using FileAccessPortal.Api.Common.Workflow;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using MySql.EntityFrameworkCore.Extensions;
using Microsoft.IdentityModel.Tokens;

namespace FileAccessPortal.Api.Common.Extensions;

public static class PortalServiceCollectionExtensions
{
    public static IServiceCollection AddPortalApi(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<CorsOptions>(configuration.GetSection(CorsOptions.SectionName));
        services.Configure<CamundaOptions>(configuration.GetSection(CamundaOptions.SectionName));
        services.Configure<JwtOptions>(configuration.GetSection(JwtOptions.SectionName));
        services.Configure<DatabaseOptions>(configuration.GetSection(DatabaseOptions.SectionName));

        services.AddSingleton(TimeProvider.System);
        services.AddScoped<PortalStore>();
        services.AddScoped<DatabaseInitializer>();
        services.AddSingleton<PasswordHasher>();
        services.AddSingleton<JwtTokenService>();
        services.AddHttpContextAccessor();
        services.AddSignalR();

        var databaseOptions = configuration.GetSection(DatabaseOptions.SectionName).Get<DatabaseOptions>() ?? new DatabaseOptions();
        services.AddDbContext<AppDbContext>(options =>
        {
            if (string.Equals(databaseOptions.Provider, "MySql", StringComparison.OrdinalIgnoreCase))
            {
                options.UseMySQL(databaseOptions.MySqlConnectionString);
                return;
            }

            options.UseSqlite(databaseOptions.SqliteConnectionString);
        });

        services.AddDbContext<AccessManagementDbContext>(options =>
        {
            if (string.Equals(databaseOptions.Provider, "MySql", StringComparison.OrdinalIgnoreCase))
            {
                options.UseMySQL(databaseOptions.MySqlConnectionString);
                return;
            }

            options.UseSqlite(databaseOptions.SqliteConnectionString);
        });

        services.AddScoped<AccessWorkflowService>();

        services.AddProblemDetails();
        services.AddResponseCompression(options =>
        {
            options.EnableForHttps = true;
            options.Providers.Add<BrotliCompressionProvider>();
            options.Providers.Add<GzipCompressionProvider>();
        });
        services.Configure<BrotliCompressionProviderOptions>(options => options.Level = CompressionLevel.Fastest);
        services.Configure<GzipCompressionProviderOptions>(options => options.Level = CompressionLevel.Fastest);

        services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
            options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
            {
                var key = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
                return RateLimitPartition.GetFixedWindowLimiter(
                    key,
                    _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = 120,
                        Window = TimeSpan.FromMinutes(1),
                        QueueLimit = 0
                    });
            });
        });

        services.AddOutputCache(options =>
        {
            options.AddPolicy("system-cache", policy => policy.Expire(TimeSpan.FromSeconds(30)));
        });

        services.ConfigureHttpJsonOptions(options =>
        {
            options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
        });

        var jwtOptions = configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>() ?? new JwtOptions();
        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.SigningKey));
        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwtOptions.Issuer,
                    ValidAudience = jwtOptions.Audience,
                    IssuerSigningKey = signingKey
                };
                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        var accessToken = context.Request.Query["access_token"];
                        var path = context.HttpContext.Request.Path;
                        if (!string.IsNullOrWhiteSpace(accessToken) &&
                            path.StartsWithSegments("/hubs/notifications"))
                        {
                            context.Token = accessToken;
                        }

                        return Task.CompletedTask;
                    }
                };
            });
        services.AddAuthorization();

        services.AddHttpClient<ICamundaWorkflowClient, CamundaWorkflowClient>((serviceProvider, client) =>
        {
            var options = serviceProvider.GetRequiredService<IOptions<CamundaOptions>>().Value;
            client.Timeout = TimeSpan.FromSeconds(options.TimeoutSeconds);
            if (!string.IsNullOrWhiteSpace(options.BaseUrl))
            {
                client.BaseAddress = new Uri(options.BaseUrl.TrimEnd('/') + "/");
            }
        });

        services.AddCors(options =>
        {
            var corsOptions = configuration.GetSection(CorsOptions.SectionName).Get<CorsOptions>() ?? new CorsOptions();
            options.AddPolicy(corsOptions.PolicyName, policy =>
            {
                policy.WithOrigins(corsOptions.AllowedOrigins)
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
            });
        });

        return services;
    }
}
