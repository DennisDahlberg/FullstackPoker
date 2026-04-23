import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { AnimatePresence, motion } from "framer-motion";
import type { GameSessionSummary } from "@/types/GameState";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  sessionSummary: GameSessionSummary | null;
  //   startingPoints?: number;
  //   earnedPoints?: number;
}

const RANK_THRESHOLDS = [
  {
    name: "Beginner",
    min: 0,
    max: 499,
    color: "text-gray-400",
    bg: "bg-gray-400",
  },
  {
    name: "Amateur",
    min: 500,
    max: 2499,
    color: "text-green-500",
    bg: "bg-green-500",
  },
  {
    name: "Intermediate",
    min: 2500,
    max: 9999,
    color: "text-emerald-400",
    bg: "bg-emerald-400",
  },
  {
    name: "Advanced",
    min: 10000,
    max: 24999,
    color: "text-teal-400",
    bg: "bg-teal-400",
  },
  {
    name: "Veteran",
    min: 25000,
    max: 49999,
    color: "text-cyan-400",
    bg: "bg-cyan-400",
  },
  {
    name: "Expert",
    min: 50000,
    max: 99999,
    color: "text-blue-500",
    bg: "bg-blue-500",
  },
  {
    name: "Pro",
    min: 100000,
    max: 249999,
    color: "text-indigo-400",
    bg: "bg-indigo-400",
  },
  {
    name: "Master",
    min: 250000,
    max: 499999,
    color: "text-purple-500",
    bg: "bg-purple-500",
  },
  {
    name: "Elite",
    min: 500000,
    max: 999999,
    color: "text-red-500",
    bg: "bg-red-500",
  },
  {
    name: "Legend",
    min: 1000000,
    max: Infinity,
    color: "text-amber-400",
    bg: "bg-amber-400",
  },
];

function getRankData(points: number) {
  return (
    RANK_THRESHOLDS.find((r) => points >= r.min && points <= r.max) ||
    RANK_THRESHOLDS[0]
  );
}

export function SessionSummaryModal({
  isOpen,
  onClose,
  sessionSummary,
  //   startingPoints = 2400,
  //   earnedPoints = 150,
}: Props) {
  const [displayPoints, setDisplayPoints] = useState(
    sessionSummary ? sessionSummary.startingRankPoints : 0,
  );
  const [animationPhase, setAnimationPhase] = useState(0);

  const finalPoints = sessionSummary
    ? sessionSummary.startingRankPoints + sessionSummary.rankProfit
    : 0;
  const currentRank = getRankData(displayPoints);
  const startRank = getRankData(
    sessionSummary ? sessionSummary.startingRankPoints : 0,
  );
  const hasRankedUp = displayPoints >= startRank.max + 1;

  const rankProgress =
    currentRank.max === Infinity
      ? 100
      : ((displayPoints - currentRank.min) /
          (currentRank.max - currentRank.min)) *
        100;

  useEffect(() => {
    if (sessionSummary && animationPhase === 0) {
      setDisplayPoints(sessionSummary.startingRankPoints);
    }
  }, [sessionSummary, animationPhase]);

  useEffect(() => {
    if (!isOpen || !sessionSummary) {
      setAnimationPhase(0);
      return;
    }

    let phase1: ReturnType<typeof setTimeout>;
    let pointAnimation: ReturnType<typeof setInterval>;

    if (animationPhase === 0) {
      phase1 = setTimeout(() => setAnimationPhase(1), 1000);
    }

    if (animationPhase === 1) {
      const duration = 3500;
      const frames = 60;
      const increment = sessionSummary.rankProfit / frames;
      let current = sessionSummary.startingRankPoints;

      pointAnimation = setInterval(() => {
        current += increment;

        if (
          (sessionSummary.rankProfit >= 0 && current >= finalPoints) ||
          (sessionSummary.rankProfit < 0 && current <= finalPoints)
        ) {
          setDisplayPoints(finalPoints);
          clearInterval(pointAnimation);
          setAnimationPhase(2);
        } else {
          setDisplayPoints(Math.floor(current));
        }
      }, duration / frames);
    }

    return () => {
      if (phase1) clearTimeout(phase1);
      if (pointAnimation) clearInterval(pointAnimation);
    };
  }, [isOpen, animationPhase, sessionSummary, finalPoints]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg bg-gray-900 text-white border-gray-700 overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">
            Session Summary
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4 flex flex-col items-center">
          {/* Base Stats Here (Profit, Hands, etc) */}
          <div className="text-center">
            <h3 className="text-lg text-gray-400">Total Profit</h3>
            <p
              className={`text-4xl font-bold ${sessionSummary?.profit! >= 0 ? "text-green-500" : "text-red-500"}`}
            >
              {sessionSummary?.profit! >= 0 ? "+" : "-"}$
              {Math.abs(sessionSummary?.profit!)}
            </p>
          </div>

          {/* Animated Rank Section */}
          <div className="w-full bg-black/40 p-6 rounded-xl mt-4 relative">
            <div className="flex justify-between items-end mb-2">
              <motion.div
                animate={
                  hasRankedUp
                    ? { scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }
                    : {}
                }
                transition={{ duration: 0.5 }}
                className="flex flex-col"
              >
                <span className="text-sm text-gray-400">Current Rank</span>
                <span
                  className={`text-2xl font-black uppercase tracking-wider ${currentRank.color} drop-shadow-md`}
                >
                  {currentRank.name}
                </span>
              </motion.div>

              <div className="text-right flex flex-col">
                <span className="text-xs text-gray-500">Rank Points</span>
                <span className="text-xl font-mono font-bold">
                  {displayPoints.toLocaleString()}
                  <span className="text-sm font-normal text-gray-500 ml-1">
                    /{" "}
                    {currentRank.max === Infinity
                      ? "MAX"
                      : currentRank.max.toLocaleString()}
                  </span>
                </span>
              </div>
            </div>

            {/* Progress Bar Container */}
            <div className="h-4 w-full bg-gray-800 rounded-full overflow-hidden relative border border-gray-700">
              <motion.div
                className={`h-full ${currentRank.bg}`}
                initial={{ width: 0 }}
                animate={{ width: `${rankProgress}%` }}
                transition={{ type: "spring", bounce: 0, duration: 0.1 }}
              />
            </div>

            {/* Floating points earned indicator */}
            <AnimatePresence>
              {animationPhase === 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`absolute right-6 -top-4 font-bold ${sessionSummary && sessionSummary.rankProfit >= 0 ? "text-green-400" : "text-red-400"}`}
                >
                  {sessionSummary && sessionSummary.rankProfit >= 0 ? "+" : ""}
                  {sessionSummary ? sessionSummary.rankProfit : 0} pts
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <DialogFooter>
          <Button
            className="w-full bg-amber-600 hover:bg-amber-700"
            onClick={onClose}
          >
            Back to Dashboard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
