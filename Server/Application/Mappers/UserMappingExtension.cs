using AutoMapper;
using Application.DTOs.Request;
using Application.DTOs.Response;
using Domain.DomainEntities;

namespace Application.Mappers
{
    public class UserMappingExtension : Profile
    {

        public UserMappingExtension()
        {
            CreateMap<CreateUserDto, UserDomain>()
                .ForMember(dest => dest.PasswordHash, opt =>
                        opt.MapFrom(src => src.Password));

            CreateMap<UserDomain, UserResponseDto>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id.ToString()))
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.FullName));
        }
    }
}

