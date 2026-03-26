using Core.DTOs.Bot;
using FluentValidation;

namespace Application.Validators;

public class UpdateBotValidator : AbstractValidator<UpdateBotDto>
{
    public UpdateBotValidator()
    {
        RuleFor(x => x.Username)
            .NotEmpty().WithMessage("Username is required")
            .MinimumLength(3).WithMessage("Username must be at least 3 characters")
            .MaximumLength(20).WithMessage("Username cannot exceed 20 characters");
        
        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Description is required")
            .MinimumLength(5).WithMessage("Description must be at least 5 characters")
            .MaximumLength(50).WithMessage("Description cannot exceed 50 characters");
        
        RuleFor(x => x.PlayStyle)
            .NotEmpty().WithMessage("PlayStyle is required")
            .MinimumLength(3).WithMessage("PlayStyle must be at least 3 characters")
            .MaximumLength(15).WithMessage("PlayStyle cannot exceed 15 characters");
        
        RuleFor(x => x.SkillLevel)
            .IsInEnum().WithMessage("Skill level is invalid");
    }
}