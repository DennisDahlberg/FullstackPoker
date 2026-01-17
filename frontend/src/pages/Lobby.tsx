import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { 
  Users, 
  Trophy, 
  Zap, 
  Check, 
  Play, 
  Coins,
  Cpu,
  ShieldCheck,
  Swords,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { BotProfile, TableConfig } from "@/types/Lobby";

const BOTS: BotProfile[] = [
  { id: "bot1", name: "Poker Pro", style: "Aggressive", skill: "Pro" },
  { id: "bot2", name: "Lucky Luke", style: "Loose Passive", skill: "Beginner" },
  { id: "bot3", name: "Bluff Master", style: "Deceptive", skill: "Intermediate" },
  { id: "bot4", name: "Check Raiser", style: "Tight Aggressive", skill: "Elite" },
  { id: "bot5", name: "Tight Passive", style: "Conservative", skill: "Beginner" },
  { id: "bot6", name: "Maniac Mark", style: "Wild", skill: "Intermediate" },
  { id: "bot7", name: "Fishy Fred", style: "Calling Station", skill: "Beginner" },
  { id: "bot8", name: "Math Whiz", style: "Analytical", skill: "Elite" },
  { id: "bot9", name: "Tilt Tom", style: "Emotional", skill: "Intermediate" },
  { id: "bot10", name: "Slow Play", style: "Tricky", skill: "Pro" },
];

const USER_BOTS: BotProfile[] = [
  { id: "userbot1", name: "My First Bot", style: "Balanced", skill: "Beginner" },
  { id: "userbot2", name: "Aggro Trainer", style: "Hyper Aggressive", skill: "Intermediate" },
  { id: "userbot3", name: "Nit Bot", style: "Rock", skill: "Pro" },
  { id: "userbot4", name: "GTO Widget", style: "Optimal", skill: "Elite" },
  { id: "userbot5", name: "Randomizer", style: "Unpredictable", skill: "Beginner" },
];

const TABLES: TableConfig[] = [
  {
    id: "table1",
    name: "Low Stakes",
    description: "Perfect for learning and casual play",
    buyIn: 100,
    smallBlind: 1,
    bigBlind: 2,
    difficulty: "Casual"
  },
  {
    id: "table2",
    name: "Mid Stakes",
    description: "Standard competitive play for grinders",
    buyIn: 250,
    smallBlind: 2,
    bigBlind: 5,
    difficulty: "Standard"
  },
  {
    id: "table3",
    name: "High Stakes",
    description: "High risk, high reward for experts",
    buyIn: 500,
    smallBlind: 5,
    bigBlind: 10,
    difficulty: "Hardcore"
  }
];

export default function Lobby() {
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [selectedBotIds, setSelectedBotIds] = useState<string[]>([]);
  const [activeBotTab, setActiveBotTab] = useState<"standard" | "custom">("standard");
  const [skillFilter, setSkillFilter] = useState<"All" | "Beginner" | "Intermediate" | "Pro" | "Elite">("All");

  const getAllowedSkills = (tableId: string | null) => {
    switch (tableId) {
      case "table3":
        return ["Pro", "Elite"];
      case "table2": 
        return ["Intermediate", "Pro", "Elite"];
      default: 
        return ["Beginner", "Intermediate", "Pro", "Elite"];
    }
  };

  const allowedSkills = getAllowedSkills(selectedTableId);

  useEffect(() => {
    const validSkills = getAllowedSkills(selectedTableId);
    
    setSelectedBotIds(prev => {
      const allBots = [...BOTS, ...USER_BOTS];
      return prev.filter(botId => {
        const bot = allBots.find(b => b.id === botId);
        return bot && validSkills.includes(bot.skill);
      });
    });

    if (skillFilter !== "All" && !validSkills.includes(skillFilter)) {
      setSkillFilter("All");
    }
  }, [selectedTableId]);

  const toggleBot = (botId: string) => {
    setSelectedBotIds(prev => {
      if (prev.includes(botId)) {
        return prev.filter(id => id !== botId);
      } else {
        if (prev.length >= 7) {
          toast.error("Table Full", {
            description: "You can only select up to 7 opponents."
          });
          return prev;
        }
        return [...prev, botId];
      }
    });
  };

  const handleStartGame = () => {
    if (!selectedTableId) {
      toast.error("No Table Selected", {
        description: "Please choose a table to start playing."
      });
      return;
    }
    if (selectedBotIds.length === 0) {
      toast.error("No Opponents", {
        description: "Please select at least one opponent."
      });
      return;
    }

    toast.success("Starting Game", {
      description: `Table: ${TABLES.find(t => t.id === selectedTableId)?.name} • Opponents: ${selectedBotIds.length}`
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      {/* Header Section */}
      <div className="flex flex-col gap-2 border-b border-gray-800 pb-6">
        <h1 className="text-4xl font-black tracking-tight text-white flex items-center gap-3">
          <Swords className="text-amber-500 w-10 h-10" />
          Single Player Lobby
        </h1>
        <p className="text-gray-400 text-lg">
          Configure your table and choose your opponents
        </p>
      </div>

      {/* Table Selection */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Coins className="text-amber-500 w-5 h-5" />
          Select Stakes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TABLES.map((table) => {
            const isSelected = selectedTableId === table.id;
            return (
              <div
                key={table.id}
                onClick={() => setSelectedTableId(table.id)}
                className={cn(
                  "relative cursor-pointer group rounded-xl border p-6 transition-all duration-300",
                  "hover:bg-gray-900/60 hover:shadow-lg hover:shadow-amber-900/5",
                  isSelected 
                    ? "bg-gray-900/80 border-amber-500/50 ring-1 ring-amber-500/50" 
                    : "bg-gray-900/20 border-gray-800 hover:border-gray-700"
                )}
              >
                {/* Selection Indicator */}
                <div className={cn(
                  "absolute top-4 right-4 w-5 h-5 rounded-full border flex items-center justify-center transition-colors",
                  isSelected
                    ? "bg-amber-500 border-amber-500 text-black"
                    : "border-gray-600 text-transparent"
                )}>
                  <Check className="w-3 h-3 font-bold" />
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                       {table.difficulty === "Casual" && <ShieldCheck className="w-4 h-4 text-green-500" />}
                       {table.difficulty === "Standard" && <Zap className="w-4 h-4 text-amber-500" />}
                       {table.difficulty === "Hardcore" && <Trophy className="w-4 h-4 text-red-500" />}
                       <span className={cn(
                         "text-xs font-bold uppercase tracking-wider",
                         table.difficulty === "Casual" ? "text-green-500" : 
                         table.difficulty === "Standard" ? "text-amber-500" : "text-red-500"
                       )}>
                         {table.difficulty}
                       </span>
                    </div>
                    <h3 className="text-2xl font-black text-white">{table.name}</h3>
                    <p className="text-gray-400 text-sm mt-1">{table.description}</p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-gray-800/50">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Buy-in</span>
                      <span className="text-white font-mono font-bold">${table.buyIn}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Blinds</span>
                      <span className="text-white font-mono font-bold">${table.smallBlind} / ${table.bigBlind}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Starting Chips</span>
                      <span className="text-amber-500 font-mono font-bold">{table.buyIn}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Opponent Selection */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Cpu className="text-amber-500 w-5 h-5" />
            Select Opponents
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

            <span className={cn(
              "text-sm font-bold px-3 py-1.5 rounded-full border",
              selectedBotIds.length === 7 
                ? "bg-red-500/10 border-red-500/20 text-red-500" 
                : "bg-gray-900 border-gray-800 text-gray-400"
            )}>
              {selectedBotIds.length} / 7
            </span>
          </div>
        </div>

        {/* Skill Filter */}
        <div className="flex flex-wrap gap-2">
          {(["All", "Beginner", "Intermediate", "Pro", "Elite"] as const).map((skill) => {
            const isAllowed = skill === "All" || allowedSkills.includes(skill);
            return (
              <button
                key={skill}
                onClick={() => setSkillFilter(skill)}
                disabled={!isAllowed}
                className={cn(
                  "text-xs px-3 py-1.5 rounded-full border transition-all font-medium",
                  !isAllowed && "opacity-30 cursor-not-allowed",
                  skillFilter === skill 
                    ? "bg-amber-500/10 border-amber-500 text-amber-500" 
                    : "bg-gray-900/50 border-gray-800 text-gray-400 hover:border-gray-700 hover:text-gray-300"
                )}
              >
                {skill}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {(activeBotTab === "standard" ? BOTS : USER_BOTS)
            .filter(bot => {
              const isAllowedByTable = allowedSkills.includes(bot.skill);
              const matchesFilter = skillFilter === "All" || bot.skill === skillFilter;
              return isAllowedByTable && matchesFilter;
            })
            .map((bot) => {
             const isSelected = selectedBotIds.includes(bot.id);
             return (
               <div
                  key={bot.id}
                  onClick={() => toggleBot(bot.id)}
                  className={cn(
                    "group relative flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-all",
                    "hover:bg-gray-900/60",
                    isSelected 
                      ? "bg-gray-900/80 border-amber-500/50" 
                      : "bg-gray-900/20 border-gray-800 hover:border-gray-700"
                  )}
               >
                 <div className="relative">
                    <Avatar className={cn(
                      "h-12 w-12 border-2 transition-colors",
                      isSelected ? "border-amber-500" : "border-gray-800 group-hover:border-gray-600"
                    )}>
                      <div className="flex h-full w-full items-center justify-center bg-gray-900 text-lg font-bold text-gray-200">
                         {bot.name[0]}
                      </div>
                    </Avatar>
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 bg-amber-500 text-black rounded-full p-0.5 shadow-sm">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                 </div>
                 
                 <div className="flex-1 min-w-0">
                    <h4 className={cn(
                      "font-bold truncate transition-colors",
                      isSelected ? "text-amber-500" : "text-gray-200"
                    )}>
                      {bot.name}
                    </h4>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-gray-500">{bot.style}</span>
                      <span className="text-gray-800">•</span>
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
          {activeBotTab === "custom" && USER_BOTS.length === 0 && (
            <p className="text-gray-500 text-md col-span-full text-center border border-dashed border-gray-700 rounded-lg p-6">
              You have no custom bots. Create one in the Bots page.
            </p>
          )}
        </div>
      </div>

      {/* Start Button */}
      <div className="fixed bottom-8 right-8 z-50 animate-in fade-in slide-in-from-bottom-4">
        <Button 
          size="lg" 
          onClick={handleStartGame}
          disabled={!selectedTableId || selectedBotIds.length === 0}
          className={cn(
            "h-14 px-8 rounded-full text-lg font-bold shadow-2xl transition-all",
            selectedTableId && selectedBotIds.length > 0
              ? "bg-amber-500 hover:bg-amber-400 text-black hover:scale-105 shadow-amber-900/50"
              : "bg-gray-800 text-gray-500 cursor-not-allowed"
          )}
        >
          <Play className="w-5 h-5 mr-2 fill-current" />
          Start Game
        </Button>
      </div>

       {/* Hint/Footer */}
      <div className="text-center text-sm text-gray-600 pt-8 pb-4">
        <p className="flex items-center justify-center gap-2">
             <AlertCircle className="w-3 h-3" />
             Select a table and at least one opponent to begin.
        </p>
      </div>

    </div>
  );
}
