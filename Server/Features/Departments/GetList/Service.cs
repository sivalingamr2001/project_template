using Dapper;
using Microsoft.EntityFrameworkCore;
using MySqlConnector;
using Server.Domain.Entities;
using Server.Features.Common;
using Server.Infrastructure.Db;
using Server.Shared.Helpers;

namespace Server.Features.Departments.GetList;

public sealed class GetDepartmentsService(
    AppDbContext dbContext,
    ConnectionStrings connectionStrings,
    ILogger<GetDepartmentsService> logger)
{
    public async Task<PaginatedResponse<DepartmentDto>> GetAsync(
        GetDepartmentQuery query,
        CancellationToken cancellationToken)
    {
        // 1. Always fetch ALL department records from the external CMPL system master list
        var cmplRecords = await GetDepartmentIdFromCmplAsync(cancellationToken);
        var cmplIds = cmplRecords.Select(r => r.DepartmentId).Distinct().ToList();

        if (cmplIds.Count != 0)
        {
            // 2. Identify which master IDs already exist locally
            var existingIds = await dbContext.Departments
                .AsNoTracking()
                .Where(dept => cmplIds.Contains(dept.DepartmentId))
                .Select(dept => dept.DepartmentId)
                .ToListAsync(cancellationToken);

            // 3. Extract IDs that are missing in the local database entirely
            var missingIds = cmplIds.Except(existingIds).ToList();

            if (missingIds.Count != 0)
            {
                var newDepartments = missingIds.Select(id => new DepartmentEntity
                {
                    DepartmentId = id,
                    DepartmentName = null // Handled cleanly by your database drop constraint change
                }).ToList();

                await dbContext.Departments.AddRangeAsync(newDepartments);
                await dbContext.SaveChangesAsync(cancellationToken);
            }
        }

        // 4. Load ALL local entries matching the CMPL master list, along with their HOD references
        var localDepartments = await dbContext.Departments
            .AsNoTracking()
            .Include(dept => dept.Hod)
            .Where(dept => cmplIds.Contains(dept.DepartmentId))
            .ToListAsync(cancellationToken);

        // Turn it into a fast lookup dictionary to capture names if available
        var localDeptMap = localDepartments.ToDictionary(d => d.DepartmentId);

        // 5. Ensure EVERY SINGLE CMPL ID is returned in the output collection
        // Fall back gracefully to placeholder properties if 'dept_name' is missing or null locally
        var items = cmplIds.Select(id =>
        {
            localDeptMap.TryGetValue(id, out var localDept);

            return new DepartmentDto
            {
                DepartmentId = id,
                DepartmentName = localDept?.DepartmentName ?? "N/A", // Always falls back gracefully instead of hiding records
                HodId = localDept?.HodId ?? 0,
                HOD = localDept?.Hod != null ? new HodDto
                {
                    HodName = string.Empty,
                    HodEmail = string.Empty,
                    HodEmployeeId = string.Empty
                } : null
            };
        }).ToList();

        // 6. Return the total unconditional dataset payload matching your required format structure
        return new PaginatedResponse<DepartmentDto>(
            items,
            items.Count,
            query.NormalizedPage,
            items.Count);
    }

    public async Task<List<DepartmentIdDto>> GetDepartmentIdFromCmplAsync(CancellationToken cancellationToken)
    {
        try
        {
            using var connection = new MySqlConnection(connectionStrings.Cmpl);

            var results = await connection.QueryAsync<DepartmentIdDto>(
                new CommandDefinition(Queries.GetDepartmentIdQuery, cancellationToken: cancellationToken)
            );

            return results.AsList();
        }
        catch (MySqlException ex)
        {
            logger.LogError(ex, "A database error occurred while fetching HOD master records.");
            throw new InvalidOperationException("An error occurred while fetching HOD records.", ex);
        }
    }
}

public sealed record DepartmentIdDto(int DepartmentId);
