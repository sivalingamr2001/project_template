using Domain.DomainEnums;

namespace Infrastructure.Persistence.Entities
{
    public class User : BaseAuditableEntity
    {
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public UserRoles Role { get; set; } // Hod | User
    }
}
