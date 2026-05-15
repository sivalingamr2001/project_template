using AutoMapper;
using Domain.DomainEntities;
using Infrastructure.Persistence.Entities;

namespace Infrastructure.Mappers
{
    public class UserMappingExtension : Profile
    {
        public UserMappingExtension()
        {
            CreateMap<User, UserDomain>().ReverseMap();
        }
    }
}

