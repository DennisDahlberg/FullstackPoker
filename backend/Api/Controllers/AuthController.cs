using Core.DTOs;
using Core.Models;
using Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Core.DTOs.User;
using Core.Interfaces;

namespace Api.Controllers
{
    public class RefreshRequest
    {
        public string RefreshToken { get; set; } = null!;
    }


    [ApiController]
    [Route("[Controller]")]
    public class AuthController : Controller
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly JwtTokenService _jwtTokenService;
        private readonly IUserService _userService;

        public AuthController(UserManager<ApplicationUser> userManager, SignInManager<ApplicationUser> signInManager, JwtTokenService jwtTokenService, IUserService userService)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _jwtTokenService = jwtTokenService;
            _userService = userService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDTO model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user is null)
                return Unauthorized("Invalid login");

            var result = await _signInManager.CheckPasswordSignInAsync(user, model.Password, false);
            if (!result.Succeeded)
                return Unauthorized("Invalid login");

            var (token, refreshToken) = await _jwtTokenService.CreateTokensAsync(user);

            return Ok(new { token, refreshToken });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDTO model)
        {
            var user = new ApplicationUser()
            {
                Email = model.Email,
                UserName = model.Username,
                Rank = "Beginner",
                Balance = 1000,
                RefreshToken = ""
            };

            var result = await _userManager.CreateAsync(user, model.Password);

            if (!result.Succeeded)
                return BadRequest(result.Errors);

            var (token, refreshToken) = await _jwtTokenService.CreateTokensAsync(user);

            return Ok(new { token, refreshToken });
        }

        [Authorize]
        [HttpPut("password")]
        public async Task<IActionResult> UpdatePasswordAsync([FromBody] PasswordUpdateDto newPassword)
        {
            var userId = _userService.GetLoggedInUserId(User);
            if (userId is null)
                return Unauthorized("Invalid user");
            
            var result = await _userService.UpdatePasswordAsync(userId, newPassword);
            if (!result.Succeeded)
                return BadRequest(result.Errors);
            
            return Ok();
        }

        [Authorize]
        [HttpPut("username")]
        public async Task<IActionResult> UpdateUsernameAsync([FromBody] string username)
        {
            var userId = _userService.GetLoggedInUserId(User);
            if (userId is null)
                return Unauthorized("Invalid user");

            var result = await _userService.UpdateUsernameAsync(userId, username);
            if (!result.Succeeded)
                return BadRequest(result.Errors);
            
            return Ok();
        }

        [Authorize]
        [HttpPut("email")]
        public async Task<IActionResult> UpdateEmailAsync([FromBody] string email)
        {
            var userId = _userService.GetLoggedInUserId(User);
            if (userId is null)
                return Unauthorized("Invalid user");
            
            var result = await _userService.UpdateEmailAsync(userId, email);
            if (!result.Succeeded)
                return BadRequest(result.Errors);
            
            return Ok();
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh([FromBody] RefreshRequest request)
        {
            var user = _userManager.Users.FirstOrDefault(u => u.RefreshToken == request.RefreshToken);

            if (user is null || user.RefreshTokenExpires < DateTime.UtcNow)
                return Unauthorized("Invalid refresh token");

            var (newToken, newRefreshToken) = await _jwtTokenService.CreateTokensAsync(user);

            return Ok(new
            {
                token = newToken,
                refreshToken = newRefreshToken
            });
        }

        [HttpPut("profile-image")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UpdateProfileImage(IFormFile? profileImage)
        {
            var userId = _userService.GetLoggedInUserId(User);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized("Invalid user");

            if (profileImage == null || profileImage.Length == 0)
                return BadRequest();

            var imageType = profileImage.ContentType;
            using var memoryStream = new MemoryStream();
            await profileImage.CopyToAsync(memoryStream);
            var result = await _userService.UpdateProfileImage(userId, memoryStream.ToArray(),  imageType);
            
            return Ok();
        }

        [Authorize]
        [HttpGet("profile")]
        public async Task<IActionResult> Profile()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (userId is null)
                return Unauthorized("Invalid token");

            var result = await _userService.GetUserDataAsync(userId);

            if (result.IsFailed)
                return Unauthorized(result.Errors[0].Message);

            return Ok(result.Value);
        }
    }
}
