import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import {
  ChartColumn,
  Trophy,
  Flame,
  TrendingUp,
  TrendingDown,
  Coins,
  Target,
  Loader2,
  Calendar,
  Users,
  Clock,
  Crown,
  ChevronDown,
  Divide,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ── Mock Data ──────────────────────────────────────────────────────────────

const profitHistory = [
  { date: "Jan 5", profit: 0, cumulative: 0 },
  { date: "Jan 12", profit: 120, cumulative: 120 },
  { date: "Jan 19", profit: -45, cumulative: 75 },
  { date: "Jan 26", profit: 200, cumulative: 275 },
  { date: "Feb 2", profit: -80, cumulative: 195 },
  { date: "Feb 9", profit: 150, cumulative: 345 },
  { date: "Feb 16", profit: 310, cumulative: 655 },
  { date: "Feb 23", profit: -120, cumulative: 535 },
  { date: "Mar 2", profit: 90, cumulative: 625 },
  { date: "Mar 9", profit: 250, cumulative: 875 },
  { date: "Mar 16", profit: -30, cumulative: 845 },
  { date: "Mar 23", profit: 180, cumulative: 1025 },
  { date: "Mar 30", profit: 75, cumulative: 1100 },
  { date: "Apr 6", profit: -200, cumulative: 900 },
  { date: "Apr 13", profit: 340, cumulative: 1240 },
  { date: "Apr 20", profit: 110, cumulative: 1350 },
];

type GameResult = "win" | "loss";

interface PastGame {
  id: string;
  date: string;
  players: number;
  buyIn: number;
  result: GameResult;
  profit: number;
  duration: string;
  bestHand: string;
  chipsPostGame: number;
}

const GAMES_PER_PAGE = 5;

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const value = payload[0].value;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 shadow-xl">
      <p className="text-gray-400 text-xs font-medium mb-1">{label}</p>
      <p
        className={cn(
          "text-lg font-bold",
          value >= 0 ? "text-green-400" : "text-red-400",
        )}
      >
        {value >= 0 ? "+" : ""}
        {value.toLocaleString()}
        <span className="text-gray-500 text-xs ml-1">chips</span>
      </p>
    </div>
  );
}

export default function Statistics() {
  const [games, setGames] = useState<PastGame[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const fetchGames = useCallback(async (nextPage: number, append: boolean) => {
    try {
      const data = await api.statistics.getGameHistory(
        nextPage,
        GAMES_PER_PAGE,
      );
      setGames((prev) => (append ? [...prev, ...data.games] : data.games));
      setHasMore(data.hasMore);
      setTotal(data.total);
      setPage(nextPage);
    } catch (err) {
      console.error("Failed to fetch game history:", err);
    } finally {
      setLoadingMore(false);
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGames(1, false);
  }, [fetchGames]);

  const handleLoadMore = () => {
    setLoadingMore(true);
    fetchGames(page + 1, true);
  };

  const totalGames = 12;
  const wins = 10;
  const winRate = Math.round((wins / totalGames) * 100);
  const totalProfit = 6310;
  const biggestWin = 250;
  const currentStreak = 2;

  const statBoxes = [
    {
      label: "Games Played",
      value: totalGames.toString(),
      icon: Target,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
    },
    {
      label: "Win Rate",
      value: `${winRate}%`,
      icon: Trophy,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
    },
    {
      label: "Total Profit",
      value: `${totalProfit >= 0 ? "+" : ""}${totalProfit.toLocaleString()}`,
      icon: totalProfit >= 0 ? TrendingUp : TrendingDown,
      color: totalProfit >= 0 ? "text-green-400" : "text-red-400",
      bgColor: totalProfit >= 0 ? "bg-green-500/10" : "bg-red-500/10",
      borderColor:
        totalProfit >= 0 ? "border-green-500/20" : "border-red-500/20",
    },
    {
      label: "Biggest Win",
      value: `+${biggestWin.toLocaleString()}`,
      icon: Crown,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
    },
    {
      label: "Games Won",
      value: wins.toString(),
      icon: Flame,
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20",
    },
    {
      label: "Win Streak",
      value: currentStreak.toString(),
      icon: Coins,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <ChartColumn className="text-amber-500 w-8 h-8" />
            Statistics
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Track your performance and review past games
          </p>
        </div>
      </div>

      {/* Stat Boxes */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {statBoxes.map((stat) => (
          <div
            key={stat.label}
            className={cn(
              "relative overflow-hidden rounded-xl border p-4 transition-all hover:scale-[1.02]",
              stat.borderColor,
              "bg-gray-900/40",
            )}
          >
            <div
              className={cn("inline-flex rounded-lg p-2 mb-3", stat.bgColor)}
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

      {/* Profit Chart */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <TrendingUp className="text-amber-500 w-5 h-5" />
          Profit Over Time
        </h2>
        <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-5 pr-2">
          <ResponsiveContainer width="100%" height={340}>
            <AreaChart data={profitHistory}>
              <defs>
                <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1f2937"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v >= 0 ? "+" : ""}${v}`}
                dx={-10}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="cumulative"
                stroke="#f59e0b"
                strokeWidth={2.5}
                fill="url(#profitGradient)"
                dot={false}
                activeDot={{
                  r: 6,
                  fill: "#f59e0b",
                  stroke: "#1f2937",
                  strokeWidth: 3,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Past Games */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Clock className="text-amber-500 w-5 h-5" />
          Game History
        </h2>

        {initialLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        ) : (
          <div className="space-y-2">
            {games.map((game) => (
              <div
                key={game.id}
                className="group flex items-center justify-between p-4 rounded-xl border border-transparent bg-gray-900/40 hover:bg-gray-900/70 hover:border-gray-800 transition-all"
              >
                {/* Left section */}
                <div className="flex items-center gap-4 min-w-0">
                  {/* Result indicator */}
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

                  {/* Game info */}
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
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {game.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {game.players} players
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {game.duration}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right section */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <p
                      className={cn(
                        "text-sm font-black",
                        game.profit >= 0 ? "text-green-400" : "text-red-400",
                      )}
                    >
                      {game.profit >= 0 ? "+" : ""}
                      {game.profit.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-600">
                      Chips: {game.chipsPostGame.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More */}
        {hasMore && (
          <div className="flex justify-center pt-2">
            <Button
              variant="outline"
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="border-gray-800 text-gray-400 hover:text-white hover:border-gray-700"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-2" />
                  Load More ({total - games.length} remaining)
                </>
              )}
            </Button>
          </div>
        )}

        {!hasMore && total > GAMES_PER_PAGE && (
          <p className="text-center text-xs text-gray-600 pt-2">
            All {total} games loaded
          </p>
        )}
      </div>
    </div>
  );
}
