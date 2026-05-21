namespace Application.Contracts
{
    public interface ISearchService
    {
        Task<IEnumerable<T>> SearchAsync<T>(string query);
    }
}
