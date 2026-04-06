namespace FileAccessPortal.Domain.Entities;

public sealed record CamundaProcessReference(
    string BusinessKey,
    string? ProcessInstanceId,
    string LastAction,
    DateTimeOffset UpdatedAtUtc,
    bool IsSynchronized);
