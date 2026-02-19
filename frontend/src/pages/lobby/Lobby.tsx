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
  Play,
  UserPlus,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { BotProfile } from "@/types/Lobby";

export default function Lobby() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tableId = searchParams.get("tableId");

  const {
    lobby,
    loading,
    error,
    gameStartedId,
    connectAndCreate,
    leaveLobby,
    addBot,
    removeBot,
    startGame,
    clearGameStarted,
    invitePlayer,
  } = useLobbyStore();

  const [bots, setBots] = useState<BotProfile[]>([]);
  const [loadingBots, setLoadingBots] = useState(true);
  const [activeBotTab, setActiveBotTab] = useState<"standard" | "custom">("standard");
  const [skillFilter, setSkillFilter] = useState<"All" | "Beginner" | "Intermediate" | "Pro" | "Elite">("All");

  const [friends, setFriends] = useState<{ id: string; username: string; isOnline: boolean }[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [showInvitePanel, setShowInvitePanel] = useState(false);
  const [invitingId, setInvitingId] = useState<string | null>(null);
  const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());

  const standardBots = bots.filter(b => !b.isUserCreated);
  const userBots = bots.filter(b => b.isUserCreated);

  // Navigate to game when it starts
  useEffect(() => {
    if (gameStartedId) {
      clearGameStarted();
      navigate("/game");
    }
  }, [gameStartedId]);

  // Connect to lobby hub on mount
  useEffect(() => {
    if (!tableId) {
      navigate("/lobby/create");
      return;
    }

    connectAndCreate(Number(tableId));

    return () => {
      // Only leave if game hasn't started
      const { gameStartedId } = useLobbyStore.getState();
      if (!gameStartedId) {
        leaveLobby();
      }
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

  // Fetch friends for invite panel
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        setLoadingFriends(true);
        const data = await api.friends.getFriends();
        setFriends(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingFriends(false);
      }
    };
    fetchFriends();
  }, []);

  const handleInviteFriend = async (friendId: string) => {
    setInvitingId(friendId);
    try {
      await invitePlayer(friendId);
      setInvitedIds((prev) => new Set(prev).add(friendId));
    } finally {
      setInvitingId(null);
    }
  };

  const isPlayerInLobby = (friendId: string) => {
    return lobby?.players.some((p) => p.userId === friendId) ?? false;
  };

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
    await leaveLobby();
    navigate("/lobby/create");
  };

  const canStartGame = lobby && (lobby.players.length + lobby.botIds.length) >= 2;

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
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowInvitePanel(!showInvitePanel)}
            className={cn(
              showInvitePanel && "border-amber-500/50 text-amber-500"
            )}
          >
            <UserPlus className="w-4 h-4 mr-1" />
            Invite
          </Button>
          <Button variant="outline" size="sm" onClick={handleLeaveLobby}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Leave
          </Button>
        </div>
      </div>

      {/* Invite Friends Panel */}
      {showInvitePanel && (
        <div className="space-y-3 bg-gray-900/40 border border-gray-800 rounded-xl p-5">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <UserPlus className="text-amber-500 w-5 h-5" />
            Invite Friends
          </h2>
          {loadingFriends ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
            </div>
          ) : friends.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-6">
              No friends to invite. Add friends first!
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {friends.map((friend) => {
                const inLobby = isPlayerInLobby(friend.id);
                const invited = invitedIds.has(friend.id);
                const isInviting = invitingId === friend.id;

                return (
                  <div
                    key={friend.id}
                    className={cn(
                      "flex items-center justify-between gap-3 p-3 rounded-lg border transition-all",
                      inLobby
                        ? "bg-green-500/5 border-green-500/20"
                        : "bg-gray-900/60 border-gray-800"
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative">
                        <Avatar className="h-9 w-9 border border-gray-700">
                          <div className="flex h-full w-full items-center justify-center bg-gray-800 text-sm font-bold text-amber-500">
                            {friend.username[0]}
                          </div>
                        </Avatar>
                        <div
                          className={cn(
                            "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-gray-950",
                            friend.isOnline ? "bg-green-500" : "bg-gray-600"
                          )}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-gray-200 truncate">
                          {friend.username}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {inLobby
                            ? "In lobby"
                            : friend.isOnline
                            ? "Online"
                            : "Offline"}
                        </p>
                      </div>
                    </div>

                    {inLobby ? (
                      <span className="text-xs text-green-500 font-bold flex items-center gap-1 shrink-0">
                        <Check className="w-3 h-3" />
                        Joined
                      </span>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={invited || isInviting || !friend.isOnline}
                        onClick={() => handleInviteFriend(friend.id)}
                        className={cn(
                          "h-8 text-xs shrink-0",
                          invited && "border-amber-500/30 text-amber-500"
                        )}
                      >
                        {isInviting ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : invited ? (
                          <>
                            <Check className="w-3 h-3 mr-1" />
                            Sent
                          </>
                        ) : (
                          <>
                            <Send className="w-3 h-3 mr-1" />
                            Invite
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

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

      {/* Start Game Button */}
      <div className="fixed bottom-8 right-8 z-50 animate-in fade-in slide-in-from-bottom-4">
        <Button
          size="lg"
          onClick={startGame}
          disabled={!canStartGame || loading}
          className={cn(
            "h-14 px-8 rounded-full text-lg font-bold shadow-2xl transition-all",
            canStartGame && !loading
              ? "bg-amber-500 hover:bg-amber-400 text-black hover:scale-105 shadow-amber-900/50"
              : "bg-gray-800 text-gray-500 cursor-not-allowed"
          )}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <Play className="w-5 h-5 mr-2" />
          )}
          Start Game
        </Button>
      </div>
    </div>
  );
}