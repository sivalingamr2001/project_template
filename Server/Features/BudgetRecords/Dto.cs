using System.Text.Json.Serialization;
using Server.Features.Template;

namespace Server.Features.BudgetRecords;

public sealed class CreateBudgetRecordRequest
{
    public int EmployeeId { get; init; }
    public string projectNumber { get; init; } = string.Empty;
    public string ProductNo { get; init; } = string.Empty;

    [JsonPropertyName("templateId")]
    public int? TemplateId { get; init; }

    // Client sometimes sends "productName" instead of "projectTitle".
    [JsonPropertyName("productName")]
    public string? ProductName { get; init; }

    [JsonPropertyName("projectTitle")]
    public string? ProjectTitle { get; init; }

    // Client sends "budgetData": [{ category, items: [{ name, planned, actual }] }]
    [JsonPropertyName("budgetData")]
    public IReadOnlyList<CreateBudgetCategoryRequest>? BudgetData { get; init; }
}

public record UpdateBudgetRecordStatusRequest(
    List<int> BudgetId,
    bool IsActive
);

public sealed class CreateBudgetCategoryRequest
{
    [JsonPropertyName("category")]
    public string Category { get; init; } = string.Empty;

    [JsonPropertyName("items")]
    public IReadOnlyList<CreateBudgetItemRequest> Items { get; init; } = Array.Empty<CreateBudgetItemRequest>();
}

public sealed class CreateBudgetItemRequest
{
    [JsonPropertyName("name")]
    public string Name { get; init; } = string.Empty;

    [JsonPropertyName("planned")]
    public decimal Planned { get; init; }

    [JsonPropertyName("actual")]
    public decimal Actual { get; init; }
}

public sealed class UpdateBudgetRecordRequest
{
    public string projectNumber { get; init; } = string.Empty;
    public string ProductNo { get; init; } = string.Empty;

    [JsonPropertyName("productName")]
    public string? ProductName { get; init; }

    [JsonPropertyName("projectTitle")]
    public string? ProjectTitle { get; init; }

    [JsonPropertyName("items")]
    public IReadOnlyList<BudgetItemUpdateDto>? Items { get; init; }
}

public sealed class UpdateBudgetStatusRequest
{
    [JsonPropertyName("status")]
    public string Status { get; init; } = string.Empty;

    [JsonPropertyName("approverId")]
    public int ApproverId { get; init; }

    [JsonPropertyName("comments")]
    public string? Comments { get; init; }
}

public sealed record BudgetItemUpdateDto(int ItemId, decimal Planned, decimal Actual);

public sealed record BudgetRecordSummaryDto(
    int BudgetId,
    string projectNumber,
    string ProductNo,
    string ProjectTitle,
    int EmployeeId,
    DateTime CreatedOn,
    DateTime ModifiedOn,
    string ApprovalStatus,
    bool IsActive);

public record BudgetRecordSummaryDtoWithplanedandactual(
    int BudgetId,
    string ProjectNumber,
    string ProductNo,
    string ProjectName,
    int EmployeeId,
    string TeamName,
    DateTime CreatedOn,
    DateTime ModifiedOn,
    string Status,
    bool IsActive,
    decimal Planned,
    decimal Actual,
    decimal Variance,
    decimal UsagePercentage
);


public class BudgetRecordProductNoDto
{
    public string? ProjectNumber { get; set; }

    public string? Product_No { get; set; }

    public string? ProjectName { get; set; }

    public string? TeamName { get; set; }
}

public sealed record BudgetRecordDto(
    BudgetRecordHeaderDto Header,
    IReadOnlyList<BudgetCategoryDto> Categories,
    IReadOnlyList<TemplateStructureDto>? TemplateStructure);

public sealed record BudgetRecordHeaderDto(
    int BudgetId,
    int EmployeeId,
    string projectNumber,
    string ProductNo,
    string ProjectTitle,
    DateTime CreatedOn,
    DateTime ModifiedOn,
    string ApprovalStatus,
    bool IsActive)
{
    [JsonPropertyName("productName")]
    public string ProductName => ProjectTitle;
}

public sealed record BudgetCategoryDto(int CategoryId, string CategoryName, IReadOnlyList<BudgetItemDto> Items);

public sealed record BudgetItemDto(int ItemId, string ItemName, decimal Planned, decimal Actual);


public record BudgetSummaryDto
{
    public decimal TotalPlanned { get; init; }
    public decimal TotalActual { get; init; }
    public int ActiveProjects { get; init; }

    // Date Metadata
    public DateTime GeneratedAt { get; init; } = DateTime.UtcNow;
    public DateTime AppliedFrom { get; init; }
    public DateTime AppliedTo { get; init; }

    // Logic
    public decimal Variance => TotalPlanned - TotalActual;
    public decimal VariancePct => TotalPlanned != 0 ? (Variance / TotalPlanned) * 100 : 0;
    public decimal UtilisationPct => TotalPlanned != 0 ? (TotalActual / TotalPlanned) * 100 : 0;
}

public sealed record BudgetTrendPointDto(
    string Label,
    decimal Planned,
    decimal Actual,
    decimal Variance);

public sealed record BudgetApprovalRequest(
    int BudgetId,
    int ApproverId,
    bool IsApproved,
    string? Comments
);
