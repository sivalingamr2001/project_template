using Application.DTOs.Response;
using AutoMapper;
using Domain.DomainEntities;

namespace Application.Mappers
{
    public class UserMappingExtension : Profile
    {

        public UserMappingExtension()
        {

            CreateMap<UserDomain, UserResponseDto>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id.ToString()))
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.FullName));
        }
    }
}

