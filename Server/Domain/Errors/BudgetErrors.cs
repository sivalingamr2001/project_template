namespace Server.Domain.Errors;

public static class BudgetErrors
{
    public static ServiceError NotFound(int budgetId)
        => new($"Budget with ID '{budgetId}' was not found.", ErrorCode.NotFound);

    public static ServiceError NotFoundByProjectCode(string projectCode)
        => new($"Budget with project code '{projectCode}' was not found.", ErrorCode.NotFound);

    public static ServiceError NotFoundByProjectCodeAndProductNo(string projectCode, string productNo)
        => new($"Budget for project '{projectCode}' and product '{productNo}' was not found.", ErrorCode.NotFound);

    public static ServiceError DuplicateProjectCode(string projectCode)
        => new($"A budget with project code '{projectCode}' already exists.", ErrorCode.Conflict);

    public static ServiceError InvalidCategory(int categoryId)
        => new($"Category with ID '{categoryId}' does not exist.", ErrorCode.Validation);

    public static ServiceError InvalidItem(int itemId, int categoryId)
        => new($"Item '{itemId}' does not belong to category '{categoryId}'.", ErrorCode.Validation);
}

public record ServiceError(string Message, ErrorCode Code);

public enum ErrorCode
{
    NotFound,
    Conflict,
    Validation,
    Unexpected
}
