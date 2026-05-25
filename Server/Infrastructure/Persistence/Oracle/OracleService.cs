using ConnectionDll;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Persistence.Oracle;

public class OracleService: IDisposable
{
    private readonly ILogger<OracleService> _logger;
    private readonly Class1 _oracleProvider;
    private bool _disposed;

    public OracleService(ILogger<OracleService> logger)
    {
        _logger = logger;
        _oracleProvider = new Class1();

        if (string.IsNullOrWhiteSpace(_oracleProvider.oracon.ConnectionString))
        {
            _logger.LogWarning("Oracle connection string from ConnectionDll is empty.");
        }
    }

    public string GetConnectionString()
    {
        return _oracleProvider.oracon.ConnectionString;
    }

    public void Dispose()
    {
        if (!_disposed)
        {
            _oracleProvider.oracon_prod_new?.Dispose();
            _disposed = true;
            _logger.LogInformation("Oracle connection from Class1 disposed.");
        }
    }
}
