using Microsoft.AspNetCore.Mvc;
using Server.Domain.Errors;
using Server.Shared.Exceptions;

namespace Server.Features.BudgetRecords;

public static class BudgetRecordsEndpoint
{
    public static void Map(RouteGroupBuilder group)
    {
        group.MapGet("/", async (BudgetRecordsService service, CancellationToken cancellationToken) =>
        {
            var result = await service.GetAllAsync(cancellationToken);
            return result.IsSuccess
                ? Results.Ok(result.Value)
                : ToProblem(result.Error!);
        })
        .WithName("GetBudgets")
        .WithOpenApi();

        group.MapGet("/teams", async (BudgetRecordsService service, CancellationToken cancellationToken) =>
        {
            var result = await service.GetTeamNamesAsync(cancellationToken);
            return result.IsSuccess
                ? Results.Ok(result.Value)
                : ToProblem(result.Error!);
        })
        .WithName("GetTeamNames")
        .WithOpenApi();

        group.MapGet("/search", async (string ? searchTerm, BudgetRecordsService service, IConfiguration configuration, CancellationToken cancellationToken) =>
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
            {
                throw new AppValidationException("At least one search parameter is required: productNo or projectNumber.");
            }

            var result = await service.SearchAsync(searchTerm, configuration, cancellationToken);
            return result.IsSuccess
                ? Results.Ok(result.Value)
                : ToProblem(result.Error!);
        })
        .WithName("SearchBudgets")
        .WithOpenApi();

        group.MapGet("/summary", async (
            BudgetRecordsService service,
            CancellationToken cancellationToken,
            string? period = null,
            DateTime? from = null,
            DateTime? to = null,
            string? teamName = null) =>
        {
            var result = await service.GetSummaryAsync(period, from, to, teamName, cancellationToken);

            return result.IsSuccess
                ? Results.Ok(result.Value)
                : ToProblem(result.Error!);
        })
        .WithName("GetBudgetSummary")
        .WithOpenApi();

        group.MapGet("/summary/trend", async (
            BudgetRecordsService service,
            CancellationToken cancellationToken,
            string? type = null,
            string? projectNumber = null,
            string? teamName = null) =>
        {
            var result = await service.GetTrendAsync(type, projectNumber, teamName, cancellationToken);

            return result.IsSuccess
                ? Results.Ok(result.Value)
                : ToProblem(result.Error!);
        })
        .WithName("GetBudgetSummaryTrend")
        .WithOpenApi();


        group.MapGet("/{budgetId:int}", async (int budgetId, BudgetRecordsService service, CancellationToken cancellationToken) =>
        {
            var result = await service.GetByIdAsync(budgetId, cancellationToken);
            return result.IsSuccess
                ? Results.Ok(result.Value)
                : ToProblem(result.Error!);
        })
        .WithName("GetBudgetById")
        .WithOpenApi();

        group.MapGet("/by-project/{productNo}", async (string productNo, BudgetRecordsService service, CancellationToken cancellationToken) =>
        {
            if (string.IsNullOrWhiteSpace(productNo))
            {
                throw new AppValidationException("productNo is required.");
            }

            var decodedProductNo = DecodeRouteValue(productNo, nameof(productNo));
            var result = await service.GetByProductNoAsync(decodedProductNo, cancellationToken);
            return result.IsSuccess
                ? Results.Ok(result.Value)
                : ToProblem(result.Error!);
        })
        .WithName("GetBudgetByProductNo")
        .WithOpenApi();

        // productNo may contain slashes (e.g., "XYZ-5/2-PSV"), so this is a catch-all route.
        group.MapGet("/by-project/{projectNumber}/product/{productNo}", async (
            string projectNumber,
            string productNo,
            BudgetRecordsService service,
            CancellationToken cancellationToken) =>
        {
            if (string.IsNullOrWhiteSpace(projectNumber))
            {
                throw new AppValidationException("projectNumber is required.");
            }

            if (string.IsNullOrWhiteSpace(productNo))
            {
                throw new AppValidationException("productNo is required.");
            }

            var decodedprojectNumber = DecodeRouteValue(projectNumber, "projectNumber");
            var decodedProductNo = DecodeRouteValue(productNo, "productNo");

            var result = await service.GetByprojectNumberAndProductNoAsync(decodedprojectNumber, decodedProductNo, cancellationToken);

            if (!result.IsSuccess && result.Error?.Code == ErrorCode.NoContent)
            {
                return Results.NoContent();
            }

            return result.IsSuccess
                ? Results.Ok(result.Value)
                : ToProblem(result.Error!);
        })
        .WithName("GetBudgetByprojectNumberAndProductNo")
        .WithOpenApi();

        group.MapPost("/", async (CreateBudgetRecordRequest request, BudgetRecordsService service, CancellationToken cancellationToken) =>
        {
            ValidateCreateRequest(request);

            var result = await service.CreateAsync(request, cancellationToken);
            if (!result.IsSuccess)
            {
                return ToProblem(result.Error!);
            }

            var created = result.Value!;
            return Results.Created($"/api/budgets/{created.Header.BudgetId}", created);
        })
        .WithName("CreateBudget")
        .WithOpenApi();

        group.MapPut("/{budgetId:int}", async (int budgetId, UpdateBudgetRecordRequest request, BudgetRecordsService service, CancellationToken cancellationToken) =>
        {
            ValidateUpdateRequest(request);

            var result = await service.UpdateAsync(budgetId, request, cancellationToken);
            return result.IsSuccess
                ? Results.Ok(result.Value)
                : ToProblem(result.Error!);
        })
        .WithName("UpdateBudget")
        .WithOpenApi();

