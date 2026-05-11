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
        private readonly IBlobService _blobService;

        public UserService(UserManager<ApplicationUser> userManager, IBlobService blobService)
        {
            _userManager = userManager;
            _blobService = blobService;
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
                Username = user.UserName!,
                ProfileImageUrl =  user.ProfileImageUrl,
                RankPoints = user.RankPoints
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

        public async Task<int> UpdateUserRankAsync(string userId, decimal profit)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user is null)
                return 0;
            
            var rankFloors = new Dictionary<string, int>
            {
                { "Legend", 1000000 },
                { "Elite", 500000 },
                { "Master", 250000 },
                { "Pro", 100000 },
                { "Expert", 50000 },
                { "Veteran", 25000 },
                { "Advanced", 10000 },
                { "Intermediate", 2500 },
                { "Amateur", 500 },
                { "Beginner", 0 }
            };

            if (profit >= 0)
                user.RankPoints += (int)profit;
            else
            {
                var pointsToLose = (int)((double)profit * 0.30); 
                user.RankPoints += pointsToLose;

                if (rankFloors.TryGetValue(user.Rank, out int currentFloor))
                {
                    if (user.RankPoints < currentFloor)
                    {
                        user.RankPoints = currentFloor;
                    }
                }
            }
            
            user.Rank = user.RankPoints switch
            {
                >= 1000000 => "Legend",
                >= 500000 => "Elite",
                >= 250000 => "Master",
                >= 100000 => "Pro",
                >= 50000 => "Expert",
                >= 25000 => "Veteran",
                >= 10000 => "Advanced",
                >= 2500 => "Intermediate",
                >= 500 => "Amateur",
                _ => "Beginner"
            };

            await _userManager.UpdateAsync(user);
            return user.RankPoints;
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

        public async Task<IdentityResult> UpdateEmailAsync(string userId, string email)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user is null)
                return IdentityResult.Failed();
            
            return await _userManager.SetEmailAsync(user, email);
        }

        public async Task<Result> UpdateProfileImage(string userId, byte[] imageData, string imageType)
        {
            if (imageData is null || string.IsNullOrEmpty(imageType))
                return Result.Fail("No image found");
            
            var user =  await _userManager.FindByIdAsync(userId);
            if (user is null)
                return  Result.Fail("User not found");

            using var stream = new MemoryStream(imageData);
            var extension = imageType == "image/png" ? ".png" : ".jpg";
            var fileName = $"user_{Guid.NewGuid()}{extension}";
            var imageUrl = await _blobService.UploadImage(stream, fileName ,imageType);
            if (imageUrl is null)
                return Result.Fail("Image upload failed");

            user.ProfileImageUrl = imageUrl;
            await _userManager.UpdateAsync(user);
            return Result.Ok();
        }

        public async Task<LoginBonusResult> ProcessDailyLoginBonusAsync(string userId)
        {
            

            return new LoginBonusResult();
        }
    }
}
