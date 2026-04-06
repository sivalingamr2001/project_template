namespace FileAccessPortal.Api.Common.Errors;

public abstract class AppException(string message, int statusCode) : Exception(message)
{
    public int StatusCode { get; } = statusCode;
}
