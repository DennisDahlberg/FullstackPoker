using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Models
{
    public enum FriendStatus
    {
        Pending,
        Accepted,
        Rejected,
        Blocked
    }

    public class Friend
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string RequesterId { get; set; } = null!;

        [Required]
        public string AddresseeId { get; set; } = null!;

        public FriendStatus Status { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("RequesterId")]
        public ApplicationUser Requester { get; set; } = null!;

        [ForeignKey("AddresseeId")]
        public ApplicationUser Addressee { get; set; } = null!;
    }
}
