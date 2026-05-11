import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Coins, Flame, Gift, Sparkles, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoginBonusModalProps {
  isOpen: boolean;
  onClose: () => void;
  bonusAmount: number;
  currentStreak: number;
}

const bonusSchedule = [
  { day: 1, amount: 100 },
  { day: 2, amount: 200 },
  { day: 3, amount: 300 },
  { day: 4, amount: 500 },
  { day: 5, amount: 750 },
  { day: 6, amount: 1000 },
  { day: 7, amount: 1500 },
];

export default function LoginBonusModal({
  isOpen,
  onClose,
  bonusAmount,
  currentStreak,
}: LoginBonusModalProps) {
  const nextDayBonus =
    currentStreak < 7
      ? bonusSchedule[currentStreak].amount
      : bonusSchedule[6].amount;

  const isMaxStreak = currentStreak >= 7;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-amber-500/20 bg-gradient-to-br from-gray-900 via-gray-900 to-amber-950/30 overflow-hidden">
        {/* Animated background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-amber-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <Sparkles className="absolute top-4 right-4 w-6 h-6 text-amber-400/40 animate-pulse" />
          <Sparkles className="absolute bottom-8 left-6 w-4 h-4 text-amber-400/30 animate-pulse delay-500" />
        </div>

        <div className="relative z-10">
          <DialogHeader className="space-y-4">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-amber-500/50 animate-bounce-slow">
                  <Gift className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
                  <Coins className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>

            <DialogTitle className="text-center">
              <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600 mb-2">
                Daily Login Bonus!
              </h2>
              <p className="text-sm text-gray-400 font-normal">
                Welcome back! Here's your reward
              </p>
            </DialogTitle>
          </DialogHeader>

          {/* Bonus Amount Display */}
          <div className="my-6 text-center">
            <div className="inline-flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl px-8 py-4">
              <Coins className="w-8 h-8 text-amber-500" />
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-0.5">
                  You Earned
                </div>
                <div className="text-4xl font-black text-amber-500">
                  +{bonusAmount.toLocaleString()}
                </div>
              </div>
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
          </div>

          {/* Streak Counter */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-center gap-2">
              <Flame
                className={cn(
                  "w-5 h-5",
                  isMaxStreak ? "text-orange-500" : "text-amber-500"
                )}
              />
              <span className="text-sm font-bold text-gray-300">
                {isMaxStreak ? (
                  <>
                    <span className="text-orange-400">Max Streak!</span> Day{" "}
                    {currentStreak}
                  </>
                ) : (
                  <>
                    Day{" "}
                    <span className="text-amber-400">{currentStreak}</span> of 7
                  </>
                )}
              </span>
            </div>

            {/* Progress Dots */}
            <div className="flex items-center justify-center gap-2">
              {bonusSchedule.map((day) => (
                <div
                  key={day.day}
                  className={cn(
                    "relative flex flex-col items-center gap-1 transition-all",
                    currentStreak >= day.day ? "scale-100" : "scale-90"
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all",
                      currentStreak >= day.day
                        ? "bg-gradient-to-br from-amber-400 to-amber-600 border-amber-300 text-white shadow-lg shadow-amber-500/30"
                        : currentStreak === day.day - 1
                          ? "bg-gray-800 border-amber-500/50 text-amber-400 animate-pulse"
                          : "bg-gray-800/50 border-gray-700 text-gray-600"
                    )}
                  >
                    {day.day}
                  </div>
                  <div
                    className={cn(
                      "text-[10px] font-medium",
                      currentStreak >= day.day
                        ? "text-amber-400"
                        : "text-gray-600"
                    )}
                  >
                    {day.amount}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Next Day Preview */}
          {!isMaxStreak && (
            <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="text-sm text-gray-400">
                    Come back tomorrow for
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-amber-500" />
                  <span className="text-lg font-black text-amber-400">
                    +{nextDayBonus.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {isMaxStreak && (
            <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 justify-center">
                <Flame className="w-5 h-5 text-orange-400" />
                <span className="text-sm font-bold text-orange-400">
                  You're on fire! Keep your streak going!
                </span>
              </div>
            </div>
          )}

          {/* Close Button */}
          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-base py-6"
          >
            Awesome!
          </Button>

          <p className="text-xs text-center text-gray-500 mt-3">
            Login daily to maximize your rewards!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
