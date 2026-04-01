namespace Core.DTOs.User;

public class PasswordUpdateDto
{
    public string CurrentPassword { get; set; } = null!;
    public string NewPassword { get; set; } = null!;
    public string NewPasswordConfirmation { get; set; } = null!;
}