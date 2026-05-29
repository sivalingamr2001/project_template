using ConnectionDll;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Persistence.Oracle;

public class OracleService
{
    private readonly ILogger<OracleService> _logger;
    private readonly Class1 _oracleProvider;

    public OracleService(ILogger<OracleService> logger)
    {
        _logger = logger;
        _oracleProvider = new Class1();

        if (string.IsNullOrWhiteSpace(_oracleProvider.oracon_prod_new.ConnectionString))
        {
            _logger.LogWarning("Oracle connection string from ConnectionDll is empty.");
        }
    }

    public string GetConnectionString()
    {
        return _oracleProvider.oracon_prod_new.ConnectionString;
    }
}
