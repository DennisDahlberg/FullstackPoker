import { useNavigate } from "react-router-dom";
import PlayerSeat from "@/components/PlayerSeat";
import { useAuthContext } from "@/context/AuthContext";
import { SessionSummaryModal } from "@/components/game/SessionSummaryModal";
import { getDynamicOffsets } from "@/lib/dealOffsets";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, LogOut, Settings } from "lucide-react";
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
  const { refetch } = useAuthContext();
  const navigate = useNavigate();
  const game = useGameStore((s) => s.game);
  const error = useGameStore((s) => s.error);
  const sessionSummary = useGameStore((s) => s.sessionSummary);
  const connectToGame = useGameStore((s) => s.connectToGame);
  const disconnectFromGame = useGameStore((s) => s.disconnectFromGame);
  const playerAction = useGameStore((s) => s.playerAction);
  const submitRebuy = useGameStore((s) => s.submitRebuy);
  const submitReady = useGameStore((s) => s.submitReady);
  const leaveGame = useGameStore((s) => s.leaveGame);
  const clearError = useGameStore((s) => s.clearError);
  const clearSessionSummary = useGameStore((s) => s.clearSessionSummary);
  const [isRebuyModalOpen, setIsRebuyModalOpen] = useState(false);

  const [raiseValue, setRaiseValue] = useState(0);
  const [isRaiseModalOpen, setIsRaiseModalOpen] = useState(false);
  const [isLeaveWarningOpen, setIsLeaveWarningOpen] = useState(false);
  const [rebuyTimeLeft, setRebuyTimeLeft] = useState(10);
  const minRaise = game ? game.smallBlind : 0;
  const [turnTimeLeft, setTurnTimeLeft] = useState<number | null>(null);

  const [readyTimeLeft, setReadyTimeLeft] = useState(20);
  const [hasSubmittedReady, setHasSubmittedReady] = useState(false);
  const hasSubmittedReadyRef = useRef(false);

  const prevIsGameOverRef = useRef(false);
  const [roundKey, setRoundKey] = useState(0);

  const prevCommunityCardCountRef = useRef(0);
  const visibleCommunityCards =
    game?.communityCards.filter((c) => !c.isHidden) || [];

  const myUserId = game?.currentViewerUserId;
  const player = game?.players.find((p) => p.userId === myUserId);
  const myPlayerIndex = game?.players.findIndex((p) => p.userId === myUserId);
  const isMyTurn = myPlayerIndex === game?.currentPlayerIndex;

  useEffect(() => {
    if (!game?.isGameOver) {
      hasSubmittedReadyRef.current = false;
      setHasSubmittedReady(false);
      setReadyTimeLeft(20);
      return;
    }
    hasSubmittedReadyRef.current = false;
    setHasSubmittedReady(false);
    setReadyTimeLeft(20);

    const timer = setInterval(() => {
      setReadyTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (!hasSubmittedReadyRef.current) {
            leaveGame();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 2000);
    return () => clearInterval(timer);
  }, [game?.isGameOver, leaveGame]);

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
    if (!game || !isMyTurn || game?.isGameOver) {
      setTurnTimeLeft(null);
      return;
    }
    const deadline = new Date(game!.turnStartedAt).getTime() + 15_000;
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setTurnTimeLeft(remaining);
      if (remaining === 0) clearInterval(id);
    };
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [game?.turnStartedAt, isMyTurn, game?.isGameOver]);

  useEffect(() => {
    if (prevIsGameOverRef.current === true && game?.isGameOver === false) {
      setRoundKey((k) => k + 1);
      prevCommunityCardCountRef.current = 0;
    }
    prevIsGameOverRef.current = game?.isGameOver ?? false;
  }, [game?.isGameOver]);

  useEffect(() => {
    prevCommunityCardCountRef.current = visibleCommunityCards.length;
  }, [visibleCommunityCards.length]);

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

  const getCallAmount = () => {
    if (!game || !player) return 0;
    return game.highestBet - (player.currentBet || 0);
  };

  const handlePlayAnotherRound = async () => {
    hasSubmittedReadyRef.current = true;
    setHasSubmittedReady(true);
    await submitReady();
  };

  const getDealDelays = (playerIndex: number): [number, number] => {
    if (!game) return [0, 0];
    const count = game.players.length;
    const dealOrder = (playerIndex - game.dealerPosition - 1 + count) % count;
    const perCard = 0.15;
    return [dealOrder * perCard, (count + dealOrder) * perCard];
  };

  const getButtonConfig = (action: string) => {
    switch (action) {
      case "fold":
        return {
          label: "Fold",
          className:
            "w-20 sm:w-24 h-10 sm:h-12 text-xs sm:text-sm bg-red-900/30 border-red-700 text-red-400 hover:bg-red-900/50 hover:text-red-300",
          onClick: () => playerAction("fold"),
        };
      case "check":
        return {
          label: "Check",
          className:
            "w-20 sm:w-24 h-10 sm:h-12 text-xs sm:text-sm bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white",
          onClick: () => playerAction("check"),
        };
      case "call":
        return {
          label: `Call ($${getCallAmount()})`,
          className:
            "w-20 sm:w-24 h-10 sm:h-12 text-xs sm:text-sm bg-blue-800/30 border-blue-700 text-blue-400 hover:bg-blue-800/50 hover:text-blue-300",
          onClick: () => playerAction("call"),
        };
      case "raise":
        return {
          label: "Raise",
          className:
            "w-20 sm:w-24 h-10 sm:h-12 text-xs sm:text-sm bg-green-800/30 border-green-700 text-green-400 hover:bg-green-800/50 hover:text-green-300",
          onClick: () => {
            setRaiseValue(minRaise);
            setIsRaiseModalOpen(true);
          },
        };
      case "all-in":
        return {
          label: "All In",
          className:
            "w-20 sm:w-24 h-10 sm:h-12 text-xs sm:text-sm bg-purple-800/30 border-purple-700 text-purple-400 hover:bg-purple-800/50 hover:text-purple-300",
          onClick: () => playerAction("all-in"),
        };
    }
  };

  if (!game && !sessionSummary) {
    return (
      <div className="fixed inset-0 bg-gray-950 flex flex-col items-center justify-center gap-3 sm:gap-4 z-50 px-4">
        <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin text-amber-500" />
        <p className="text-gray-400 text-base sm:text-lg font-medium animate-pulse">
          Loading game...
        </p>
      </div>
    );
  }

  const activeDealerIndex = game?.players.findIndex((p) => p.isDealer) ?? 0;
  const hasPenalty = game ? !game.isGameOver && game.penaltyAmount > 0 : false;

  return (
    <div className="fixed inset-0 bg-gray-950 flex flex-col">
      {/* Header */}
      <div className="h-12 sm:h-14 bg-gray-900/80 border-b border-gray-800 flex items-center justify-between px-2 sm:px-4">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
          {game?.isGameOver && (
            <span className="text-amber-400 font-semibold truncate max-w-[180px] sm:max-w-none">
              🏆{" "}
              {game.winnersPositions
                .map((pos) => game.players[pos].name)
                .join(", ")}{" "}
              won!
            </span>
          )}
          {isMyTurn && !game?.isGameOver && (
            <span className="text-amber-500 font-bold animate-pulse">
              Your turn
            </span>
          )}
          {!isMyTurn && !game?.isGameOver && (
            <span className="truncate max-w-[180px] sm:max-w-none">
              Waiting for {game?.players[game.currentPlayerIndex]?.name}...
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white h-8 w-8 sm:h-10 sm:w-10"
          >
            <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-red-400 hover:text-red-300 hover:bg-red-900/20 h-8 w-8 sm:h-10 sm:w-10"
            onClick={handleLeaveClick}
          >
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Poker Table */}
        <div className="absolute inset-6 inset-y-8 sm:inset-8 md:inset-12 lg:inset-16 xl:inset-24 max-w-5xl mx-auto">
          {/* Table Surface */}
          <div className="absolute inset-0 bg-linear-to-b from-green-800 to-green-900 rounded-[50%] border-4 sm:border-6 md:border-8 border-amber-900 shadow-2xl">
            {/* Table felt texture overlay */}
            <div className="absolute inset-0 rounded-[50%] opacity-30 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.3)_100%)]" />

            {/* Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 mt-12 sm:mt-0 sm:gap-3 md:gap-4">
              {/* Pot */}
              <div className="bg-black/40 px-2 py-1 sm:px-4 md:px-6 sm:py-1.5 md:py-2 rounded-full">
                <motion.span
                  key={game?.pot}
                  initial={{ scale: 1.25 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.25 }}
                  className="text-amber-400 font-bold text-xs sm:text-base md:text-lg lg:text-xl"
                >
                  <span className="hidden sm:inline">Pot: </span>$
                  {game?.pot.toLocaleString()}
                </motion.span>
              </div>

              {/* Community Cards */}
              <div className="flex gap-1 sm:gap-2 md:gap-3">
                {visibleCommunityCards.map((card, index) => {
                  const prevCount = prevCommunityCardCountRef.current;
                  const isNew = index >= prevCount;

                  const offsets = getDynamicOffsets();
                  const [rawX, rawY] = offsets[activeDealerIndex] ?? [0, -220];

                  return (
                    <PlayingCard
                      key={`comm-${roundKey}-${index}`}
                      value={`${card.rank}${card.suit}`}
                      hidden={false}
                      dealDelay={isNew ? (index - prevCount) * 0.15 : 0}
                      initialOffsetX={isNew ? -rawX : 0}
                      initialOffsetY={isNew ? -rawY : 0}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Player Seats */}
          {game?.players.map((p, index) => {
            const [card1Delay, card2Delay] = getDealDelays(index);
            return (
              <PlayerSeat
                key={index}
                position={index}
                player={p}
                isCurrentPlayer={index === game?.currentPlayerIndex}
                isWinner={game?.winnersPositions.includes(index)}
                isGameOver={game?.isGameOver}
                card1DealDelay={card1Delay}
                card2DealDelay={card2Delay}
                roundKey={roundKey}
                dealerPosition={game.dealerPosition}
              />
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="h-20 sm:h-24 bg-gray-900 border-t border-gray-800 p-3 sm:p-4 md:p-6">
        <div className="max-w-2xl mx-auto flex flex-col md:flex-row items-center justify-center gap-2 sm:gap-3 md:gap-4 h-full">
          {game?.isGameOver ? (
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:gap-4">
              <div className="relative flex items-center justify-center w-10 h-10 shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="20"
                    cy="20"
                    r="16"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="transparent"
                    className="text-gray-700"
                  />
                  <circle
                    cx="20"
                    cy="20"
                    r="16"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 16}
                    strokeDashoffset={
                      2 * Math.PI * 16 * (1 - readyTimeLeft / 20)
                    }
                    className="text-green-500 transition-all duration-1000 ease-linear"
                  />
                </svg>
                <span className="absolute text-xs font-bold">
                  {readyTimeLeft}
                </span>
              </div>
              {hasSubmittedReady ? (
                <span className="text-green-400 font-semibold text-xs sm:text-sm">
                  You're ready!
                </span>
              ) : (
                <Button
                  onClick={handlePlayAnotherRound}
                  className="bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm px-3 sm:px-4 h-9 sm:h-10"
                >
                  Play Another Round
                </Button>
              )}
              <Button
                variant="outline"
                className="border-red-700 text-red-400 hover:bg-red-900/20 hover:text-red-300 text-xs sm:text-sm px-3 sm:px-4 h-9 sm:h-10"
                onClick={handleLeaveClick}
              >
                Leave
              </Button>
              <span className="text-gray-500 text-xs sm:text-sm">
                {game.readyPlayerIds.length} /{" "}
                {game.players.filter((p) => p.isPlayer && p.userId).length}{" "}
                ready
              </span>
            </div>
          ) : isMyTurn && (game?.availableActions.length ?? 0) > 0 ? (
            <AnimatePresence mode="wait">
              {isMyTurn && (game?.availableActions.length ?? 0) > 0 ? (
                <motion.div
                  key="actions"
                  className="flex flex-wrap items-center justify-center gap-2 sm:gap-3"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                  transition={{ duration: 0.2 }}
                >
                  {game?.availableActions.map((action, i) => {
                    const buttonConfig = getButtonConfig(action);
                    return (
                      <motion.div
                        key={action}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                      >
                        <Button
                          variant="outline"
                          className={buttonConfig?.className}
                          onClick={buttonConfig?.onClick}
                        >
                          {buttonConfig?.label}
                        </Button>
                      </motion.div>
                    );
                  })}
                  {isMyTurn && turnTimeLeft !== null && (
                    <span
                      className={`text-sm font-mono ${turnTimeLeft <= 5 ? "text-red-400 animate-pulse" : "text-gray-400"}`}
                    >
                      {turnTimeLeft}s
                    </span>
                  )}
                </motion.div>
              ) : (
                <motion.p
                  key="waiting"
                  className="text-gray-500 text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  Waiting for {game?.players[game?.currentPlayerIndex]?.name}...
                </motion.p>
              )}
            </AnimatePresence>
          ) : (
            <p className="text-gray-500 text-sm">
              Waiting for {game?.players[game?.currentPlayerIndex]?.name}...
            </p>
          )}
        </div>
      </div>
      <Dialog open={isRaiseModalOpen} onOpenChange={setIsRaiseModalOpen}>
        <DialogContent className="sm:max-w-md w-[90vw] sm:w-full bg-gray-900 text-white border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">
              Place your raise
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 sm:gap-6 py-3 sm:py-4">
            <div className="relative flex items-center justify-center gap-2">
              <span className="text-xl sm:text-2xl font-bold text-green-400 absolute left-2 sm:left-4">
                $
              </span>
              <Input
                type="number"
                value={raiseValue}
                max={player?.chips ?? 0}
                min={minRaise}
                step={5}
                onChange={(e) => setRaiseValue(Number(e.target.value))}
                className="text-2xl sm:text-3xl h-14 sm:h-16 text-center font-mono bg-black/20"
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

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Button
                variant="outline"
                className="text-xs sm:text-sm h-9 sm:h-10"
                onClick={() =>
                  setRaiseValue(Math.floor((player?.chips ?? 0) / 4))
                }
              >
                1/4 Pot
              </Button>
              <Button
                variant="outline"
                className="text-xs sm:text-sm h-9 sm:h-10"
                onClick={() =>
                  setRaiseValue(Math.floor((player?.chips ?? 0) / 2))
                }
              >
                1/2 Pot
              </Button>
              <Button
                variant="outline"
                className="text-xs sm:text-sm h-9 sm:h-10"
                onClick={() =>
                  setRaiseValue(Math.floor(((player?.chips ?? 0) * 3) / 4))
                }
              >
                3/4 Pot
              </Button>
              <Button
                variant="outline"
                className="border-purple-500 text-xs sm:text-sm h-9 sm:h-10"
                onClick={() => setRaiseValue(player?.chips ?? 0)}
              >
                All-In
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-sm sm:text-base h-10 sm:h-11"
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
        <AlertDialogContent className="w-[90vw] sm:w-full max-w-lg bg-gray-900 text-white border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle
              className={`text-lg sm:text-xl ${hasPenalty ? "text-red-400" : "text-yellow-400"}`}
            >
              {hasPenalty ? "Leave Game Early?" : "Leave Game?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300 space-y-3 text-sm sm:text-base">
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
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="bg-gray-800 hover:bg-gray-700 w-full sm:w-auto text-sm sm:text-base h-10 sm:h-11">
              {hasPenalty ? "Stay in Game" : "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmLeave}
              className={
                hasPenalty
                  ? "bg-red-600 hover:bg-red-700 w-full sm:w-auto text-sm sm:text-base h-10 sm:h-11"
                  : "bg-blue-600 hover:bg-blue-700 w-full sm:w-auto text-sm sm:text-base h-10 sm:h-11"
              }
            >
              Leave Game
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Session Summary Dialog */}
      <SessionSummaryModal
        isOpen={!!sessionSummary}
        onClose={() => (
          navigate("/dashboard"),
          clearSessionSummary(),
          refetch()
        )}
        sessionSummary={sessionSummary}
      />

      <Dialog open={isRebuyModalOpen} onOpenChange={() => {}}>
        <DialogContent
          className="w-[90vw] sm:w-full sm:max-w-md bg-gray-900 text-white border-gray-700"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl text-center">
              You are out of chips!
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center py-4 sm:py-6 space-y-4 sm:space-y-6">
            <div className="relative flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="44"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="transparent"
                  className="text-gray-700"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r="44"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 44}
                  strokeDashoffset={2 * Math.PI * 44 * (1 - rebuyTimeLeft / 10)}
                  className="text-amber-500 transition-all duration-1000 ease-linear"
                />
              </svg>
              <div className="absolute flex items-center justify-center w-full h-full">
                <span className="text-2xl sm:text-3xl font-bold">
                  {rebuyTimeLeft}
                </span>
              </div>
            </div>
            <p className="text-gray-400 text-center text-sm sm:text-base px-4">
              Would you like to rebuy to continue playing or leave the table?
            </p>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between w-full">
            <Button
              variant="outline"
              className="w-full sm:w-1/2 border-red-700 text-red-500 hover:bg-red-900/20 hover:text-red-400 text-sm sm:text-base h-10 sm:h-11"
              onClick={() => {
                submitRebuy(false);
                setIsRebuyModalOpen(false);
              }}
            >
              Leave Table
            </Button>
            <Button
              className="w-full sm:w-1/2 bg-amber-600 hover:bg-amber-700 text-white text-sm sm:text-base h-10 sm:h-11"
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
