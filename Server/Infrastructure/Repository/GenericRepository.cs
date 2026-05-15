using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using Domain.RepositoryInterface;
using Infrastructure.Persistence.Entities;

namespace Infrastructure.Repository
{
    public class GenericRepository<TDomain, TEntity> : IGenericRepository<TDomain>
        where TDomain : class
        where TEntity : class
    {
        private readonly AppDbContext todoAppDbContext;
        private readonly IMapper mapper;

        public GenericRepository(AppDbContext todoAppDbContext,
            IMapper mapper)
        {
            this.todoAppDbContext = todoAppDbContext;
            this.mapper = mapper;
        }

        public async Task AddAsync(TDomain domain)
        {
            var entity = mapper.Map<TEntity>(domain); // domain --> enttity

            await todoAppDbContext.Set<TEntity>().AddAsync(entity);
        }

        public async Task<int> CommitAsync()
        {
            return await todoAppDbContext.SaveChangesAsync();
        }

        public async Task<IEnumerable<TDomain>> GetAllAsync()
        {
            var entities = await todoAppDbContext.Set<TEntity>()
               .ToListAsync();

            return mapper.Map<IEnumerable<TDomain>>(entities);
        }

        public async Task<TDomain?> GetByIdAsync(object id)
        {
            var entity = await todoAppDbContext.Set<TEntity>().FindAsync(id); // id shd be primary key

            return entity == null ? null : mapper.Map<TDomain>(entity); // enttity---> domain
        }
    }
}
