using System.Security.Claims;
using Core.DTOs;
using Core.DTOs.User;
using Core.Models;
using FluentResults;
using Microsoft.AspNetCore.Identity;

namespace Core.Interfaces;

public interface IUserService
{
    Task<Result<UserDTO>> GetUserDataAsync(string userId);
    Task<ApplicationUser?> GetLoggedInUser(ClaimsPrincipal user);
    string GetLoggedInUserId(ClaimsPrincipal user);
    Task<ApplicationUser?> GetUserById(string userId);
    Task<ApplicationUser?> GetUserByUsername(string username);
    List<ApplicationUser> FindUsersAsync(string query, string currentUserId);
    Task<Result> UpdateUserBalanceAsync(string userId, decimal balance);
    Task<IdentityResult> UpdatePasswordAsync(string userId, PasswordUpdateDto dto);
}