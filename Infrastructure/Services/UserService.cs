using System.Security.Claims;
using Core.DTOs;
using Core.Models;
using FluentResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Infrastructure.Services
{
    public class UserService
    {
        private readonly UserManager<ApplicationUser> _userManager;

        public UserService(UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
        }

        public async Task<Result<UserDTO>> GetUserDataAsync(string userId)
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

        public async Task<ApplicationUser> GetLoggedInUser(ClaimsPrincipal user)
        {
            var currentUserId = _userManager.GetUserId(user);
            var currentUser = await _userManager.FindByIdAsync(currentUserId);
            return currentUser;
        }

        public async Task<ApplicationUser?> GetUserById(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            return user;
        }
        
        public async Task<ApplicationUser?> GetUserByUsername(string username)
        {
            var user = await _userManager.FindByNameAsync(username);
            return user;
        }

        public List<ApplicationUser> FindUsersAsync(string query)
        {
            return _userManager.Users
                .Where(u => u.UserName.Contains(query))
                .ToList();
        }
    }
}
