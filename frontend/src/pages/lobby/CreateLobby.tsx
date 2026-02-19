import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
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
  AlertCircle,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { BotProfile, TableConfig } from "@/types/Lobby";

const difficultyStyle: Record<string, { icon: typeof ShieldCheck; color: string }> = {
  Casual: { icon: ShieldCheck, color: "text-green-500" },
  Standard: { icon: Zap, color: "text-amber-500" },
  Hardcore: { icon: Trophy, color: "text-red-500" },
};

export default function CreateLobby() {
  const [tables, setTables] = useState<TableConfig[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [selectedBotIds, setSelectedBotIds] = useState<string[]>([]);
  const [activeBotTab, setActiveBotTab] = useState<"standard" | "custom">("standard");
  const [skillFilter, setSkillFilter] = useState<"All" | "Beginner" | "Intermediate" | "Pro" | "Elite">("All");
  const [bots, setBots] = useState<BotProfile[]>([]);
  const [isLoadingTables, setIsLoadingTables] = useState(true);

  const navigate = useNavigate();

  const standardBots = bots.filter(b => !b.isUserCreated);
  const userBots = bots.filter(b => b.isUserCreated);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        setIsLoadingTables(true);
        const data = await api.tableConfigs.getTableConfigs();
        const mappedTables: TableConfig[] = data.map((t: any) => ({
          id: String(t.id),
          name: t.name,
          description: t.description,
          buyIn: t.buyIn,
          smallBlind: t.smallBlind,
          bigBlind: t.bigBlind,
          difficulty: t.difficulty
        }));
        setTables(mappedTables);
        setIsLoadingTables(false);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch table configurations");
      }
    };
    fetchTables();
  }, []);

  useEffect(() => {
    const fetchBots = async () => {
      try {
        const data = await api.bots.getBotProfiles();
        const mappedBots = data.map((b: any) => ({
          id: b.id,
          name: b.username,
          style: b.playStyle,
          skill: b.skillLevel || "Beginner",
          image: b.profileImageUrl,
          isUserCreated: b.isUserCreated
        }));
        setBots(mappedBots);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch bots");
      }
    };
    fetchBots();
  }, []);

  const getAllowedSkills = (tableId: string | null) => {
    const table = tables.find(t => t.id === tableId);
    if (!table) return ["Beginner", "Intermediate", "Pro", "Elite"];
    
    switch (table.difficulty) {
      case "Hardcore":
        return ["Pro", "Elite"];
      case "Standard": 
        return ["Intermediate", "Pro", "Elite"];
      default: 
        return ["Beginner", "Intermediate", "Pro", "Elite"];
    }
  };

  const allowedSkills = getAllowedSkills(selectedTableId);

  useEffect(() => {
    const validSkills = getAllowedSkills(selectedTableId);
    
    setSelectedBotIds(prev => {
      return prev.filter(botId => {
        const bot = bots.find(b => b.id === botId);
        return bot && validSkills.includes(bot.skill);
      });
    });

    if (skillFilter !== "All" && !validSkills.includes(skillFilter)) {
      setSkillFilter("All");
    }
  }, [selectedTableId, bots]);

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

  const handleStartGame = async () => {
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

    try {
      await api.game.initializeGame(Number(selectedTableId), selectedBotIds.map(id => Number(id)));
      toast.success("Starting Game", {
        description: `Table: ${tables.find(t => t.id === selectedTableId)?.name} • Opponents: ${selectedBotIds.length}`
      });
      navigate("/game");
    } catch (err) {
      console.error(err);
      toast.error(String(err) || "Failed to start game");
    }
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
        {isLoadingTables ? (
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tables.map((table) => {
            const isSelected = selectedTableId === table.id;
            const style = difficultyStyle[table.difficulty] ?? difficultyStyle["Standard"];
            const IconComponent = style.icon;
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
                       <IconComponent className={cn("w-4 h-4", style.color)} />
                       <span className={cn(
                         "text-xs font-bold uppercase tracking-wider",
                         style.color
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
        )}

        
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
          {(activeBotTab === "standard" ? standardBots : userBots)
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
          {activeBotTab === "custom" && userBots.length === 0 && (
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
