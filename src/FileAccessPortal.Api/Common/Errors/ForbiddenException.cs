namespace FileAccessPortal.Api.Common.Errors;

public sealed class ForbiddenException(string message) : AppException(message, StatusCodes.Status403Forbidden);
