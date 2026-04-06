# FileAccessPortal — Web API + React UI

## Project Context

This is an internal file storage access request system for a small organization of around 1000 users. Employees request access to folders or files, the department HOD verifies the business need, and the IT team grants or rejects access.

## Architecture

- **Backend:** ASP.NET Core Minimal API with feature-grouped endpoints
- **Frontend:** React single-page application
- **Scale assumption:** around 1000 users, low-to-medium traffic, internal use
- **Workflow:** User -> HOD Approval -> IT Grant
- **Current persistence:** in-memory seeded store for demo/prototype mode

## Architecture

Choose one of the following structures and delete the others:

### Option A: Vertical Slice Architecture (best for CRUD-heavy, small-medium teams)

```
src/
  [ProjectName].Api/
    Features/
      [Feature]/
        [Operation].cs          # Command/Query + Handler + Response
    Common/
      Behaviors/                # Pipeline behaviors without use Mediator free package only
      Persistence/              # DbContext, configurations
      Extensions/               # Service registration helpers
    Program.cs
```

## Business Rules

- A normal user can create file or folder access requests and view only their own requests.
- A HOD can review requests only for their department.
- IT team users can process requests only after HOD approval.
- HOD rejection with comments notify to users request and resubmit the request again go to hod cart same as it rejection with comments and notify hod resubmit.
- IT approval grants the request valid for 365 days and access extend user re-req needed and it can revoc access any time by it and it see the all users data in their portal.
- Must be integrate with camunda to this project

## Skills

- `modern-csharp`
- `minimal-api`
- `vertical-slice`
- `error-handling`
- `dependency-injection`
- `project-structure`
- `architecture-advisor` — Run for new projects to choose the best architecture
- `ef-core` — DbContext patterns, query optimization, migrations
- `workflow-mastery` — Parallel worktrees, verification loops, subagent patterns

## Workflow

- **Plan first** — Enter plan mode for any non-trivial task (3+ steps or architecture decisions). Iterate until the plan is solid before writing code.
- **Verify before done** — Run `dotnet build` and `dotnet test` after changes. Use `get_diagnostics` via MCP to catch warnings. Ask: "Would a staff engineer approve this?"
- **Fix bugs autonomously** — When given a bug report, investigate and fix it without hand-holding. Check logs, errors, failing tests — then resolve them.
- **Stop and re-plan** — If implementation goes sideways, STOP and re-plan. Don't push through a broken approach.
- **Use subagents** — Offload research, exploration, and parallel analysis to subagents. One task per subagent for focused execution.
- **Learn from corrections** — After any correction, capture the pattern in memory so the same mistake never recurs.

## Anti-patterns

Do NOT generate code that:

- Do not put feature endpoints directly in `Program.cs`
- Do not add repository abstractions for this demo
- Do not leak role checks into the React UI only; backend must enforce them too
- Do not replace the workflow with free-form status edits
- Defines endpoints in Program.cs — use `IEndpointGroup` per feature with `app.MapEndpoints()` auto-discovery
- Manually wires MapGroup calls in Program.cs — Program.cs should never change when adding endpoints
- Uses `DateTime.Now` — use `TimeProvider` injection instead
- Creates `new HttpClient()` — use `IHttpClientFactory`
- Uses `async void` — always return `Task`
- Blocks with `.Result` or `.Wait()` — await instead
- Uses `Results.Ok()` — use `TypedResults.Ok()` for OpenAPI
- Returns domain entities from endpoints — always map to response DTOs
- Creates repository abstractions over EF Core — use DbContext directly
- Uses in-memory database for tests — use Testcontainers
- Catches bare `Exception` — catch specific types, let the global handler catch the rest
- Uses string interpolation in log messages — use structured logging templates