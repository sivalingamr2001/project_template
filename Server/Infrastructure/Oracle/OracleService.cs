using System.Data;
using ConnectionDll;
using Oracle.ManagedDataAccess.Client;

namespace Server.Infrastructure.Oracle;

public sealed class OracleService : IDisposable
{
    private readonly ILogger<OracleService> _logger;
    private readonly Class1 _oracleProvider;
    private bool _disposed;

    public OracleService(ILogger<OracleService> logger)
    {
        _logger = logger;

        _oracleProvider = new Class1();
        if (string.IsNullOrWhiteSpace(_oracleProvider.oracon_prod_new.ConnectionString))
        {
            _logger.LogWarning("Oracle connection string from ConnectionDll is empty.");
        }
    }

    public DataTable GetData(string sql)
    {
        try
        {
            if (_oracleProvider.oracon_prod_new.State != ConnectionState.Open)
            {
                _oracleProvider.oracon_prod_new.Open();
            }

            using var cmd = new OracleCommand(sql, _oracleProvider.oracon_prod_new);
            using var adapter = new OracleDataAdapter(cmd);
            var dt = new DataTable();
            adapter.Fill(dt);
            return dt;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reading from Oracle via Class1");
            throw;
        }
        finally
        {
            _oracleProvider.oracon_prod_new.Close();
        }
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
