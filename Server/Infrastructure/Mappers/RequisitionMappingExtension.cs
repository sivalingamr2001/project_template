using AutoMapper;
using Domain.DomainEntities;
using Infrastructure.Persistence.Entities;

namespace Infrastructure.Mappers
{
    public class RequisitionMappingExtension : Profile
    {
        public RequisitionMappingExtension()
        {
            CreateMap<Requisition, RequisitionDomain>()
                .ForMember(dest => dest.Parts, opt => opt.MapFrom(src => src.Parts))
                .ReverseMap();

            CreateMap<Part, PartDomain>().ReverseMap();
        }
    }
}
