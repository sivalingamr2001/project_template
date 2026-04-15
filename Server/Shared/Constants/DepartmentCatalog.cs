namespace Server.Shared.Constants;

public static class DepartmentCatalog
{
    private static readonly Dictionary<int, string> Departments = new()
    {
        { 101, "IT" },
        { 104, "R&D" },
        { 113, "IED" },
        { 116, "Operations" },
    };

    private static readonly object Sync = new();

    public static IReadOnlyDictionary<int, string> All
    {
        get
        {
            lock (Sync)
            {
                return new Dictionary<int, string>(Departments);
            }
        }
    }

    public static string? TryGetName(int deptId)
    {
        lock (Sync)
        {
            return Departments.TryGetValue(deptId, out var name) ? name : null;
        }
    }

    public static bool TryAdd(int deptId, string deptName)
    {
        if (deptId <= 0 || string.IsNullOrWhiteSpace(deptName))
        {
            return false;
        }

        lock (Sync)
        {
            if (Departments.ContainsKey(deptId))
            {
                return false;
            }

            Departments.Add(deptId, deptName.Trim());
            return true;
        }
    }

    public static bool TryUpdate(int deptId, string deptName)
    {
        if (deptId <= 0 || string.IsNullOrWhiteSpace(deptName))
        {
            return false;
        }

        lock (Sync)
        {
            if (!Departments.ContainsKey(deptId))
            {
                return false;
            }

            Departments[deptId] = deptName.Trim();
            return true;
        }
    }
}
