using System;

namespace Infrastructure.Persistence.Entities
{
    public class Part : BaseEntity
    {
        public int RequisitionId { get; set; }
        public Requisition Requisition { get; set; }
        
        public int SNo { get; set; }
        public string PartNo { get; set; }
        public string Rev { get; set; }
        public string PartName { get; set; }
        public int Qty { get; set; }
        public DateTime RequiredDate { get; set; }
        public DateTime CommittedDate { get; set; }
        public DateTime? ActualCompletionDate { get; set; }
    }
}
