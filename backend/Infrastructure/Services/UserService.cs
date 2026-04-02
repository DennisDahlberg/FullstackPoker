using System.Security.Claims;
using Core.DTOs;
using Core.DTOs.User;
using Core.Interfaces;
using Core.Models;
using FluentResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Infrastructure.Services
{
    public class UserService : IUserService
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
                Id = user.Id,
                Email = user.Email!,
                Balance = user.Balance,
                Rank = user.Rank,
                Username = user.UserName!
            };

            return userDTO;
        }

        public async Task<ApplicationUser?> GetLoggedInUser(ClaimsPrincipal user)
        {
            var currentUserId = _userManager.GetUserId(user);
            var currentUser = await _userManager.FindByIdAsync(currentUserId);
            return currentUser;
        }

        public string GetLoggedInUserId(ClaimsPrincipal user)
        {
            return  _userManager.GetUserId(user);
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

        public List<ApplicationUser> FindUsersAsync(string query, string currentUserId)
        {
            return _userManager.Users
                .Where(u => u.UserName.ToLower().Contains(query.ToLower())
                && u.Id != currentUserId)
                .ToList();
        }

        public async Task<Result> UpdateUserBalanceAsync(string userId, decimal balance)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user is null)
                return Result.Fail("User not found");
            
            user.Balance += balance;
            if (user.Balance < 0)
            {
                user.Balance += balance;
                return Result.Fail("Insufficient balance");
            }

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
                return Result.Fail("Update failed");
            
            return Result.Ok();
        }

        public async Task<IdentityResult> UpdatePasswordAsync(string userId, PasswordUpdateDto dto)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user is null)
                return IdentityResult.Failed();

            return await _userManager.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword);
        }

        public async Task<IdentityResult> UpdateUsernameAsync(string userId, string username)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user is null)
                return IdentityResult.Failed();

            return await _userManager.SetUserNameAsync(user, username);
        }
    }
}
