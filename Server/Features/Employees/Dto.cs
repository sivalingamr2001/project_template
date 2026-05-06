using System.Linq;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Server.Features.Employees;

public sealed record EmployeeSummaryDto(
    int EmployeeId,
    string Name,
    string Email,
    long Phone,
    int DepartmentId,
    string DepartmentName,
    string TeamName,
    string Role);

public sealed record EmployeeDto(
    int EmployeeId,
    string Name,
    string Email,
    long Phone,
    int DepartmentId,
    string DepartmentName,
    string TeamName,
    string Role);

public sealed record CreateEmployeeRequest
{
    public int EmployeeId { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;

    [JsonConverter(typeof(StringToLongJsonConverter))]
    public long Phone { get; init; }
    public int DepartmentId { get; init; }
    public string DepartmentName { get; init; } = string.Empty;
    public string TeamName { get; init; }
    public string Role { get; init; } = string.Empty;
    public string? Password { get; init; }
}

public sealed record UpdateEmployeeRequest
{
    public string Name { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;

    [JsonConverter(typeof(StringToLongJsonConverter))]
    public long Phone { get; init; }
    public int DepartmentId { get; init; }
    public string DepartmentName { get; init; } = string.Empty;
    public string TeamName { get; init; }
    public string Role { get; init; } = string.Empty;
    public string? Password { get; init; }
}

internal sealed class StringToLongJsonConverter : JsonConverter<long>
{
    public override long Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.Number)
        {
            return reader.GetInt64(); // Changed to Int64
        }

        if (reader.TokenType == JsonTokenType.String)
        {
            var text = reader.GetString();
            if (string.IsNullOrWhiteSpace(text)) throw new JsonException("Phone required.");

            var digits = new string(text.Where(char.IsDigit).ToArray());

            // Use long.TryParse instead of int.TryParse
            if (!long.TryParse(digits, out var value))
            {
                throw new JsonException($"Phone number '{text}' is too long or invalid.");
            }

            return value;
        }
        throw new JsonException("Invalid format.");
    }

    public override void Write(Utf8JsonWriter writer, long value, JsonSerializerOptions options)
    {
        writer.WriteNumberValue(value);
    }
}
