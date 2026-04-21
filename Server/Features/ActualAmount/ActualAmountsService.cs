namespace Server.Features.ActualAmount;

public class ActualAmountItem
{
    public string Category { get; set; } = string.Empty;
    public string SubCategory { get; set; } = string.Empty;
    public decimal Amount { get; set; }
}

public class ActualAmountsRequest
{
    public string ProjectCode { get; set; } = string.Empty;
    public string ProductNo { get; set; } = string.Empty;
}

public class ActualAmountsResponse
{
    public string ProjectCode { get; set; } = string.Empty;
    public string ProductNo { get; set; } = string.Empty;
    public List<ActualAmountItem> Items { get; set; } = new();
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
}

// Mock data service
public class ActualAmountsService
{
    // Mock database of actual amounts
    private static readonly Dictionary<string, List<ActualAmountItem>> MockActualAmounts = new()
    {
        {
            "NPD-2025-07:RD-001",
            new List<ActualAmountItem>
            {
                new() { Category = "Personnel", SubCategory = "Labor cost", Amount = 45000 },
                new() { Category = "Personnel", SubCategory = "Consulting fees", Amount = 12000 },
                new() { Category = "Materials", SubCategory = "Consumables", Amount = 8500 },
                new() { Category = "Materials", SubCategory = "Prototype parts", Amount = 22000 },
                new() { Category = "Equipment", SubCategory = "Machinery", Amount = 35000 },
                new() { Category = "Equipment", SubCategory = "Test instruments", Amount = 15000 },
            }
        },
        {
            "NPD-2025-08:RD-002",
            new List<ActualAmountItem>
            {
                new() { Category = "Engineering Labour", SubCategory = "Design Engineering Hours", Amount = 110000 },
                new() { Category = "Engineering Labour", SubCategory = "Tooling & Jig Development", Amount = 91000 },
                new() { Category = "Material & Components", SubCategory = "Purchased Parts — Solenoid Coils", Amount = 15000 },
                new() { Category = "Testing & Validation", SubCategory = "Environmental & Fatigue Testing", Amount = 44000 },
            }
        }
    };

    public static ActualAmountsResponse GetActualAmounts(string projectCode, string productNo)
    {
        var key = $"{productNo}:{projectCode}";
        
        if (!MockActualAmounts.TryGetValue(key, out var amounts))
        {
            // Return empty list if no mock data found
            return new ActualAmountsResponse
            {
                ProjectCode = projectCode,
                ProductNo = productNo,
                Items = new List<ActualAmountItem>(),
                LastUpdated = DateTime.UtcNow,
            };
        }

        return new ActualAmountsResponse
        {
            ProjectCode = projectCode,
            ProductNo = productNo,
            Items = amounts,
            LastUpdated = DateTime.UtcNow,
        };
    }

    // Template for database integration (requires Dapper NuGet package)
    // When ready to use real database:
    // 1. Install Dapper: dotnet add package Dapper
    // 2. Uncomment the using Dapper; statement at top of file
    // 3. Uncomment the method below
    // 4. Call this method from ActualAmountsEndpoints instead of GetActualAmounts()
    /*
    public static async Task<ActualAmountsResponse> GetActualAmountsFromDbAsync(
        AppDbContext dbContext,
        string projectCode,
        string productNo,
        CancellationToken ct = default)
    {
        try
        {
            using var connection = dbContext.Database.GetDbConnection();
            
            if (connection.State == System.Data.ConnectionState.Closed)
            {
                connection.Open();
            }

            const string query = @"
                SELECT 
                    Category,
                    SubCategory,
                    Amount
                FROM ActualAmounts
                WHERE ProjectCode = @ProjectCode 
                    AND ProductNo = @ProductNo
                    AND IsActive = 1
                ORDER BY Category, SubCategory";

            var items = (await connection.QueryAsync<ActualAmountItem>(
                query,
                new { ProjectCode = projectCode, ProductNo = productNo }
            )).ToList();

            return new ActualAmountsResponse
            {
                ProjectCode = projectCode,
                ProductNo = productNo,
                Items = items,
                LastUpdated = DateTime.UtcNow,
            };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error fetching actual amounts: {ex.Message}");
            return new ActualAmountsResponse
            {
                ProjectCode = projectCode,
                ProductNo = productNo,
                Items = new List<ActualAmountItem>(),
                LastUpdated = DateTime.UtcNow,
            };
        }
    }
    */
}
