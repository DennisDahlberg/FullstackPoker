namespace Core.DTOs.Bot;

public class BotValidationResultDto
{
    public List<BotValidationError> ValidationErrors { get; set; } = [];
}

public class BotValidationError
{
    public string PropertyName { get; set; } = null!;
    public string ErrorMessage { get; set; } = null!;
}