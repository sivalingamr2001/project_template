using Domain.DomainEnums;
using System;
using System.Collections.Generic;

namespace Infrastructure.Persistence.Entities
{
    public class Requisition : BaseAuditableEntity
    {
        public string RecNo { get; set; }
        public DateTime Date { get; set; }
        public string PageNo { get; set; }
        public string FromTeam { get; set; }
        public string ToTeam { get; set; }
        
        public string ProductNo { get; set; }
        public string ProductRev { get; set; }
        public string ProjectNo { get; set; }
        public string ProductName { get; set; }
        public string Purpose { get; set; } // new-product-validation | sales
        public int MonthlyQty { get; set; }
        
        public RequestStatus Status { get; set; } // pending | approved | rejected | completed 
        
        public ICollection<Part> Parts { get; set; } = new List<Part>();
        
        public string PreparedBy { get; set; }
        public DateTime? PreparedDate { get; set; }
        
        public string? CheckedBy { get; set; }
        public DateTime? CheckedDate { get; set; }
        
        public string? ApprovedBy { get; set; }
        public DateTime? ApprovedDate { get; set; }
        
        public string? ReceivedBy { get; set; }
        public DateTime? ReceivedDate { get; set; }
    }
}
