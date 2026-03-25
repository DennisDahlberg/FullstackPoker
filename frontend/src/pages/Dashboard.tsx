import { useAuthContext } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Target,
  Flame,
  Users,
  Clock,
  ChevronRight,
  Coins,
  CreditCard,
  Wifi,
  Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import type { PastGame, Summary } from "@/types/Statistics";
import { api } from "@/lib/api";
import type { Friend } from "./Friends";

export default function Dashboard() {
  const { data } = useAuthContext();
  const user = data?.user;
  const balance = user?.balance ?? 25_000;

  const [summary, setSummary] = useState<Summary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(true);

  const [recentGames, setRecentGames] = useState<PastGame[]>([]);
  const [loadingGames, setLoadingGames] = useState(true);

  const [friends, setFriends] = useState<Friend[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const onlineCount = friends.filter((f) => f.isOnline).length;

  useEffect(() => {
    api.statistics
      .getSummary()
      .then(setSummary)
      .catch(console.error)
      .finally(() => setLoadingSummary(false));
  }, []);

  useEffect(() => {
    api.statistics
      .getGameHistory(1, 4)
      .then((data) => setRecentGames(data.games ?? []))
      .catch(console.error)
      .finally(() => setLoadingGames(false));
  }, []);

  useEffect(() => {
    api.friends
      .getFriends()
      .then(setFriends)
      .catch(console.error)
      .finally(() => setLoadingFriends(false));
  }, []);

  const statBoxes = [
    {
      label: "Games Played",
      value: summary ? summary.totalGames.toString() : "-",
      icon: Target,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      label: "Win Rate",
      value: summary ? `${summary.winRate}%` : "-",
      icon: Trophy,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
    {
      label: "Total Profit",
      value: summary
        ? `${summary.totalProfit >= 0 ? "+" : ""}${summary.totalProfit.toLocaleString()}`
        : "-",
      icon: summary
        ? summary.totalProfit >= 0
          ? TrendingUp
          : TrendingDown
        : TrendingUp,
      color: summary
        ? summary.totalProfit >= 0
          ? "text-green-400"
          : "text-red-400"
        : "text-green-400",
      bg: summary
        ? summary.totalProfit >= 0
          ? "bg-green-500/10"
          : "bg-red-500/10"
        : "bg-green-500/10",
      border: summary
        ? summary.totalProfit >= 0
          ? "border-green-500/20"
          : "border-red-500/20"
        : "border-green-500/20",
    },
    {
      label: "Win Streak",
      value: summary ? summary.currentStreak.toString() : "-",
      icon: Flame,
      color: "text-orange-400",
      bg: "bg-orange-500/10",
      border: "border-orange-500/20",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-gray-800 pb-6">
        <h1 className="text-3xl font-black tracking-tight text-white">
          Welcome back,{" "}
          <span className="text-amber-500">{user?.name ?? "Player"}</span>
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Here's what's happening with your game
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        {/* ── Credit Card ────────────────────────────────── */}
        <div className="lg:col-span-2 relative h-52 rounded-2xl overflow-hidden select-none">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950 border border-gray-700/50 rounded-2xl" />
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-amber-500/10 blur-2xl" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-amber-600/10 blur-2xl" />

          <div className="relative h-full flex flex-col justify-between p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-amber-500" />
                <span className="text-sm font-bold text-amber-500 tracking-widest uppercase">
                  PokerAI
                </span>
              </div>
              <Wifi className="w-5 h-5 text-gray-500 rotate-90" />
            </div>

            <div className="w-10 h-7 rounded-sm bg-gradient-to-br from-amber-400 to-amber-600 border border-amber-300/40" />

            <div>
              <p className="text-xs text-gray-500 font-medium mb-0.5">
                Balance
              </p>
              <p className="text-2xl font-black text-white tracking-tight flex items-center gap-1.5">
                <Coins className="w-5 h-5 text-amber-500" />
                {balance.toLocaleString()}
              </p>
            </div>

            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] text-gray-600 uppercase tracking-widest">
                  Card Holder
                </p>
                <p className="text-sm font-bold text-gray-200 tracking-wide">
                  {user?.name ?? "Player One"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-600 uppercase tracking-widest">
                  Rank
                </p>
                <p
                  className={cn(
                    "text-sm font-bold tracking-wide",
                    user?.rank === "Beginner" && "text-green-400",
                    user?.rank === "Intermediate" && "text-blue-400",
                    user?.rank === "Pro" && "text-amber-400",
                    user?.rank === "Elite" && "text-red-400",
                    !user?.rank && "text-gray-400",
                  )}
                >
                  {user?.rank ?? "Beginner"}
                </p>
              </div>

              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-amber-500/80" />
                <div className="w-6 h-6 rounded-full bg-amber-700/80" />
              </div>
            </div>
          </div>
        </div>

        {/* ── Stat Boxes ───────────────────────────── */}
        <div className="lg:col-span-3 grid grid-cols-2 gap-3">
          {loadingSummary
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-gray-800 bg-gray-900/40 p-4"
                >
                  <Skeleton className="w-8 h-8 rounded-lg mb-3 bg-gray-800/40" />
                  <Skeleton className="h-7 w-16 rounded mb-2 bg-gray-800/40" />
                  <Skeleton className="h-3 w-24 rounded bg-gray-800/40" />
                </div>
              ))
            : statBoxes.map((stat) => (
                <div
                  key={stat.label}
                  className={cn(
                    "relative overflow-hidden rounded-xl border p-4 transition-all hover:scale-[1.02]",
                    stat.border,
                    "bg-gray-900/40",
                  )}
                >
                  <div
                    className={cn("inline-flex rounded-lg p-2 mb-3", stat.bg)}
                  >
                    <stat.icon className={cn("w-4 h-4", stat.color)} />
                  </div>
                  <p className="text-2xl font-black text-white tracking-tight">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    {stat.label}
                  </p>
                </div>
              ))}
        </div>
      </div>

      {/* Recent Games */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="text-amber-500 w-5 h-5" />
              Recent Games
            </h2>
            <Link
              to="/statistics"
              className="text-xs text-gray-500 hover:text-amber-500 flex items-center gap-1 transition-colors"
            >
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2 flex-1">
            {loadingGames ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 rounded-xl bg-gray-900/40"
                >
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-10 h-10 rounded-lg shrink-0 bg-gray-800/40" />
                    <div className="space-y-2">
                      <Skeleton className="h-3.5 w-32 rounded bg-gray-800/40" />
                      <Skeleton className="h-3 w-48 rounded bg-gray-800/40" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-10 rounded bg-gray-800/40" />
                </div>
              ))
            ) : recentGames.length === 0 ? (
              <p className="text-center text-gray-500 text-sm py-8">
                No games played yet
              </p>
            ) : (
              recentGames.map((game) => (
                <div
                  key={game.id}
                  className="group flex items-center justify-between p-4 rounded-xl border border-transparent bg-gray-900/40 hover:bg-gray-900/70 hover:border-gray-800 transition-all"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-lg shrink-0",
                        game.result === "win"
                          ? "bg-green-500/10 border border-green-500/20"
                          : "bg-red-500/10 border border-red-500/20",
                      )}
                    >
                      {game.result === "win" ? (
                        <TrendingUp className="w-5 h-5 text-green-400" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-red-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-200 text-sm">
                          {game.result === "win" ? "Victory" : "Defeat"}
                        </span>
                        <span className="text-xs text-gray-600">•</span>
                        <span className="text-xs text-gray-500">
                          {game.bestHand}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span>{game.date}</span>
                        <span>{game.players} players</span>
                        <span>{game.duration}</span>
                      </div>
                    </div>
                  </div>
                  <p
                    className={cn(
                      "text-sm font-black shrink-0",
                      game.profit >= 0 ? "text-green-400" : "text-red-400",
                    )}
                  >
                    {game.profit >= 0 ? "+" : ""}
                    {game.profit.toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Friends Online ─────────────────────────────── */}
        <div className="space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="text-amber-500 w-5 h-5" />
              Friends
              <span className="text-xs text-gray-500 font-normal ml-1">
                {onlineCount} online
              </span>
            </h2>
            <Link
              to="/friends"
              className="text-xs text-gray-500 hover:text-amber-500 flex items-center gap-1 transition-colors"
            >
              Manage <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="bg-gray-900/40 border border-gray-800 rounded-xl divide-y divide-gray-800/50 flex-1">
            {loadingFriends ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-full bg-gray-800/40" />
                    <Skeleton className="h-3.5 w-24 rounded bg-gray-800/40" />
                  </div>
                  <Skeleton className="h-3 w-12 rounded bg-gray-800/40" />
                </div>
              ))
            ) : friends.length === 0 ? (
              <p className="text-center text-gray-500 text-sm py-8">
                No friends yet
              </p>
            ) : (
              <div className="divide-y divide-gray-800/50">
                {friends.slice(0, 5).map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-400">
                          {friend.username.slice(0, 2).toUpperCase()}
                        </div>
                        <div
                          className={cn(
                            "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-gray-900",
                            friend.isOnline ? "bg-green-500" : "bg-gray-600",
                          )}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-300">
                        {friend.username}
                      </span>
                    </div>
                    <span
                      className={cn(
                        "text-[10px] font-medium uppercase tracking-wider",
                        friend.isOnline ? "text-green-500" : "text-gray-600",
                      )}
                    >
                      {friend.isOnline ? "Online" : "Offline"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 pt-2">
        <Link to="/lobby">
          <Button className="bg-amber-600 hover:bg-amber-700 text-white font-bold gap-2">
            <Crown className="w-4 h-4" /> Play Now
          </Button>
        </Link>
        <Link to="/statistics">
          <Button
            variant="outline"
            className="border-gray-800 text-gray-400 hover:text-white hover:border-gray-700 gap-2"
          >
            <Target className="w-4 h-4" /> Full Statistics
          </Button>
        </Link>
        <Link to="/friends">
          <Button
            variant="outline"
            className="border-gray-800 text-gray-400 hover:text-white hover:border-gray-700 gap-2"
          >
            <Users className="w-4 h-4" /> Find Friends
          </Button>
        </Link>
      </div>
    </div>
  );
}
