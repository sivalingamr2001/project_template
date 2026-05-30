using Newtonsoft.Json;

namespace DataEngine.Model;

public class TransactionRequest
{
    [JsonProperty("extendedProperties")]
    public Dictionary<string, object> ExtendedProperties { get; set; } = new Dictionary<string, object>();

    [JsonProperty("renProps")]
    public Dictionary<string, List<Dictionary<string, object>>> RenProps { get; set; } = new Dictionary<string, List<Dictionary<string, object>>>();

    [JsonProperty("delProps")]
    public Dictionary<string, List<Dictionary<string, object>>> DelProps { get; set; } = new Dictionary<string, List<Dictionary<string, object>>>();

    [JsonProperty("transactionEntityName")]
    public string TransactionEntityName { get; set; } = string.Empty;

    [JsonProperty("transactionId")]
    public string TransactionId { get; set; } = string.Empty;

    [JsonProperty("userId")]
    public string UserId { get; set; } = string.Empty;
}
