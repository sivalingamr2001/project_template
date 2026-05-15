using AutoMapper;
using System;
using System.Collections.Generic;
using System.Text;
using Domain.DomainEntities;
using Domain.RepositoryInterface;
using Infrastructure.Persistence.Entities;

namespace Infrastructure.Repository
{
    public class UserRepository : GenericRepository<UserDomain, User>, IUserRepository
    {
        public UserRepository(
            AppDbContext todoAppDbContext, 
            IMapper mapper) : base(todoAppDbContext, mapper)
        {

        }
    }
}