        group.MapPut("/{id:int}/amounts", async (int id, UpdateBudgetAmountsRequest request, BudgetRecordsService service, CancellationToken cancellationToken) =>
        {
            // Simple validation to ensure IDs match
            if (id != request.BudgetId)
            {
                return Results.BadRequest("URL ID and Body ID mismatch.");
            }

            var result = await service.UpdateAmountsAsync(request, cancellationToken);

            if (!result.IsSuccess)
            {
                return ToProblem(result.Error!);
            }

            return Results.Ok(new { Message = "Amounts updated successfully", Success = true });
        })
        .WithName("UpdateBudgetAmounts")
        .WithOpenApi();

        group.MapPatch("/", async (
             UpdateBudgetRecordStatusRequest request,
             BudgetRecordsService service,
             CancellationToken cancellationToken) =>
                {
                    var result = await service.UpdateActiveStatusAsync(
                        request.BudgetId, // Pass the list here
                        request.IsActive,
                        cancellationToken);

                    return result.IsSuccess
                        ? Results.Ok()
                        : ToProblem(result.Error!);
                })
         .WithName("UpdateBudgetActiveStatus")
         .WithOpenApi();



        group.MapDelete("/{budgetId:int}", async (int budgetId, BudgetRecordsService service, CancellationToken cancellationToken) =>
        {
            var result = await service.DeleteAsync(budgetId, cancellationToken);
            return result.IsSuccess
                ? Results.NoContent()
                : ToProblem(result.Error!);
        })
        .WithName("DeleteBudget")
        .WithOpenApi();

        group.MapPost("/{budgetId:int}/approval", async (
            int budgetId,
            BudgetApprovalRequest request,
            BudgetRecordsService service,
            CancellationToken cancellationToken) =>
            {
                var result = await service.ApproveOrRejectAsync(
                    budgetId,
                    request.ApproverId,
                    request.IsApproved,
                    request.Comments,
                    cancellationToken);

                return result.IsSuccess
                    ? Results.Ok(result)
                    : ToProblem(result.Error!);
            })
        .WithName("ApproveOrRejectBudget")
        .WithOpenApi();

    }

    private static void ValidateCreateRequest(CreateBudgetRecordRequest request)
    {
        if (request.EmployeeId <= 0)
        {
            throw new AppValidationException("EmployeeId is required.");
        }

        if (string.IsNullOrWhiteSpace(request.projectNumber))
        {
            throw new AppValidationException("projectNumber is required.");
        }

        if (string.IsNullOrWhiteSpace(request.ProductNo))
        {
            throw new AppValidationException("ProductNo is required.");
        }

        var title = (request.ProjectTitle ?? request.ProductName)?.Trim();
        if (string.IsNullOrWhiteSpace(title))
        {
            throw new AppValidationException("ProjectTitle (or productName) is required.");
        }

        if (request.BudgetData is null)
        {
            return;
        }

        foreach (var category in request.BudgetData)
        {
            if (string.IsNullOrWhiteSpace(category.Category))
            {
                throw new AppValidationException("Each budgetData entry must have a category name.");
            }

            foreach (var item in category.Items)
            {
                if (string.IsNullOrWhiteSpace(item.Name))
                {
                    throw new AppValidationException("Each budgetData item must have a name.");
                }

                if (item.Planned < 0 || item.Actual < 0)
                {
                    throw new AppValidationException("Planned/Actual must be non-negative.");
                }
            }
        }
    }

    private static void ValidateUpdateRequest(UpdateBudgetRecordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.projectNumber))
        {
            throw new AppValidationException("projectNumber is required.");
        }

        if (string.IsNullOrWhiteSpace(request.ProductNo))
        {
            throw new AppValidationException("ProductNo is required.");
        }

        var title = (request.ProjectTitle ?? request.ProductName)?.Trim();
        if (string.IsNullOrWhiteSpace(title))
        {
            throw new AppValidationException("ProductName (or projectTitle) is required.");
        }

        if (request.Items is null)
        {
            return;
        }

        foreach (var item in request.Items)
        {
            if (item.ItemId <= 0)
            {
                throw new AppValidationException("Each item update must have a valid ItemId.");
            }
        }
    }

    private static IResult ToProblem(ServiceError error)
    {
        var statusCode = error.Code switch
        {
            ErrorCode.Validation => StatusCodes.Status400BadRequest,
            ErrorCode.NotFound => StatusCodes.Status404NotFound,
            ErrorCode.Conflict => StatusCodes.Status409Conflict,
            _ => StatusCodes.Status500InternalServerError
        };

        var title = error.Code switch
        {
            ErrorCode.Validation => "Validation failed",
            ErrorCode.NotFound => "Not found",
            ErrorCode.Conflict => "Conflict",
            _ => "Server error"
        };

        return Results.Problem(new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = error.Message
        });
    }

    private static string DecodeRouteValue(string value, string paramName)
    {
        try
        {
            // Swagger/Kestrel may keep reserved chars like "/" percent-encoded in route params (e.g. %2F).
            // Decode it so string comparisons match values stored in the database.
            return Uri.UnescapeDataString(value).Trim();
        }
        catch (Exception exception) when (exception is UriFormatException or ArgumentException)
        {
            throw new AppValidationException($"Invalid {paramName}.");
        }
    }
}
