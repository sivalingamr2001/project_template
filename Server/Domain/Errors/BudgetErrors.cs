namespace Server.Domain.Errors;

public static class BudgetErrors
{
    public static ServiceError NotFoundBudget()
        => new($"Budgets was not found.", ErrorCode.NoContent);

    public static ServiceError NotFound(int budgetId)
        => new($"Budget with ID '{budgetId}' was not found.", ErrorCode.NoContent);

    public static ServiceError NoneFound(IEnumerable<int> budgetIds)
    => new($"No budgets were found for the provided IDs: {string.Join(", ", budgetIds)}", ErrorCode.NoContent);

    public static ServiceError NotFoundByProductNo(string productNo)
        => new($"Budget with product no '{productNo}' was not found.", ErrorCode.NoContent);

    public static ServiceError NotFoundByProjectNumberAndProductNo(string projectNumber, string productNo)
        => new($"Budget for project '{projectNumber}' and product '{productNo}' was not found.", ErrorCode.NoContent);

    public static ServiceError NoDataFound(string projectNumber, string productNo)
        => new($"No budget record exists for '{projectNumber}'/'{productNo}'.", ErrorCode.NoContent);

    public static ServiceError DuplicateProjectNumber(string projectNumber)
        => new($"A budget with project code '{projectNumber}' already exists.", ErrorCode.Conflict);

    public static ServiceError InvalidCategory(int categoryId)
        => new($"Category with ID '{categoryId}' does not exist.", ErrorCode.Validation);

    public static ServiceError InvalidItem(int itemId, int categoryId)
        => new($"Item '{itemId}' does not belong to category '{categoryId}'.", ErrorCode.Validation);

    public static ServiceError TemplateNotFound(int templateId)
        => new($"Budget template '{templateId}' was not found.", ErrorCode.Validation);
}

public record ServiceError(string Message, ErrorCode Code);

public enum ErrorCode
{
    NotFound,
    Conflict,
    Validation,
    Unexpected,
    NoContent
}
