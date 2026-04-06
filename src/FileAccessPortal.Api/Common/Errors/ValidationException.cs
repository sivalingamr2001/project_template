namespace FileAccessPortal.Api.Common.Errors;

public sealed class ValidationException(string message) : AppException(message, StatusCodes.Status400BadRequest);
