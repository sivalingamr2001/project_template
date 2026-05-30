using DataEngine.Abstractions;
using DataEngine.Model;

namespace DataEngine.Services;

public class QueryValidator : IQueryValidator
{
    private static readonly HashSet<string> AllowedOperators = new(StringComparer.OrdinalIgnoreCase)
    {
        "eq", "neq", "gt", "lt", "gte", "lte", "contains", "startswith", "endswith"
    };

    public (bool IsValid, string FailureReason) ValidateQueryConfig(FetchConfig config)
    {
        if (config.EnableDirectQueryExecution && string.IsNullOrWhiteSpace(config.QueryText))
        {
            return (false, "Direct query execution enabled but QueryText is null or empty.");
        }

        if (config.EnableServerSideFiltering && config.FilterConditions != null)
        {
            foreach (var filter in config.FilterConditions)
            {
                if (string.IsNullOrWhiteSpace(filter.Field))
                {
                    return (false, "Filter field target cannot be null or blank space characters.");
                }

                if (!AllowedOperators.Contains(filter.Operator))
                {
                    return (false, $"Unsupported operator pattern passed: '{filter.Operator}'");
                }
            }
        }

        if (config.EnableServerSideSorting && string.IsNullOrWhiteSpace(config.SortField))
        {
            return (false, "Server side sorting enabled but SortField targets blank values.");
        }

        return (true, string.Empty);
    }
}
