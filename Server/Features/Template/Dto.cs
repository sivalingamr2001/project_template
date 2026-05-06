using System.Text.Json;
using System.Text.Json.Serialization;

namespace Server.Features.Template;

public sealed class TemplateStructureDto
{
    [JsonPropertyName("category")]
    public string Category { get; init; } = string.Empty;

    [JsonPropertyName("items")]
    public List<TemplateItemDto> Items { get; init; } = [];

    [JsonPropertyName("subCategories")]
    public List<TemplateSubCategoryDto> SubCategories { get; init; } = [];
}

public sealed class TemplateSubCategoryDto
{
    [JsonPropertyName("name")]
    public string Name { get; init; } = string.Empty;

    [JsonPropertyName("items")]
    public List<TemplateItemDto> Items { get; init; } = [];
}

[JsonConverter(typeof(TemplateItemDtoJsonConverter))]
public sealed class TemplateItemDto
{
    [JsonPropertyName("name")]
    public string Name { get; init; } = string.Empty;
}

public sealed class TemplateItemDtoJsonConverter : JsonConverter<TemplateItemDto>
{
    public override TemplateItemDto? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.String)
        {
            return new TemplateItemDto
            {
                Name = reader.GetString()?.Trim() ?? string.Empty
            };
        }

        if (reader.TokenType == JsonTokenType.StartObject)
        {
            using var document = JsonDocument.ParseValue(ref reader);
            var root = document.RootElement;

            if (root.TryGetProperty("name", out var nameElement))
            {
                return new TemplateItemDto
                {
                    Name = nameElement.GetString()?.Trim() ?? string.Empty
                };
            }
        }

        return new TemplateItemDto();
    }

    public override void Write(Utf8JsonWriter writer, TemplateItemDto value, JsonSerializerOptions options)
    {
        writer.WriteStartObject();
        writer.WriteString("name", value.Name);
        writer.WriteEndObject();
    }
}

public static class TemplateJsonSerializer
{
    public static readonly JsonSerializerOptions Options = new(JsonSerializerDefaults.Web)
    {
        PropertyNameCaseInsensitive = true
    };

    public static List<TemplateStructureDto> ParseStructure(string? templateJson)
        => string.IsNullOrWhiteSpace(templateJson)
            ? []
            : JsonSerializer.Deserialize<List<TemplateStructureDto>>(templateJson, Options) ?? [];
}

public record TemplateRequest(string Name, List<TemplateStructureDto> Structure);

public record TemplateResponse(int TemplateId, string Name, List<TemplateStructureDto> Structure);
