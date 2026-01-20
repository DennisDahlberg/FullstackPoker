using Core.Models;

namespace Infrastructure.Data;

public class DataInitializer
{
    private readonly ApplicationDbContext _context;

    public DataInitializer(ApplicationDbContext context)
    {
        _context = context;
    }


    public async Task SeedData()
    {
        await SeedBots();
        await SeedTables();
    }

    private async Task SeedTables()
    {
        if (_context.Tables.Any())
            return;

        _context.Tables.AddRange(new List<Table>
        {
            new Table
            {
                Name = "Low Stakes",
                Description = "Perfect for learning and casual play",
                Difficulty = "Casual",
                BuyIn = 100,
                SmallBlind = 1,
                BigBlind = 2
            },
            new Table
            {
                Name = "Mid Stakes",
                Description = "Standard competitive play for grinders",
                Difficulty = "Standard",
                BuyIn = 250,
                SmallBlind = 2,
                BigBlind = 5
            },
            new Table
            {
                Name = "High Stakes",
                Description = "High risk, high reward for experts",
                Difficulty = "Hardcore",
                BuyIn = 500,
                SmallBlind = 5,
                BigBlind = 10
            },
        });

        await _context.SaveChangesAsync();
    }

    private async Task SeedBots()
    {
        if (_context.Bots.Any())
            return;
            
        _context.Bots.AddRange(new List<Bot>
        {
            new Bot
            {
                Username = "ChipStarter",
                Description = "Plays it safe and learns slowly.",
                PlayStyle = "Tight",
                SkillLevel = SkillLevel.Beginner,
                ProfileImageUrl = null,
                IsUserCreated = false
            },
            new Bot
            {
                Username = "FoldyMcGee",
                Description = "Folds often but avoids big losses.",
                PlayStyle = "Passive",
                SkillLevel = SkillLevel.Beginner,
                ProfileImageUrl = null,
                IsUserCreated = false
            },
            new Bot
            {
                Username = "BlindCall",
                Description = "Calls too much, still learning odds.",
                PlayStyle = "Loose",
                SkillLevel = SkillLevel.Beginner,
                ProfileImageUrl = null,
                IsUserCreated = false
            },
            new Bot
            {
                Username = "PocketHope",
                Description = "Waits patiently for premium hands.",
                PlayStyle = "Tight",
                SkillLevel = SkillLevel.Beginner,
                ProfileImageUrl = null,
                IsUserCreated = false
            },
            new Bot
            {
                Username = "RookieRaiser",
                Description = "Overvalues strong starting hands.",
                PlayStyle = "Aggressive",
                SkillLevel = SkillLevel.Beginner,
                ProfileImageUrl = null,
                IsUserCreated = false
            },

            // INTERMEDIATE
            new Bot
            {
                Username = "StackBuilder",
                Description = "Solid fundamentals and steady play.",
                PlayStyle = "Balanced",
                SkillLevel = SkillLevel.Intermediate,
                ProfileImageUrl = null,
                IsUserCreated = false
            },
            new Bot
            {
                Username = "PotController",
                Description = "Keeps pots small with marginal hands.",
                PlayStyle = "Tight",
                SkillLevel = SkillLevel.Intermediate,
                ProfileImageUrl = null,
                IsUserCreated = false
            },
            new Bot
            {
                Username = "SemiBluff",
                Description = "Uses bluffs at the right moments.",
                PlayStyle = "Aggressive",
                SkillLevel = SkillLevel.Intermediate,
                ProfileImageUrl = null,
                IsUserCreated = false
            },
            new Bot
            {
                Username = "TurnReader",
                Description = "Reads turn cards well and adapts.",
                PlayStyle = "Balanced",
                SkillLevel = SkillLevel.Intermediate,
                ProfileImageUrl = null,
                IsUserCreated = false
            },
            new Bot
            {
                Username = "ValueHunter",
                Description = "Extracts value from weaker players.",
                PlayStyle = "Tight",
                SkillLevel = SkillLevel.Intermediate,
                ProfileImageUrl = null,
                IsUserCreated = false
            },

            // PRO
            new Bot
            {
                Username = "RiverKing",
                Description = "Deadly accurate on river decisions.",
                PlayStyle = "Aggressive",
                SkillLevel = SkillLevel.Pro,
                ProfileImageUrl = null,
                IsUserCreated = false
            },
            new Bot
            {
                Username = "EquityMaster",
                Description = "Understands odds and equity deeply.",
                PlayStyle = "Balanced",
                SkillLevel = SkillLevel.Pro,
                ProfileImageUrl = null,
                IsUserCreated = false
            },
            new Bot
            {
                Username = "RangeBoss",
                Description = "Plays ranges instead of hands.",
                PlayStyle = "Aggressive",
                SkillLevel = SkillLevel.Pro,
                ProfileImageUrl = null,
                IsUserCreated = false
            },
            new Bot
            {
                Username = "TableShark",
                Description = "Applies pressure across the table.",
                PlayStyle = "Aggressive",
                SkillLevel = SkillLevel.Pro,
                ProfileImageUrl = null,
                IsUserCreated = false
            },
            new Bot
            {
                Username = "CheckRaise",
                Description = "Punishes predictable betting lines.",
                PlayStyle = "Tricky",
                SkillLevel = SkillLevel.Pro,
                ProfileImageUrl = null,
                IsUserCreated = false
            },

            // ELITE
            new Bot
            {
                Username = "MindCrusher",
                Description = "Exploits every observable weakness.",
                PlayStyle = "Aggressive",
                SkillLevel = SkillLevel.Elite,
                ProfileImageUrl = null,
                IsUserCreated = false
            },
            new Bot
            {
                Username = "SolverGhost",
                Description = "Plays near GTO at all times.",
                PlayStyle = "Balanced",
                SkillLevel = SkillLevel.Elite,
                ProfileImageUrl = null,
                IsUserCreated = false
            },
            new Bot
            {
                Username = "ChipDevourer",
                Description = "Slowly drains stacks with precision.",
                PlayStyle = "Tight",
                SkillLevel = SkillLevel.Elite,
                ProfileImageUrl = null,
                IsUserCreated = false
            },
            new Bot
            {
                Username = "Unbluffable",
                Description = "Impossible to trick or tilt.",
                PlayStyle = "Defensive",
                SkillLevel = SkillLevel.Elite,
                ProfileImageUrl = null,
                IsUserCreated = false
            },
            new Bot
            {
                Username = "FinalBoss",
                Description = "The toughest opponent at the table.",
                PlayStyle = "Adaptive",
                SkillLevel = SkillLevel.Elite,
                ProfileImageUrl = null,
                IsUserCreated = false
            },

            // EXTRA VARIETY
            new Bot
            {
                Username = "LooseCannon",
                Description = "Wild and unpredictable betting.",
                PlayStyle = "Loose",
                SkillLevel = SkillLevel.Intermediate,
                ProfileImageUrl = null,
                IsUserCreated = false
            },
            new Bot
            {
                Username = "NitPick",
                Description = "Only plays the strongest hands.",
                PlayStyle = "Tight",
                SkillLevel = SkillLevel.Beginner,
                ProfileImageUrl = null,
                IsUserCreated = false
            },
            new Bot
            {
                Username = "TiltProof",
                Description = "Never tilts under pressure.",
                PlayStyle = "Balanced",
                SkillLevel = SkillLevel.Pro,
                ProfileImageUrl = null,
                IsUserCreated = false
            },
            new Bot
            {
                Username = "OverBet",
                Description = "Uses big bets to force mistakes.",
                PlayStyle = "Aggressive",
                SkillLevel = SkillLevel.Pro,
                ProfileImageUrl = null,
                IsUserCreated = false
            },
            new Bot
            {
                Username = "SilentStack",
                Description = "Builds stacks quietly and efficiently.",
                PlayStyle = "Tight",
                SkillLevel = SkillLevel.Intermediate,
                ProfileImageUrl = null,
                IsUserCreated = false
            }
        });
        
        await _context.SaveChangesAsync();
    }
}