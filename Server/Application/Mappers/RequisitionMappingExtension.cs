using AutoMapper;
using Application.DTOs.Response;
using Domain.DomainEntities;

namespace Application.Mappers
{
    public class RequisitionMappingExtension : Profile
    {
        public RequisitionMappingExtension()
        {
            CreateMap<RequisitionDomain, RequisitionResponseDto>();
            CreateMap<PartDomain, PartResponseDto>();
        }
    }
}
