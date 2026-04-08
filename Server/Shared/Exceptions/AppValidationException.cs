namespace Server.Shared.Exceptions;

public sealed class AppValidationException(string message) : Exception(message);
