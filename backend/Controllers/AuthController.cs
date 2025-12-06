using Core.DTOs;
using Core.Models;
using Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers
{
    [ApiController]
    [Route("[Controller]")]
    public class AuthController : Controller
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly JwtTokenService _jwtTokenService;
        private readonly UserService _userService;

        public AuthController(UserManager<ApplicationUser> userManager, SignInManager<ApplicationUser> signInManager, JwtTokenService jwtTokenService, UserService userService)
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
                UserName = model.Email,
                Rank = "Beginner",
                Balance = 1000
            };

            var result = await _userManager.CreateAsync(user, model.Password);

            if (!result.Succeeded)
                return BadRequest(result.Errors);

            var (token, refreshToken) = await _jwtTokenService.CreateTokensAsync(user);

            return Ok(new { token, refreshToken });
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh([FromBody] string refreshToken)
        {
            var user = _userManager.Users.FirstOrDefault(u => u.RefreshToken == refreshToken);

            if (user is null || user.RefreshTokenExpires < DateTime.UtcNow)
                return Unauthorized("Invalid refresh token");

            var (newToken, newRefreshToken) = await _jwtTokenService.CreateTokensAsync(user);

            return Ok(new
            {
                token = newToken,
                refreshToken = newRefreshToken
            });
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
