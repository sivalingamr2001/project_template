namespace Server.Common.Result;

public class Result<T>
{
    public T? Value { get; }
    public Error? Error { get; }
    public bool IsSuccess => Error == null;

    private Result(T value) => Value = value;
    private Result(Error error) => Error = error;

    public static Result<T> Success(T value) => new(value);
    public static Result<T> Failure(Error error) => new(error);

    // Helper for the .Match() method used in your Endpoint
    public IResult Match(Func<T, IResult> success, Func<Error, IResult> failure)
    {
        return IsSuccess ? success(Value!) : failure(Error!);
    }

    public static implicit operator Result<T>(T value) => Success(value);
    public static implicit operator Result<T>(Error error) => Failure(error);
}

public record Error(string Code, string Message);
