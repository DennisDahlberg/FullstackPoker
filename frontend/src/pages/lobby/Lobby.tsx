import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useLobbyStore } from "@/stores/useLobbyStore";
import { api } from "@/lib/api";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Users,
  Cpu,
  Check,
  Loader2,
  X,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { BotProfile } from "@/types/Lobby";

export default function Lobby() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tableId = searchParams.get("tableId");

  const { lobby, loading, error, connectAndCreate, disconnect, addBot, removeBot } = useLobbyStore();

  const [bots, setBots] = useState<BotProfile[]>([]);
  const [loadingBots, setLoadingBots] = useState(true);
  const [activeBotTab, setActiveBotTab] = useState<"standard" | "custom">("standard");
  const [skillFilter, setSkillFilter] = useState<"All" | "Beginner" | "Intermediate" | "Pro" | "Elite">("All");

  const standardBots = bots.filter(b => !b.isUserCreated);
  const userBots = bots.filter(b => b.isUserCreated);

  // Connect to lobby hub on mount
  useEffect(() => {
    if (!tableId) {
      navigate("/lobby/create");
      return;
    }

    connectAndCreate(Number(tableId));

    return () => {
      disconnect();
    };
  }, [tableId]);

  // Fetch available bots
  useEffect(() => {
    const fetchBots = async () => {
      try {
        setLoadingBots(true);
        const data = await api.bots.getBotProfiles();
        const mappedBots: BotProfile[] = data.map((b: any) => ({
          id: b.id,
          name: b.username,
          style: b.playStyle,
          skill: b.skillLevel || "Beginner",
          image: b.profileImageUrl,
          isUserCreated: b.isUserCreated,
        }));
        setBots(mappedBots);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch bots");
      } finally {
        setLoadingBots(false);
      }
    };
    fetchBots();
  }, []);

  const isBotInLobby = (botId: string) => {
    return lobby?.botIds.includes(Number(botId)) ?? false;
  };

  const handleToggleBot = async (botId: string) => {
    if (isBotInLobby(botId)) {
      await removeBot(Number(botId));
    } else {
      await addBot(Number(botId));
    }
  };

  const handleLeaveLobby = async () => {
    await disconnect();
    navigate("/lobby/create");
  };

  // Loading state
  if (loading && !lobby) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
        <p className="text-gray-400">Creating lobby...</p>
      </div>
    );
  }

  // Error state
  if (error && !lobby) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-red-500 text-lg">{error}</p>
        <Button variant="outline" onClick={() => navigate("/lobby/create")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Table Selection
        </Button>
      </div>
    );
  }

  if (!lobby) return null;

  const botCount = lobby.botIds.length;
  const playerCount = lobby.players.length;
  const totalCount = playerCount + botCount;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <Users className="text-amber-500 w-8 h-8" />
            Lobby
          </h1>
          <p className="text-gray-400 mt-1">
            Lobby ID: <span className="font-mono text-gray-500">{lobby.lobbyId.slice(0, 8)}...</span>
            {" · "}Host: <span className="text-amber-500 font-bold">{lobby.hostUsername}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={cn(
            "text-sm font-bold px-3 py-1.5 rounded-full border",
            totalCount >= 8
              ? "bg-red-500/10 border-red-500/20 text-red-500"
              : "bg-gray-900 border-gray-800 text-gray-400"
          )}>
            {totalCount} / 8 seats
          </span>
          <Button variant="outline" size="sm" onClick={handleLeaveLobby}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Leave
          </Button>
        </div>
      </div>

      {/* Current Lobby Members */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-white">Players in Lobby</h2>
        <div className="flex flex-wrap gap-3">
          {lobby.players.map((p) => (
            <div
              key={p.userId}
              className="flex items-center gap-3 bg-gray-900/60 border border-gray-800 rounded-lg px-4 py-3"
            >
              <Avatar className="h-8 w-8 border border-gray-700">
                <div className="flex h-full w-full items-center justify-center bg-gray-800 text-sm font-bold text-gray-200">
                  {p.username[0]}
                </div>
              </Avatar>
              <div>
                <span className="font-bold text-gray-200">{p.username}</span>
                {p.isHost && (
                  <span className="ml-2 text-xs text-amber-500 font-bold">HOST</span>
                )}
              </div>
            </div>
          ))}

          {/* Show bots in lobby */}
          {lobby.botIds.map((botId) => {
            const bot = bots.find(b => Number(b.id) === botId);
            return (
              <div
                key={`bot-${botId}`}
                className="flex items-center gap-3 bg-gray-900/60 border border-gray-800 rounded-lg px-4 py-3 group"
              >
                <Avatar className="h-8 w-8 border border-gray-700">
                  <div className="flex h-full w-full items-center justify-center bg-gray-800 text-sm font-bold text-gray-200">
                    <Cpu className="w-4 h-4" />
                  </div>
                </Avatar>
                <span className="font-bold text-gray-200">
                  {bot?.name ?? `Bot #${botId}`}
                </span>
                <button
                  onClick={() => removeBot(botId)}
                  className="ml-1 text-gray-600 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bot Selection */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Cpu className="text-amber-500 w-5 h-5" />
            Add Opponents
          </h2>

          <div className="flex items-center gap-3">
            <div className="flex bg-gray-900 p-1 rounded-lg border border-white/5">
              <button
                onClick={() => setActiveBotTab("standard")}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-bold transition-all",
                  activeBotTab === "standard"
                    ? "bg-gray-800 text-amber-500 shadow-sm"
                    : "text-gray-400 hover:text-gray-200"
                )}
              >
                <Cpu className="w-3 h-3" />
                Standard
              </button>
              <button
                onClick={() => setActiveBotTab("custom")}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-bold transition-all",
                  activeBotTab === "custom"
                    ? "bg-gray-800 text-amber-500 shadow-sm"
                    : "text-gray-400 hover:text-gray-200"
                )}
              >
                <Users className="w-3 h-3" />
                My Bots
              </button>
            </div>
          </div>
        </div>

        {/* Skill Filter */}
        <div className="flex flex-wrap gap-2">
          {(["All", "Beginner", "Intermediate", "Pro", "Elite"] as const).map((skill) => (
            <button
              key={skill}
              onClick={() => setSkillFilter(skill)}
              className={cn(
                "text-xs px-3 py-1.5 rounded-full border transition-all font-medium",
                skillFilter === skill
                  ? "bg-amber-500/10 border-amber-500 text-amber-500"
                  : "bg-gray-900/50 border-gray-800 text-gray-400 hover:border-gray-700 hover:text-gray-300"
              )}
            >
              {skill}
            </button>
          ))}
        </div>

        {loadingBots ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {(activeBotTab === "standard" ? standardBots : userBots)
              .filter(bot => skillFilter === "All" || bot.skill === skillFilter)
              .map((bot) => {
                const isInLobby = isBotInLobby(bot.id);
                return (
                  <div
                    key={bot.id}
                    onClick={() => handleToggleBot(bot.id)}
                    className={cn(
                      "group relative flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-all",
                      "hover:bg-gray-900/60",
                      isInLobby
                        ? "bg-gray-900/80 border-amber-500/50"
                        : "bg-gray-900/20 border-gray-800 hover:border-gray-700"
                    )}
                  >
                    <div className="relative">
                      <Avatar className={cn(
                        "h-12 w-12 border-2 transition-colors",
                        isInLobby ? "border-amber-500" : "border-gray-800 group-hover:border-gray-600"
                      )}>
                        <div className="flex h-full w-full items-center justify-center bg-gray-900 text-lg font-bold text-gray-200">
                          {bot.name[0]}
                        </div>
                      </Avatar>
                      {isInLobby && (
                        <div className="absolute -top-1 -right-1 bg-amber-500 text-black rounded-full p-0.5 shadow-sm">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className={cn(
                        "font-bold truncate transition-colors",
                        isInLobby ? "text-amber-500" : "text-gray-200"
                      )}>
                        {bot.name}
                      </h4>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-gray-500">{bot.style}</span>
                        <span className="text-gray-800">·</span>
                        <span className={cn(
                          "font-bold",
                          bot.skill === "Beginner" && "text-green-500",
                          bot.skill === "Intermediate" && "text-blue-500",
                          bot.skill === "Pro" && "text-amber-500",
                          bot.skill === "Elite" && "text-red-500",
                        )}>{bot.skill}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            {activeBotTab === "custom" && userBots.length === 0 && (
              <p className="text-gray-500 text-md col-span-full text-center border border-dashed border-gray-700 rounded-lg p-6">
                You have no custom bots. Create one in the Bots page.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}