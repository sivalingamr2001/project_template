namespace FileAccessPortal.Api.Common.Errors;

public sealed class NotFoundException(string message) : AppException(message, StatusCodes.Status404NotFound);
