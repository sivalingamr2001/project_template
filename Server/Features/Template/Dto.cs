using System.Text.Json.Serialization;

namespace Server.Features.Template;

public record TemplateStructureDto(
    [property: JsonPropertyName("category")] string Category,
    [property: JsonPropertyName("items")] List<string> Items
);

public record TemplateRequest(string Name, List<TemplateStructureDto> Structure);

public record TemplateResponse(int TemplateId, string Name, List<TemplateStructureDto> Structure);
