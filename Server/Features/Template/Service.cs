using System.Text.Json;
using Janatics.Application.Common.Models;
using Microsoft.EntityFrameworkCore;
using Server.Domain.Entities;
using Server.Infrastructure.Db;

namespace Server.Features.Template;

public class TemplateService(AppDbContext context, ILogger<TemplateService> logger)
{
    public async Task<ApiResult<PagedResult<TemplateResponse>>> GetAllAsync(PagedQuery query, CancellationToken ct)
    {
        try
        {
            query.Normalize();
            var totalCount = await context.BudgetTemplates.CountAsync(ct);

            var items = await context.BudgetTemplates
                .AsNoTracking()
                .OrderBy(t => t.Name)
                .Skip(query.Skip)
                .Take(query.PageSize)
                .ToListAsync(ct);

            var mappedData = items.Select(t => new TemplateResponse(
                t.TemplateId,
                t.Name,
                JsonSerializer.Deserialize<List<TemplateStructureDto>>(t.TemplateJson) ?? []
            )).ToList();

            var paged = new PagedResult<TemplateResponse>
            {
                Data = mappedData,
                TotalCount = totalCount,
                PageNumber = query.PageNumber,
                PageSize = query.PageSize
            };

            return ApiResult<PagedResult<TemplateResponse>>.Ok(paged);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error fetching templates");
            return ApiResult<PagedResult<TemplateResponse>>.Fail("Failed to load templates", [ex.Message]);
        }
    }

    public async Task<ApiResult<TemplateResponse>> GetByIdAsync(int id, CancellationToken ct)
    {
        var t = await context.BudgetTemplates.FindAsync([id], ct);
        if (t == null) return ApiResult<TemplateResponse>.Fail($"Template {id} not found");

        var response = new TemplateResponse(t.TemplateId, t.Name,
            JsonSerializer.Deserialize<List<TemplateStructureDto>>(t.TemplateJson) ?? []);

        return ApiResult<TemplateResponse>.Ok(response);
    }

    public async Task<ApiResult<TemplateResponse>> CreateAsync(TemplateRequest request, CancellationToken ct)
    {
        try
        {
            var entity = new BudgetTemplateEntity
            {
                Name = request.Name,
                TemplateJson = JsonSerializer.Serialize(request.Structure)
            };

            context.BudgetTemplates.Add(entity);
            await context.SaveChangesAsync(ct);

            return ApiResult<TemplateResponse>.Ok(new TemplateResponse(entity.TemplateId, entity.Name, request.Structure));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Create template failed");
            return ApiResult<TemplateResponse>.Fail("Could not save template", [ex.Message]);
        }
    }

    public async Task<ApiResult<TemplateResponse>> UpdateAsync(int id, TemplateRequest request, CancellationToken ct)
    {
        try
        {
            var entity = await context.BudgetTemplates.FindAsync([id], ct);
            if (entity == null)
                return ApiResult<TemplateResponse>.Fail("Template not found");

            entity.Name = request.Name;
            entity.TemplateJson = JsonSerializer.Serialize(request.Structure);

            await context.SaveChangesAsync(ct);

            return ApiResult<TemplateResponse>.Ok(
                new TemplateResponse(entity.TemplateId, entity.Name, request.Structure),
                "Template updated"
            );
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Update template failed");
            return ApiResult<TemplateResponse>.Fail("Could not update template", [ex.Message]);
        }
    }

    public async Task<ApiResult<bool>> DeleteAsync(int id, CancellationToken ct)
    {
        var entity = await context.BudgetTemplates.FindAsync([id], ct);
        if (entity == null) return ApiResult<bool>.Fail("Template not found");

        context.BudgetTemplates.Remove(entity);
        await context.SaveChangesAsync(ct);
        return ApiResult<bool>.Ok(true, "Template deleted");
    }
}
