using System;
using System.Collections.Generic;
using System.Text;
using Domain.DomainEntities;

namespace Domain.RepositoryInterface
{
    public interface IUserRepository : IGenericRepository<UserDomain>
    {
    }
}
