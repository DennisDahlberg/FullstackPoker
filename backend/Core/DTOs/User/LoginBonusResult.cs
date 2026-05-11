namespace Core.DTOs.User;

public class LoginBonusResult
{
    public bool WasAwarded { get; set; }
    public decimal BonusAmount { get; set; }
    public int CurrentStreak { get; set; }
}