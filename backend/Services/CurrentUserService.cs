using Core.DTOs;
using System.Security.Claims;

namespace backend.Services
{
    public class CurrentUserService
    {
        private readonly IHttpContextAccessor _contextAccessor;

        public CurrentUserService(IHttpContextAccessor contextAccessor)
        {
            _contextAccessor = contextAccessor;
        }

        public PlayerInfoDTO GetPlayerInfo()
        {
            return new PlayerInfoDTO
            {
                Name = _contextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Name)?.Value!,
                Chips = 5000
            };
        }
    }
}
