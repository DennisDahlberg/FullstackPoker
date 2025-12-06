using Core.DTOs;
using Core.Models;
using FluentResults;
using Microsoft.AspNetCore.Identity;

namespace Infrastructure.Services
{
    public class UserService
    {
        private readonly UserManager<ApplicationUser> _userManager;

        public UserService(UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
        }

        public async Task<Result<UserDTO>> GetUserData(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user is null)
                return Result.Fail("No user found");

            var userDTO = new UserDTO()
            {
                Email = user.Email!,
                Balance = user.Balance,
                Rank = user.Rank,
                Username = user.UserName!
            };

            return userDTO;
        }
    }
}
