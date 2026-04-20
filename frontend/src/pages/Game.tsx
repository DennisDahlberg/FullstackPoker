import { useNavigate } from "react-router-dom";
import PlayerSeat from "@/components/PlayerSeat";
import {
  Clock,
  LogOut,
  Minus,
  Settings,
  TrendingDown,
  TrendingUp,
  Trophy,
} from "lucide-react";
import PlayingCard from "@/components/PlayingCard";
import { useEffect, useRef, useState } from "react";
import { useGameStore } from "@/stores/useGameStore";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function Game() {
  const navigate = useNavigate();
  const game = useGameStore((s) => s.game);
  const error = useGameStore((s) => s.error);
  const sessionSummary = useGameStore((s) => s.sessionSummary);
  const connectToGame = useGameStore((s) => s.connectToGame);
  const disconnectFromGame = useGameStore((s) => s.disconnectFromGame);
  const playerAction = useGameStore((s) => s.playerAction);
  const submitRebuy = useGameStore((s) => s.submitRebuy);
  const submitReady = useGameStore((s) => s.submitReady);
  const startNewRound = useGameStore((s) => s.startNewRound);
  const leaveGame = useGameStore((s) => s.leaveGame);
  const clearError = useGameStore((s) => s.clearError);
  const clearSessionSummary = useGameStore((s) => s.clearSessionSummary);
  const [isRebuyModalOpen, setIsRebuyModalOpen] = useState(false);

  const [raiseValue, setRaiseValue] = useState(0);
  const [isRaiseModalOpen, setIsRaiseModalOpen] = useState(false);
  const [isLeaveWarningOpen, setIsLeaveWarningOpen] = useState(false);
  const [rebuyTimeLeft, setRebuyTimeLeft] = useState(10);
  const minRaise = game ? game.smallBlind : 0;

  const [readyTimeLeft, setReadyTimeLeft] = useState(10);
  const [hasSubmittedReady, setHasSubmittedReady] = useState(false);
  const hasSubmittedReadyRef = useRef(false);

  const myUserId = game?.currentViewerUserId;
  const player = game?.players.find((p) => p.userId === myUserId);

  useEffect(() => {
    console.log("Current player state:", player);
  }, [player]);

  useEffect(() => {
    if (player?.isAwaitingRebuy) {
      setIsRebuyModalOpen(true);
      setRebuyTimeLeft(10);
      const timer = setInterval(() => {
        setRebuyTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            submitRebuy(false);
            setIsRebuyModalOpen(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setIsRebuyModalOpen(false);
    }
  }, [player?.isAwaitingRebuy, submitRebuy]);

  useEffect(() => {
    connectToGame();

    return () => {
      disconnectFromGame();
    };
  }, [connectToGame, disconnectFromGame]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleLeaveClick = () => {
    setIsLeaveWarningOpen(true);
  };

  const confirmLeave = async () => {
    setIsLeaveWarningOpen(false);
    await leaveGame();
  };

  const handleSessionSummaryClose = () => {
    clearSessionSummary();
    navigate("/dashboard");
  };

  const getCallAmount = () => {
    if (!game || !player) return 0;
    return game.highestBet - (player.currentBet || 0);
  };

  const getButtonConfig = (action: string) => {
    switch (action) {
      case "fold":
        return {
          label: "Fold",
          className:
            "w-24 h-12 bg-red-900/30 border-red-700 text-red-400 hover:bg-red-900/50 hover:text-red-300",
          onClick: () => playerAction("fold"),
        };
      case "check":
        return {
          label: "Check",
          className:
            "w-24 h-12 bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white",
          onClick: () => playerAction("check"),
        };
      case "call":
        return {
          label: `Call ($${getCallAmount()})`,
          className:
            "w-24 h-12 bg-blue-800/30 border-blue-700 text-blue-400 hover:bg-blue-800/50 hover:text-blue-300",
          onClick: () => playerAction("call"),
        };
      case "raise":
        return {
          label: "Raise",
          className:
            "w-24 h-12 bg-green-800/30 border-green-700 text-green-400 hover:bg-green-800/50 hover:text-green-300",
          onClick: () => {
            setRaiseValue(minRaise);
            setIsRaiseModalOpen(true);
          },
        };
      case "all-in":
        return {
          label: "All In",
          className:
            "w-24 h-12 bg-purple-800/30 border-purple-700 text-purple-400 hover:bg-purple-800/50 hover:text-purple-300",
          onClick: () => playerAction("all-in"),
        };
    }
  };

  if (!game && !sessionSummary) return <div>Loading...</div>;

  const myPlayerIndex = game?.players.findIndex((p) => p.userId === myUserId);
  const isMyTurn = myPlayerIndex === game?.currentPlayerIndex;
  const hasPenalty = game ? !game.isGameOver && game.penaltyAmount > 0 : false;

  return (
    <div className="fixed inset-0 bg-gray-950 flex flex-col">
      {/* Header */}
      <div className="h-14 bg-gray-900/80 border-b border-gray-800 flex items-center justify-between px-4">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          {isMyTurn && (
            <span className="text-amber-500 font-bold animate-pulse">
              Your turn
            </span>
          )}
          {!isMyTurn && !game?.isGameOver && (
            <span>
              Waiting for {game?.players[game.currentPlayerIndex]?.name}...
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white"
          >
            <Settings className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
            onClick={handleLeaveClick}
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Poker Table */}
        <div className="absolute inset-8 md:inset-16 lg:inset-24 max-w-5xl mx-auto">
          {/* Table Surface */}
          <div className="absolute inset-0 bg-gradient-to-b from-green-800 to-green-900 rounded-[50%] border-8 border-amber-900 shadow-2xl">
            {/* Table felt texture overlay */}
            <div className="absolute inset-0 rounded-[50%] opacity-30 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(0,0,0,0.3)_100%)]" />

            {/* Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              {/* Pot */}
              <div className="bg-black/40 px-6 py-2 rounded-full">
                <span className="text-amber-400 font-bold text-lg md:text-xl">
                  Pot: ${game?.pot.toLocaleString()}
                </span>
              </div>

              {/* Community Cards */}
              <div className="flex gap-2 md:gap-3">
                {game?.communityCards.map((card, index) => (
                  <PlayingCard
                    key={index}
                    value={`${card.rank}${card.suit}`}
                    hidden={card.isHidden}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Player Seats */}
          {game?.players.map((p, index) => (
            <PlayerSeat
              key={index}
              position={index}
              player={p || undefined}
              isCurrentPlayer={index === game?.currentPlayerIndex}
              isMe={p.userId === myUserId}
            />
          ))}
        </div>
      </div>

      {game?.isGameOver && (
        <div className="w-full flex flex-col items-center justify-center">
          <h1 className="text-4xl font-bold mb-6">
            Winners:{" "}
            {game.winnersPositions
              .map((pos) => game.players[pos].name)
              .join(", ")}
          </h1>
          <Button variant={"outline"} className="mb-2" onClick={startNewRound}>
            Start New Round
          </Button>
        </div>
      )}

      {/* Actions */}
      <div className="h-24 bg-gray-900 border-t border-gray-800 p-6">
        <div className="max-w-2xl mx-auto flex flex-col md:flex-row items-center justify-center gap-4 h-full">
          {isMyTurn && (game?.availableActions.length ?? 0) > 0 ? (
            <div className="flex items-center gap-3">
              {game?.availableActions.map((action) => {
                const buttonConfig = getButtonConfig(action);
                return (
                  <Button
                    key={action}
                    variant="outline"
                    className={buttonConfig?.className}
                    onClick={buttonConfig?.onClick}
                  >
                    {buttonConfig?.label}
                  </Button>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">
              {game?.isGameOver
                ? "Round over"
                : `Waiting for ${game?.players[game?.currentPlayerIndex]?.name}...`}
            </p>
          )}
        </div>
      </div>
      <Dialog open={isRaiseModalOpen} onOpenChange={setIsRaiseModalOpen}>
        <DialogContent className="sm:max-w-md bg-gray-900 text-white border-gray-700">
          <DialogHeader>
            <DialogTitle>Place your raise</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-6 py-4">
            <div className="relative flex items-center justify-center gap-2">
              <span className="text-2xl font-bold text-green-400 absolute left-4">
                $
              </span>
              <Input
                type="number"
                value={raiseValue}
                max={player?.chips ?? 0}
                min={minRaise}
                step={5}
                onChange={(e) => setRaiseValue(Number(e.target.value))}
                className="text-3xl h-16 text-center font-mono bg-black/20"
              />
            </div>

            <Slider
              value={[raiseValue]}
              max={player?.chips ?? 0}
              min={minRaise}
              step={1}
              onValueChange={([val]) => setRaiseValue(val)}
              className="py-2 bg-gray-800/50 rounded-lg"
            />

            <div className="grid grid-cols-4 gap-2">
              <Button
                variant="outline"
                onClick={() =>
                  setRaiseValue(Math.floor((player?.chips ?? 0) / 4))
                }
              >
                1/4 Pot
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  setRaiseValue(Math.floor((player?.chips ?? 0) / 2))
                }
              >
                1/2 Pot
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  setRaiseValue(Math.floor(((player?.chips ?? 0) * 3) / 4))
                }
              >
                3/4 Pot
              </Button>
              <Button
                variant="outline"
                className="border-purple-500"
                onClick={() => setRaiseValue(player?.chips ?? 0)}
              >
                All-In
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={() => {
                playerAction("raise", { amount: raiseValue });
                setIsRaiseModalOpen(false);
              }}
            >
              Confirm Raise ${raiseValue}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isLeaveWarningOpen}
        onOpenChange={setIsLeaveWarningOpen}
      >
        <AlertDialogContent className="bg-gray-900 text-white border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle
              className={`text-xl ${hasPenalty ? "text-red-400" : "text-yellow-400"}`}
            >
              {hasPenalty ? "Leave Game Early?" : "Leave Game?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300 space-y-3">
              {hasPenalty ? (
                <>
                  <p>You are about to leave the game before it has finished.</p>

                  <div className="bg-black/30 p-4 rounded-lg space-y-2 my-4">
                    <div className="flex justify-between">
                      <span>Current chips:</span>
                      <span className="font-bold text-green-400">
                        ${player?.chips}
                      </span>
                    </div>
                    <div className="flex justify-between text-red-400">
                      <span>Early leave penalty (10%):</span>
                      <span className="font-bold">-${game?.penaltyAmount}</span>
                    </div>
                    <div className="border-t border-gray-700 pt-2 mt-2 flex justify-between text-lg">
                      <span>You will receive:</span>
                      <span className="font-bold text-amber-400">
                        ${game?.earlyLeavePayout}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-400">
                    Are you sure you want to leave? This action cannot be
                    undone.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    The current round has ended. You can leave without penalty.
                  </p>

                  <div className="bg-black/30 p-4 rounded-lg space-y-2 my-4">
                    <div className="flex justify-between text-lg">
                      <span>You will receive:</span>
                      <span className="font-bold text-green-400">
                        ${player?.chips}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-400">
                    Your chips will be added to your balance.
                  </p>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 hover:bg-gray-700">
              {hasPenalty ? "Stay in Game" : "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmLeave}
              className={
                hasPenalty
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }
            >
              Leave Game
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Session Summary Dialog */}
      <Dialog
        open={!!sessionSummary}
        onOpenChange={(open) => {
          if (!open) handleSessionSummaryClose();
        }}
      >
        <DialogContent className="sm:max-w-lg bg-gray-900 text-white border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center">
              Session Summary
            </DialogTitle>
          </DialogHeader>

          {sessionSummary && (
            <div className="space-y-6 py-4">
              {/* Profit/Loss Header */}
              <div className="flex flex-col items-center gap-2">
                {sessionSummary.profit > 0 ? (
                  <TrendingUp className="w-12 h-12 text-green-400" />
                ) : sessionSummary.profit < 0 ? (
                  <TrendingDown className="w-12 h-12 text-red-400" />
                ) : (
                  <Minus className="w-12 h-12 text-gray-400" />
                )}
                <span
                  className={`text-4xl font-bold ${
                    sessionSummary.profit > 0
                      ? "text-green-400"
                      : sessionSummary.profit < 0
                        ? "text-red-400"
                        : "text-gray-400"
                  }`}
                >
                  {sessionSummary.profit >= 0 ? "+" : ""}$
                  {sessionSummary.profit.toLocaleString()}
                </span>
                <span className="text-sm text-gray-400">
                  {sessionSummary.profit > 0
                    ? "Nice session!"
                    : sessionSummary.profit < 0
                      ? "Better luck next time"
                      : "Break even"}
                </span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/30 p-4 rounded-lg text-center">
                  <Clock className="w-5 h-5 mx-auto mb-1 text-gray-400" />
                  <p className="text-lg font-bold">{sessionSummary.duration}</p>
                  <p className="text-xs text-gray-500">Duration</p>
                </div>
                <div className="bg-black/30 p-4 rounded-lg text-center">
                  <Trophy className="w-5 h-5 mx-auto mb-1 text-amber-400" />
                  <p className="text-lg font-bold">
                    {sessionSummary.roundsPlayed}
                  </p>
                  <p className="text-xs text-gray-500">Rounds Played</p>
                </div>
              </div>

              {/* Chip Breakdown */}
              <div className="bg-black/30 p-4 rounded-lg space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Starting chips</span>
                  <span className="font-medium">
                    ${sessionSummary.startingChips.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Final chips</span>
                  <span className="font-medium">
                    ${sessionSummary.finalChips.toLocaleString()}
                  </span>
                </div>
                {sessionSummary.wasEarlyLeave &&
                  sessionSummary.penaltyAmount > 0 && (
                    <div className="flex justify-between text-sm text-red-400">
                      <span>Early leave penalty</span>
                      <span className="font-medium">
                        -${sessionSummary.penaltyAmount.toLocaleString()}
                      </span>
                    </div>
                  )}
                <div className="border-t border-gray-700 pt-2 flex justify-between">
                  <span className="text-gray-300 font-medium">
                    Balance returned
                  </span>
                  <span className="font-bold text-amber-400">
                    ${sessionSummary.balanceReturned.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              className="w-full bg-amber-600 hover:bg-amber-700"
              onClick={handleSessionSummaryClose}
            >
              Back to Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isRebuyModalOpen}
        onOpenChange={() => {}} // prevent closing by clicking outside
      >
        <DialogContent
          className="sm:max-w-md bg-gray-900 text-white border-gray-700"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-2xl text-center">
              You are out of chips!
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center py-6 space-y-6">
            <div className="relative flex items-center justify-center w-32 h-32">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-gray-700"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 56}
                  strokeDashoffset={2 * Math.PI * 56 * (1 - rebuyTimeLeft / 10)}
                  className="text-amber-500 transition-all duration-1000 ease-linear"
                />
              </svg>
              <div className="absolute flex items-center justify-center w-full h-full">
                <span className="text-3xl font-bold">{rebuyTimeLeft}</span>
              </div>
            </div>
            <p className="text-gray-400 text-center">
              Would you like to rebuy to continue playing or leave the table?
            </p>
          </div>

          <DialogFooter className="flex gap-2 sm:justify-between w-full">
            <Button
              variant="outline"
              className="w-1/2 border-red-700 text-red-500 hover:bg-red-900/20 hover:text-red-400"
              onClick={() => {
                submitRebuy(false);
                setIsRebuyModalOpen(false);
              }}
            >
              Leave Table
            </Button>
            <Button
              className="w-1/2 bg-amber-600 hover:bg-amber-700 text-white"
              onClick={() => {
                submitRebuy(true);
                setIsRebuyModalOpen(false);
              }}
            >
              Rebuy (Buy-in)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
