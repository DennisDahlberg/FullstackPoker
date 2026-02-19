import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { 
  Trophy, 
  Zap, 
  Check, 
  ArrowRight, 
  Coins,
  ShieldCheck,
  Swords,
  AlertCircle,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { TableConfig } from "@/types/Lobby";

const difficultyStyle: Record<string, { icon: typeof ShieldCheck; color: string }> = {
  Casual: { icon: ShieldCheck, color: "text-green-500" },
  Standard: { icon: Zap, color: "text-amber-500" },
  Hardcore: { icon: Trophy, color: "text-red-500" },
};

export default function CreateLobby() {
  const [tables, setTables] = useState<TableConfig[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [isLoadingTables, setIsLoadingTables] = useState(true);

  const navigate = useNavigate();

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

  const handleContinue = () => {
    if (!selectedTableId) {
      toast.error("No Table Selected", {
        description: "Please choose a table to continue."
      });
      return;
    }
    navigate(`/lobby?tableId=${selectedTableId}`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      {/* Header Section */}
      <div className="flex flex-col gap-2 border-b border-gray-800 pb-6">
        <h1 className="text-4xl font-black tracking-tight text-white flex items-center gap-3">
          <Swords className="text-amber-500 w-10 h-10" />
          Create Lobby
        </h1>
        <p className="text-gray-400 text-lg">
          Choose your table to create a lobby
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

      {/* Continue Button */}
      <div className="fixed bottom-8 right-8 z-50 animate-in fade-in slide-in-from-bottom-4">
        <Button 
          size="lg" 
          onClick={handleContinue}
          disabled={!selectedTableId}
          className={cn(
            "h-14 px-8 rounded-full text-lg font-bold shadow-2xl transition-all",
            selectedTableId
              ? "bg-amber-500 hover:bg-amber-400 text-black hover:scale-105 shadow-amber-900/50"
              : "bg-gray-800 text-gray-500 cursor-not-allowed"
          )}
        >
          <ArrowRight className="w-5 h-5 mr-2" />
          Continue to Lobby
        </Button>
      </div>

       {/* Hint/Footer */}
      <div className="text-center text-sm text-gray-600 pt-8 pb-4">
        <p className="flex items-center justify-center gap-2">
             <AlertCircle className="w-3 h-3" />
             Select a table to create your lobby.
        </p>
      </div>

    </div>
  );
}
