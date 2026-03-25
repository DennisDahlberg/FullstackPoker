using Application.Services;
using backend.Hubs;
using Core.Models;
using Infrastructure.Data;
using Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using OpenAI.Chat;
using System.Text;
using Core.Interfaces;
using Infrastructure.Repositories;
using StackExchange.Redis;


namespace backend
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            builder.Services.AddControllers();
            builder.Services.AddOpenApi();
            builder.Services.AddHttpContextAccessor();

            builder.Services.AddTransient<DataInitializer>();
            builder.Services.AddTransient<JwtTokenService>();
            builder.Services.AddTransient<IUserService, UserService>();
            builder.Services.AddTransient<IGameService, GameService>();
            builder.Services.AddTransient<BotAiService>();
            builder.Services.AddTransient<FriendsRepository>();
            builder.Services.AddTransient<FriendService>();
            builder.Services.AddTransient<IBotService, BotService>();
            builder.Services.AddTransient<IBotRepository, BotRepository>();
            builder.Services.AddTransient<ITableService, TableService>();
            builder.Services.AddTransient<ITableRepository, TableRepository>();
            builder.Services.AddTransient<IGameHistoryService, GameHistoryService>();
            builder.Services.AddTransient<IGameRepository, GameRepository>();
            builder.Services.AddTransient<IGameStateManager, GameStateManager>();
            builder.Services.AddTransient<ILobbyStateManager, LobbyStateManager>();
            builder.Services.AddTransient<IStatisticService, StatisticService>();
            builder.Services.AddTransient<IStatisticRepository, StatisticRepository>();

            //EF Core
            builder.Services.AddDbContext<ApplicationDbContext>(options =>
                options.UseNpgsql(
                    builder.Configuration.GetConnectionString("DefaultConnection"),
                    b => b.MigrationsAssembly("Infrastructure")
                ));

            //Identity
            builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
            {
                options.User.RequireUniqueEmail = true;
            })
                .AddEntityFrameworkStores<ApplicationDbContext>()
                .AddDefaultTokenProviders();

            //Session
            builder.Services.AddDistributedMemoryCache();
            builder.Services.AddSession(options =>
            {
                options.IdleTimeout = TimeSpan.FromMinutes(40);
                options.Cookie.HttpOnly = true;
                options.Cookie.IsEssential = true;
            });

            //CORS
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend", policy =>
                {
                    policy.WithOrigins("http://localhost:3000", "http://localhost:5173", "https://poker.pokergame.win")
                      .AllowAnyMethod()
                      .AllowAnyHeader()
                      .AllowCredentials();
                });
            });

            //JWT
            var jwtSettings = builder.Configuration.GetSection("Jwt");
            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwtSettings["Issuer"],
                    ValidAudience = jwtSettings["Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"]!))
                };
                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        var accessToken = context.Request.Query["access_token"];
                        var path = context.HttpContext.Request.Path;
                        if (!string.IsNullOrEmpty(accessToken) &&
                            (path.StartsWithSegments("/hubs/friends")))
                        {
                            context.Token = accessToken;
                        }
                        return Task.CompletedTask;
                    }
                };
            });

            //SignalR
            builder.Services.AddSignalR().AddHubOptions<FriendsHub>(options =>
            {
                options.EnableDetailedErrors = true;
            });

            //OpenAI
            builder.Services.AddSingleton<ChatClient>(serviceProvider =>
            {
                var apiKey = builder.Configuration["OpenAI:APIKey"];
                var model = builder.Configuration["OpenAI:Model"];
                return new ChatClient(model, apiKey);
            });
            
            //Redis
            builder.Services.AddSingleton<IConnectionMultiplexer>(sp =>
            {
                var configuration = sp.GetRequiredService<IConfiguration>();
                var connectionString = configuration["Redis:ConnectionString"];
                return ConnectionMultiplexer.Connect(connectionString!);
            });

            builder.Services.AddAuthentication();
            builder.Services.AddAuthorization();

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.MapOpenApi();
            }

            app.UseHttpsRedirection();

            app.UseCors("AllowFrontend");

            app.UseAuthentication();
            app.UseAuthorization();

            app.UseSession();

            app.MapControllers();

            using (var scope = app.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                await db.Database.MigrateAsync();
            }
            
            using (var scope = app.Services.CreateScope())
            {
                var dataInitializer = scope.ServiceProvider.GetRequiredService<DataInitializer>();
                await dataInitializer.SeedData();
            }

            app.MapHub<FriendsHub>("/hubs/friends");
            app.MapHub<GameHub>("/hubs/game");
            app.MapHub<LobbyHub>("/hubs/lobby");

            app.Run();
        }
    }
}
