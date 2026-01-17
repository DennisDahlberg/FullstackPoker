using Infrastructure.Data;
using Infrastructure.Repositories;

namespace Application.Services;

public class BotService
{
    private readonly BotRepository _botRepository;

    public BotService(BotRepository botRepository)
    {
        _botRepository = botRepository;
    }

    public async Task GetAllBotsAsync()
    {
        
    }
}