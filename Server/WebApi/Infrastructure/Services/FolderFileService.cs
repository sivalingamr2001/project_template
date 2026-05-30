namespace Server.WebApi.Services;

public sealed class FolderFileService
{
    public string GetWorkspaceRoot()
    {
        var current = Directory.GetCurrentDirectory();
        var root = Path.GetFullPath(Path.Combine(current, ".."));
        return root;
    }

    public IReadOnlyList<FolderFileInfo> GetAllFiles(string rootPath, int maxResults)
    {
        if (!Directory.Exists(rootPath))
        {
            return Array.Empty<FolderFileInfo>();
        }

        var files = new List<FolderFileInfo>();
        var stack = new Stack<string>();
        stack.Push(rootPath);

        while (stack.Count > 0 && files.Count < maxResults)
        {
            var folder = stack.Pop();
            try
            {
                foreach (var file in Directory.EnumerateFiles(folder))
                {
                    if (files.Count >= maxResults)
                    {
                        break;
                    }

                    var info = new FileInfo(file);
                    files.Add(new FolderFileInfo(
                        RelativePath: Path.GetRelativePath(rootPath, file),
                        FullPath: file,
                        SizeBytes: info.Length,
                        LastModifiedUtc: info.LastWriteTimeUtc));
                }

                foreach (var child in Directory.EnumerateDirectories(folder))
                {
                    stack.Push(child);
                }
            }
            catch
            {
                // Ignore folders we cannot access.
            }
        }

        return files;
    }
}

public sealed record FolderFileInfo(string RelativePath, string FullPath, long SizeBytes, DateTime LastModifiedUtc);