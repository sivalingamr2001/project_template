using Server.Domain.Errors;

namespace Server.Domain.Common;

public class Result<T>
{
    public T? Value { get; }
    public ServiceError? Error { get; }
    public bool IsSuccess => Error is null;

    private Result(T value) => Value = value;
    private Result(ServiceError error) => Error = error;

    public static Result<T> Success(T value) => new(value);
    public static Result<T> Failure(ServiceError error) => new(error);

    // Implicit conversions for ergonomic usage
    public static implicit operator Result<T>(T value) => Success(value);
    public static implicit operator Result<T>(ServiceError error) => Failure(error);
}

// Non-generic for commands that return no value
public class Result
{
    public ServiceError? Error { get; }
    public bool IsSuccess => Error is null;

    private Result() { }
    private Result(ServiceError error) => Error = error;

    public static Result Success() => new();
    public static Result Failure(ServiceError error) => new(error);
}
