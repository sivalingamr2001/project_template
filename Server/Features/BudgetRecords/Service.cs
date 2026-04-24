using Dapper;
using Microsoft.EntityFrameworkCore;
using Oracle.ManagedDataAccess.Client;
using Server.Domain.Common;
using Server.Domain.Entities;
using Server.Domain.Errors;
using Server.Infrastructure.Db;

namespace Server.Features.BudgetRecords;

public sealed class BudgetRecordsService(
    AppDbContext dbContext,
    ILogger<BudgetRecordsService> logger)
{
    private sealed record BudgetTrendAggregate(DateTime CreatedOn, decimal Planned, decimal Actual);

    public async Task<Result<IReadOnlyList<BudgetRecordProductNoDto>>> SearchByProductNoAsync(
    string searchTerm,
    IConfiguration configuration,
    CancellationToken cancellationToken)
    {
        try
        {
            var connectionString = configuration["Database:PLMConnectionString"];

            const string sql = @"
                SELECT 
                    PROJECTNUMBER, 
                    PRODUCT_NO,
                    PROJECTNAME as ProjectName
                FROM JAN_PLM_PROJECT_HEADER_V 
                WHERE PRODUCT_NO LIKE :Query || '%'";

            using var connection = new OracleConnection(connectionString);

            // This line throws the exception if the user types quickly
            var results = await connection.QueryAsync<BudgetRecordProductNoDto>(
                new CommandDefinition(sql, new { Query = searchTerm }, cancellationToken: cancellationToken)
            );

                return Result<IReadOnlyList<BudgetRecordProductNoDto>>.Success(results.ToList().AsReadOnly());
        }
        catch (OperationCanceledException)
        {
            // Return an empty list or a specific "Cancelled" result
            return Result<IReadOnlyList<BudgetRecordProductNoDto>>.Success(new List<BudgetRecordProductNoDto>().AsReadOnly());
        }
        catch (Exception ex)
        {
            // Handle actual database errors here
            throw;
        }
    }

    public async Task<Result<IReadOnlyList<BudgetRecordSummaryDto>>> GetAllAsync(CancellationToken cancellationToken)
    {
        var budgets = await dbContext.Budgets
            .AsNoTracking()
            .Where(b => b.IsActive == 1)
            .OrderByDescending(b => b.ModifiedOn)
            .Select(b => new BudgetRecordSummaryDto(
                b.BudgetId,
                b.ProjectCode,
                b.ProductNo,
                b.ProjectTitle,
                b.EmployeeId,
                b.ModifiedOn))
            .ToListAsync(cancellationToken);

        return budgets;
    }

    public async Task<Result<BudgetRecordDto>> GetByIdAsync(int budgetId, CancellationToken cancellationToken)
    {
        var budgetHeader = await dbContext.Budgets
            .AsNoTracking()
            .Where(b => b.BudgetId == budgetId && b.IsActive == 1)
            .Select(b => new BudgetRecordHeaderDto(
                b.BudgetId,
                b.EmployeeId,
                b.ProjectCode,
                b.ProductNo,
                b.ProjectTitle,
                b.CreatedOn,
                b.ModifiedOn))
            .SingleOrDefaultAsync(cancellationToken);

        if (budgetHeader is null)
        {
            return BudgetErrors.NotFound(budgetId);
        }

        var categories = await dbContext.BudgetCategories
            .AsNoTracking()
            .Where(c => c.BudgetId == budgetId)
            .OrderBy(c => c.CategoryId)
            .Select(c => new BudgetCategoryDto(
                c.CategoryId,
                c.CategoryName,
                c.Items
                    .OrderBy(i => i.ItemId)
                    .Select(i => new BudgetItemDto(i.ItemId, i.ItemName, i.Planned, i.Actual))
                    .ToList()))
            .ToListAsync(cancellationToken);

        return new BudgetRecordDto(budgetHeader, categories);
    }

    public async Task<Result<BudgetRecordDto>> GetByProductNoAsync(string productNo, CancellationToken cancellationToken)
    {
        var code = productNo.Trim();

        var budgetId = await dbContext.Budgets
            .AsNoTracking()
            .Where(b => b.ProductNo == code && b.IsActive == 1)
            .Select(b => (int?)b.BudgetId)
            .SingleOrDefaultAsync(cancellationToken);

        return budgetId is null
            ? BudgetErrors.NotFoundByProductNo(code)
            : await GetByIdAsync(budgetId.Value, cancellationToken);
    }

    public async Task<Result<BudgetRecordDto>> GetByProjectCodeAndProductNoAsync(
        string projectCode,
        string productNo,
        CancellationToken cancellationToken)
    {
        var code = projectCode.Trim();
        var product = productNo.Trim();

        var budgetId = await dbContext.Budgets
            .AsNoTracking()
            .Where(b => b.ProjectCode == code && b.ProductNo == product && b.IsActive == 1)
            .Select(b => (int?)b.BudgetId)
            .SingleOrDefaultAsync(cancellationToken);

        return budgetId is null
            ? BudgetErrors.NotFoundByProjectCodeAndProductNo(code, product)
            : await GetByIdAsync(budgetId.Value, cancellationToken);
    }

    public async Task<Result<BudgetSummaryDto>> GetSummaryAsync(
        string? period,
        DateTime? from,
        DateTime? to,
        CancellationToken ct)
    {
        var now = DateTime.UtcNow;
        DateTime startDate;
        DateTime endDate;

        // 1. Resolve Timeframe Logic
        if (from.HasValue)
        {
            startDate = from.Value.Date;
            endDate = to.HasValue ? to.Value.Date.AddDays(1) : now.AddDays(1);
        }
        else
        {
            startDate = period?.ToLower() switch
            {
                "yearly" => new DateTime(now.Year, 1, 1),
                "quarterly" => new DateTime(now.Year, ((now.Month - 1) / 3) * 3 + 1, 1),
                _ => new DateTime(now.Year, now.Month, 1) // Default Monthly
            };
            endDate = now.AddDays(1);
        }

        // 2. Query and Aggregate
        // We calculate sums by flattening the relationship: Budget -> Categories -> Items
        var summary = await dbContext.Budgets
            .Where(b => b.CreatedOn >= startDate && b.CreatedOn < endDate)
            .Select(b => new
            {
                Planned = b.Categories.SelectMany(c => c.Items).Sum(i => i.Planned),
                Actual = b.Categories.SelectMany(c => c.Items).Sum(i => i.Actual)
            })
            .GroupBy(x => 1) // Aggregate all matching records into one result
            .Select(g => new BudgetSummaryDto
            {
                TotalPlanned = g.Sum(x => x.Planned),
                TotalActual = g.Sum(x => x.Actual),
                ActiveProjects = g.Count(),
                AppliedFrom = startDate,
                AppliedTo = endDate.AddSeconds(-1)
            })
            .FirstOrDefaultAsync(ct);

        // 3. Return result or empty DTO if no records found
        return summary ?? new BudgetSummaryDto
        {
            AppliedFrom = startDate,
            AppliedTo = endDate.AddSeconds(-1)
        };
    }

    public async Task<Result<IReadOnlyList<BudgetTrendPointDto>>> GetTrendAsync(
        string? type,
        string? projectCode,
        CancellationToken ct)
    {
        var now = DateTime.UtcNow;
        var normalizedType = type?.Trim().ToLowerInvariant();

        IQueryable<Budget> query = dbContext.Budgets
            .AsNoTracking()
            .Where(b => b.IsActive == 1);

        if (!string.IsNullOrWhiteSpace(projectCode))
        {
            var trimmedProjectCode = projectCode.Trim();
            query = query.Where(b => b.ProjectCode == trimmedProjectCode);
        }

        var rawPoints = await query
            .Select(b => new
            {
                b.CreatedOn,
                Planned = b.Categories.SelectMany(c => c.Items).Sum(i => i.Planned),
                Actual = b.Categories.SelectMany(c => c.Items).Sum(i => i.Actual)
            })
            .Select(x => new BudgetTrendAggregate(x.CreatedOn, x.Planned, x.Actual))
            .ToListAsync(ct);

        List<BudgetTrendPointDto> points = normalizedType switch
        {
            "yearly" => BuildYearlyTrend(rawPoints, now),
            "quarterly" => BuildQuarterlyTrend(rawPoints, now),
            _ => BuildMonthlyTrend(rawPoints, now)
        };

        return points;
    }

    private static List<BudgetTrendPointDto> BuildMonthlyTrend(
        IReadOnlyList<BudgetTrendAggregate> rawPoints,
        DateTime now)
    {
        var monthStarts = Enumerable.Range(0, 6)
            .Select(offset => new DateTime(now.Year, now.Month, 1).AddMonths(-(5 - offset)))
            .ToList();

        return monthStarts.Select(monthStart =>
        {
            var monthEnd = monthStart.AddMonths(1);
            var matching = rawPoints.Where(point =>
                point.CreatedOn >= monthStart && point.CreatedOn < monthEnd);

            var planned = matching.Sum(point => (decimal)point.Planned);
            var actual = matching.Sum(point => (decimal)point.Actual);

            return new BudgetTrendPointDto(
                monthStart.ToString("MMM"),
                planned,
                actual,
                planned - actual
            );
        }).ToList();
    }

    private static List<BudgetTrendPointDto> BuildQuarterlyTrend(
        IReadOnlyList<BudgetTrendAggregate> rawPoints,
        DateTime now)
    {
        var currentQuarter = ((now.Month - 1) / 3) + 1;
        var quarterStarts = Enumerable.Range(0, 4)
            .Select(offset =>
            {
                var index = 3 - offset;
                var target = new DateTime(now.Year, ((currentQuarter - 1) * 3) + 1, 1)
                    .AddMonths(-3 * index);
                return target;
            })
            .ToList();

        return quarterStarts.Select(quarterStart =>
        {
            var quarterEnd = quarterStart.AddMonths(3);
            var matching = rawPoints.Where(point =>
                point.CreatedOn >= quarterStart && point.CreatedOn < quarterEnd);

            var planned = matching.Sum(point => (decimal)point.Planned);
            var actual = matching.Sum(point => (decimal)point.Actual);
            var quarter = ((quarterStart.Month - 1) / 3) + 1;

            return new BudgetTrendPointDto(
                $"Q{quarter} {quarterStart:yy}",
                planned,
                actual,
                planned - actual
            );
        }).ToList();
    }

    private static List<BudgetTrendPointDto> BuildYearlyTrend(
        IReadOnlyList<BudgetTrendAggregate> rawPoints,
        DateTime now)
    {
        var years = Enumerable.Range(now.Year - 4, 5).ToList();

        return years.Select(year =>
        {
            var yearStart = new DateTime(year, 1, 1);
            var yearEnd = yearStart.AddYears(1);
            var matching = rawPoints.Where(point =>
                point.CreatedOn >= yearStart && point.CreatedOn < yearEnd);

            var planned = matching.Sum(point => (decimal)point.Planned);
            var actual = matching.Sum(point => (decimal)point.Actual);

            return new BudgetTrendPointDto(
                year.ToString(),
                planned,
                actual,
                planned - actual
            );
        }).ToList();
    }

    public async Task<Result<BudgetRecordDto>> CreateAsync(CreateBudgetRecordRequest request, CancellationToken cancellationToken)
    {
        var projectCode = request.ProjectCode.Trim();
        var productNo = request.ProductNo.Trim();
        var projectTitle = (request.ProjectTitle ?? request.ProductName ?? string.Empty).Trim();

        // Start the Transaction at the very beginning
        using var transaction = await dbContext.Database.BeginTransactionAsync(cancellationToken);

        try
        {
            // 1. Validation Checks (Using Count > 0 for Oracle 19c compatibility)
            var employeeExists = await dbContext.Employees
                .Where(e => e.EmployeeId == request.EmployeeId)
                .CountAsync(cancellationToken) > 0;

            if (!employeeExists)
            {
                return new ServiceError($"Employee '{request.EmployeeId}' was not found.", ErrorCode.Validation);
            }

            if (await dbContext.Budgets.CountAsync(b => b.ProjectCode == projectCode, cancellationToken) > 0)
            {
                return BudgetErrors.DuplicateProjectCode(projectCode);
            }

            // 2. Create the Parent Budget Record
            var budget = new Budget
            {
                EmployeeId = request.EmployeeId,
                ProjectCode = projectCode,
                ProductNo = productNo,
                ProjectTitle = projectTitle,
                CreatedOn = DateTime.UtcNow,
                ModifiedOn = DateTime.UtcNow
            };

            dbContext.Budgets.Add(budget);

            // We must save here to generate the BudgetId for the child records
            await dbContext.SaveChangesAsync(cancellationToken);

            var provider = dbContext.Database.ProviderName;
            var isOracle = provider?.Contains("Oracle") == true;
            var nextCategoryId = isOracle
                ? await dbContext.BudgetCategories.MaxAsync(c => (int?)c.CategoryId, cancellationToken) ?? 0
                : 0;
            var nextItemId = isOracle
                ? await dbContext.BudgetItems.MaxAsync(i => (int?)i.ItemId, cancellationToken) ?? 0
                : 0;

            // 3. Handle Categories and Items
            if (request.BudgetData is { Count: > 0 })
            {
                foreach (var c in request.BudgetData)
                {
                    var category = new BudgetCategory
                    {
                        BudgetId = budget.BudgetId,
                        CategoryName = c.Category.Trim(),
                        CategoryId = isOracle ? ++nextCategoryId : 0
                    };

                    foreach (var item in c.Items)
                    {
                        category.Items.Add(new BudgetItem
                        {
                            ItemId = isOracle ? ++nextItemId : 0,
                            ItemName = item.Name.Trim(),
                            Planned = item.Planned,
                            Actual = item.Actual
                        });
                    }
                    dbContext.BudgetCategories.Add(category);
                }
            }
            else
            {
                // Copy from Master Template
                var masterCategories = await dbContext.BudgetCategories
                    .AsNoTracking()
                    .Where(c => c.BudgetId == null)
                    .Include(c => c.Items)
                    .ToListAsync(cancellationToken);

                foreach (var master in masterCategories)
                {
                    var newCategory = new BudgetCategory
                    {
                        BudgetId = budget.BudgetId,
                        CategoryName = master.CategoryName,
                        CategoryId = isOracle ? ++nextCategoryId : 0
                    };

                    foreach (var mItem in master.Items)
                    {
                        newCategory.Items.Add(new BudgetItem
                        {
                            ItemId = isOracle ? ++nextItemId : 0,
                            ItemName = mItem.ItemName,
                            Planned = 0,
                            Actual = 0
                        });
                    }
                    dbContext.BudgetCategories.Add(newCategory);
                }
            }

            // 4. Final Save (Categories and Items)
            await dbContext.SaveChangesAsync(cancellationToken);

            // 5. COMMIT: Everything is successful, save changes permanently
            await transaction.CommitAsync(cancellationToken);

            return await GetByIdAsync(budget.BudgetId, cancellationToken);
        }
        catch (Exception ex)
        {
            // 6. ROLLBACK: If ANY error occurs (including ORA-00001), 
            // the Budget created in Step 2 is removed from the database.
            await transaction.RollbackAsync(cancellationToken);

            logger.LogError(ex, "Transaction failed. All changes rolled back for Project: {ProjectCode}", projectCode);

            // Return a clean error message instead of crashing
            if (ex.InnerException is OracleException oex && oex.Number == 1)
            {
                return new ServiceError("Database Constraint Error: Category ID conflict. Contact Admin.", ErrorCode.Conflict);
            }

            throw; // Or return a generic service error
        }
    }

    public async Task<Result<BudgetRecordDto>> UpdateAsync(
        int budgetId,
        UpdateBudgetRecordRequest request,
        CancellationToken cancellationToken)
    {
        var budget = await dbContext.Budgets.SingleOrDefaultAsync(
            b => b.BudgetId == budgetId && b.IsActive == 1,
            cancellationToken);
        if (budget is null)
        {
            return BudgetErrors.NotFound(budgetId);
        }

        var projectCode = request.ProjectCode.Trim();
        var productNo = request.ProductNo.Trim();
        var projectTitle = request.ProjectTitle.Trim();

        if (!string.Equals(budget.ProjectCode, projectCode, StringComparison.OrdinalIgnoreCase))
        {
            var duplicate = await dbContext.Budgets.AnyAsync(
                b => b.ProjectCode == projectCode && b.BudgetId != budgetId,
                cancellationToken);

            if (duplicate)
            {
                return BudgetErrors.DuplicateProjectCode(projectCode);
            }
        }

        budget.ProjectCode = projectCode;
        budget.ProductNo = productNo;
        budget.ProjectTitle = projectTitle;
        budget.ModifiedOn = DateTime.UtcNow;

        var itemUpdates = request.Items ?? Array.Empty<BudgetItemUpdateDto>();

        if (itemUpdates.Count > 0)
        {
            var updatesById = itemUpdates
                .GroupBy(i => i.ItemId)
                .ToDictionary(g => g.Key, g => g.Last());

            var itemIds = updatesById.Keys.ToArray();

            var items = await dbContext.BudgetItems
                .Where(i => itemIds.Contains(i.ItemId) && i.Category.BudgetId == budgetId)
                .ToListAsync(cancellationToken);

            if (items.Count != itemIds.Length)
            {
                return new ServiceError("One or more items were not found for this budget.", ErrorCode.Validation);
            }

            foreach (var item in items)
            {
                var update = updatesById[item.ItemId];
                item.Planned = update.Planned;
                item.Actual = update.Actual;
            }
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(budgetId, cancellationToken);
    }

    public async Task<Result> DeleteAsync(int budgetId, CancellationToken cancellationToken)
    {
        var budget = await dbContext.Budgets
            .SingleOrDefaultAsync(b => b.BudgetId == budgetId && b.IsActive == 1, cancellationToken);

        if (budget is null)
        {
            return Result.Failure(BudgetErrors.NotFound(budgetId));
        }

        budget.IsActive = 0;
        budget.ModifiedOn = DateTime.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
