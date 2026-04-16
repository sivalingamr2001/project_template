using Microsoft.EntityFrameworkCore;
using Server.Domain.Common;
using Server.Domain.Entities;
using Server.Domain.Errors;
using Server.Infrastructure.Db;

namespace Server.Features.BudgetRecords;

public sealed class BudgetRecordsService(
    AppDbContext dbContext,
    ILogger<BudgetRecordsService> logger)
{
    public async Task<Result<IReadOnlyList<BudgetRecordSummaryDto>>> GetAllAsync(CancellationToken cancellationToken)
    {
        var budgets = await dbContext.Budgets
            .AsNoTracking()
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
            .Where(b => b.BudgetId == budgetId)
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

    public async Task<Result<BudgetRecordDto>> GetByProjectCodeAsync(string projectCode, CancellationToken cancellationToken)
    {
        var code = projectCode.Trim();

        var budgetId = await dbContext.Budgets
            .AsNoTracking()
            .Where(b => b.ProjectCode == code)
            .Select(b => (int?)b.BudgetId)
            .SingleOrDefaultAsync(cancellationToken);

        return budgetId is null
            ? BudgetErrors.NotFoundByProjectCode(code)
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
            .Where(b => b.ProjectCode == code && b.ProductNo == product)
            .Select(b => (int?)b.BudgetId)
            .SingleOrDefaultAsync(cancellationToken);

        return budgetId is null
            ? BudgetErrors.NotFoundByProjectCodeAndProductNo(code, product)
            : await GetByIdAsync(budgetId.Value, cancellationToken);
    }

    public async Task<Result<BudgetRecordDto>> CreateAsync(CreateBudgetRecordRequest request, CancellationToken cancellationToken)
    {
        var projectCode = request.ProjectCode.Trim();
        var productNo = request.ProductNo.Trim();
        var projectTitle = (request.ProjectTitle ?? request.ProductName ?? string.Empty).Trim();

        if (!await dbContext.Employees.AnyAsync(e => e.EmployeeId == request.EmployeeId, cancellationToken))
        {
            return new ServiceError($"Employee '{request.EmployeeId}' was not found.", ErrorCode.Validation);
        }

        if (await dbContext.Budgets.AnyAsync(b => b.ProjectCode == projectCode, cancellationToken))
        {
            return BudgetErrors.DuplicateProjectCode(projectCode);
        }

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

        try
        {
            await dbContext.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException exception)
        {
            logger.LogWarning(exception, "Failed to create budget with ProjectCode={ProjectCode}", projectCode);
            return BudgetErrors.DuplicateProjectCode(projectCode);
        }

        var budgetData = request.BudgetData;
        if (budgetData is { Count: > 0 })
        {
            foreach (var c in budgetData)
            {
                var category = new BudgetCategory
                {
                    BudgetId = budget.BudgetId,
                    CategoryName = c.Category.Trim()
                };

                foreach (var item in c.Items)
                {
                    category.Items.Add(new BudgetItem
                    {
                        Category = category,
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
            // Initialize from the "master" categories/items (those without a BudgetId).
            var masterCategories = await dbContext.BudgetCategories
                .AsNoTracking()
                .Where(c => c.BudgetId == null)
                .Include(c => c.Items)
                .OrderBy(c => c.CategoryId)
                .ToListAsync(cancellationToken);

            foreach (var masterCategory in masterCategories)
            {
                var category = new BudgetCategory
                {
                    BudgetId = budget.BudgetId,
                    CategoryName = masterCategory.CategoryName
                };

                foreach (var masterItem in masterCategory.Items.OrderBy(i => i.ItemId))
                {
                    category.Items.Add(new BudgetItem
                    {
                        Category = category,
                        ItemName = masterItem.ItemName,
                        Planned = 0,
                        Actual = 0
                    });
                }

                dbContext.BudgetCategories.Add(category);
            }
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(budget.BudgetId, cancellationToken);
    }

    public async Task<Result<BudgetRecordDto>> UpdateAsync(
        int budgetId,
        UpdateBudgetRecordRequest request,
        CancellationToken cancellationToken)
    {
        var budget = await dbContext.Budgets.SingleOrDefaultAsync(b => b.BudgetId == budgetId, cancellationToken);
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
            .Include(b => b.Categories)
            .ThenInclude(c => c.Items)
            .SingleOrDefaultAsync(b => b.BudgetId == budgetId, cancellationToken);

        if (budget is null)
        {
            return Result.Failure(BudgetErrors.NotFound(budgetId));
        }

        dbContext.Budgets.Remove(budget);
        await dbContext.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
