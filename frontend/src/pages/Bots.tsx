import { useState, useMemo, useEffect } from "react";
import { Bot, Plus, Search, Pencil, Trash2, Cpu, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import type {
  BotEntry,
  BotTabId,
  SkillLevel,
  CreateBotDto,
  UpdateBotDto,
} from "@/types/Bot";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { set } from "date-fns";

const SKILL_LEVELS: SkillLevel[] = ["Beginner", "Intermediate", "Pro", "Elite"];

const skillStyle: Record<
  SkillLevel,
  { text: string; bg: string; border: string }
> = {
  Beginner: {
    text: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
  },
  Intermediate: {
    text: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  Pro: {
    text: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  Elite: {
    text: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
  },
};

const EMPTY_FORM: CreateBotDto = {
  username: "",
  description: "",
  playStyle: "",
  skillLevel: "Beginner",
};

function getInitials(username: string) {
  return username.slice(0, 2).toUpperCase();
}

export default function Bots() {
  const [bots, setBots] = useState<BotEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<BotTabId>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [skillFilter, setSkillFilter] = useState<SkillLevel | "All">("All");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBot, setEditingBot] = useState<BotEntry | null>(null);
  const [form, setForm] = useState<CreateBotDto | UpdateBotDto>(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<CreateBotDto>>({});

  const [deletingBot, setDeletingBot] = useState<BotEntry | null>(null);

  const myBotsCount = bots.filter((b) => b.isUserCreated).length;

  const displayBots = useMemo(() => {
    return bots.filter((b) => {
      if (activeTab === "mine" && !b.isUserCreated) return false;
      if (skillFilter !== "All" && b.skillLevel !== skillFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !b.username.toLowerCase().includes(q) &&
          !b.playStyle.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [bots, activeTab, skillFilter, searchQuery]);

  useEffect(() => {
    api.bots
      .getBotProfiles()
      .then(setBots)
      .catch(() => toast.error("Failed to load bots"))
      .finally(() => setLoading(false));
  }, []);

  function openCreateDialog() {
    setEditingBot(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setDialogOpen(true);
  }

  function openEditDialog(bot: BotEntry) {
    setEditingBot(bot);
    setForm({
      id: bot.id,
      username: bot.username,
      description: bot.description,
      playStyle: bot.playStyle,
      skillLevel: bot.skillLevel,
    });
    setFormErrors({});
    setDialogOpen(true);
  }

  function validateForm(): boolean {
    const errors: Partial<typeof EMPTY_FORM> = {};
    if (form.username.length < 3 || form.username.length > 20)
      errors.username = "Username must be 3–20 characters";
    if (form.description.length < 5 || form.description.length > 50)
      errors.description = "Description must be 5–50 characters";
    if (form.playStyle.length < 3 || form.playStyle.length > 15)
      errors.playStyle = "Play style must be 3–15 characters";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSaveBot() {
    if (formLoading) return;
    if (!validateForm()) return;
    setFormLoading(true);
    try {
      if (editingBot) {
        await api.bots.updateBot(form as UpdateBotDto);
        await api.bots.getBotProfiles().then(setBots);
        toast.success("Bot updated", {
          description: `${form.username} has been updated.`,
        });
      } else {
        await api.bots.createBot(form);
        await api.bots.getBotProfiles().then(setBots);
        toast.success("Bot created", {
          description: `${form.username} has been added to your bots.`,
        });
      }
      setDialogOpen(false);
      setFormLoading(false);
    } catch (err: any) {
      setFormLoading(false);
      if (Array.isArray(err)) {
        console.log("Validation errors:", err);
        const mapped: Partial<CreateBotDto> = {};
        for (const error of err) {
          const key =
            error.propertyName.charAt(0).toLowerCase() +
            error.propertyName.slice(1);
          if (!mapped[key as keyof CreateBotDto]) {
            mapped[key as keyof CreateBotDto] = error.errorMessage;
          }
        }
        setFormErrors(mapped);
      } else {
        toast.error("Failed to save bot", { description: err?.message });
        console.log(err);
      }
    }
  }

  async function handleDeleteBot() {
    if (!deletingBot) return;
    try {
      await api.bots.deleteBot(deletingBot.id);
      const updated = bots.filter((b) => b.id !== deletingBot.id);
      setBots(updated);
      toast.success("Bot deleted", {
        description: `${deletingBot.username} has been removed from your bots.`,
      });
    } catch (err: any) {
      toast.error("Failed to delete bot", { description: err?.message });
      console.log(err);
    }
    setDeletingBot(null);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <Bot className="text-amber-500 w-8 h-8" />
            Bots
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Browse AI opponents or create your own custom bots
          </p>
        </div>
        <Button
          onClick={openCreateDialog}
          className="bg-amber-600 hover:bg-amber-700 text-white font-bold gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Bot
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-900/60 border border-gray-800 rounded-xl w-fit">
        {(["all", "mine"] as BotTabId[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-5 py-2 rounded-lg text-sm font-semibold transition-all",
              activeTab === tab
                ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                : "text-gray-400 hover:text-gray-100",
            )}
          >
            {tab === "all" ? "All Bots" : "My Bots"}
            {tab === "mine" && myBotsCount > 0 && (
              <span className="ml-2 bg-amber-500/20 text-amber-400 text-xs px-1.5 py-0.5 rounded-full">
                {myBotsCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            placeholder="Search by name or style..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-gray-900/40 border-gray-800 text-gray-100 placeholder:text-gray-600 focus-visible:ring-amber-500/30"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["All", ...SKILL_LEVELS] as const).map((level) => (
            <button
              key={level}
              onClick={() => setSkillFilter(level)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all",
                skillFilter === level
                  ? level === "All"
                    ? "bg-gray-700 text-white border-gray-600"
                    : cn(
                        skillStyle[level].bg,
                        skillStyle[level].text,
                        skillStyle[level].border,
                      )
                  : "bg-transparent text-gray-500 border-gray-800 hover:border-gray-600 hover:text-gray-300",
              )}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Bots Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-gray-800 p-5 bg-gray-900/40 space-y-3"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-xl bg-gray-800" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28 rounded bg-gray-800" />
                  <Skeleton className="h-3 w-16 rounded-full bg-gray-800" />
                </div>
              </div>
              <Skeleton className="h-3 w-full rounded bg-gray-800" />
              <Skeleton className="h-3 w-3/4 rounded bg-gray-800" />
              <div className="pt-2 border-t border-gray-800/60 flex justify-between">
                <Skeleton className="h-3 w-24 rounded bg-gray-800" />
                <Skeleton className="h-3 w-12 rounded bg-gray-800" />
              </div>
            </div>
          ))}
        </div>
      ) : displayBots.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Cpu className="w-12 h-12 text-gray-700 mb-4" />
          <p className="text-gray-500 font-medium">No bots found</p>
          <p className="text-gray-600 text-sm mt-1">
            {activeTab === "mine"
              ? "Create your first custom bot to get started."
              : "Try adjusting your filters."}
          </p>
          {activeTab === "mine" && (
            <Button
              onClick={openCreateDialog}
              className="mt-4 bg-amber-600 hover:bg-amber-700 text-white gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Bot
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayBots.map((bot) => {
            const style = skillStyle[bot.skillLevel];
            return (
              <div
                key={bot.id}
                className="relative group rounded-xl border border-gray-800 hover:border-gray-700 p-5 bg-gray-900/40 hover:bg-gray-900/70 transition-all"
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0",
                        style.bg,
                        style.text,
                      )}
                    >
                      {getInitials(bot.username)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-white truncate">
                        {bot.username}
                      </p>
                      <span
                        className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded-full border mt-0.5 inline-block",
                          style.bg,
                          style.text,
                          style.border,
                        )}
                      >
                        {bot.skillLevel}
                      </span>
                    </div>
                  </div>
                  {bot.isUserCreated && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={() => openEditDialog(bot)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-amber-400 hover:bg-amber-500/10 transition-all"
                        title="Edit bot"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingBot(bot)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        title="Delete bot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-gray-400 text-sm mt-3 leading-relaxed line-clamp-2">
                  {bot.description}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-800/60">
                  <span className="text-xs text-gray-600 font-medium">
                    Style:{" "}
                    <span className="text-gray-400">{bot.playStyle}</span>
                  </span>
                  {bot.isUserCreated ? (
                    <span className="text-xs text-amber-500/70 font-medium">
                      Custom
                    </span>
                  ) : (
                    <span className="text-xs text-gray-600 font-medium">
                      System
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {displayBots.length > 0 && (
        <p className="text-center text-xs text-gray-600">
          Showing {displayBots.length} bot{displayBots.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-gray-950 border-gray-800 text-gray-100 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Bot className="w-5 h-5 text-amber-500" />
              {editingBot ? "Edit Bot" : "Create Bot"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-300">
                Username
              </label>
              <Input
                value={form.username}
                onChange={(e) =>
                  setForm((f) => ({ ...f, username: e.target.value }))
                }
                placeholder="e.g. BluffMaster"
                maxLength={20}
                className="bg-gray-900/60 border-gray-700 text-gray-100 placeholder:text-gray-600 focus-visible:ring-amber-500/30"
              />
              {formErrors.username && (
                <p className="text-xs text-red-400">{formErrors.username}</p>
              )}
              <p className="text-xs text-gray-600">{form.username.length}/20</p>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-300">
                Description
              </label>
              <Input
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="e.g. Expert at bluffing opponents"
                maxLength={50}
                className="bg-gray-900/60 border-gray-700 text-gray-100 placeholder:text-gray-600 focus-visible:ring-amber-500/30"
              />
              {formErrors.description && (
                <p className="text-xs text-red-400">{formErrors.description}</p>
              )}
              <p className="text-xs text-gray-600">
                {form.description.length}/50
              </p>
            </div>

            {/* Play Style */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-300">
                Play Style
              </label>
              <Input
                value={form.playStyle}
                onChange={(e) =>
                  setForm((f) => ({ ...f, playStyle: e.target.value }))
                }
                placeholder="e.g. Aggressive, Bluffer, Passive"
                maxLength={15}
                className="bg-gray-900/60 border-gray-700 text-gray-100 placeholder:text-gray-600 focus-visible:ring-amber-500/30"
              />
              {formErrors.playStyle && (
                <p className="text-xs text-red-400">{formErrors.playStyle}</p>
              )}
              <p className="text-xs text-gray-600">
                {form.playStyle.length}/15
              </p>
            </div>

            {/* Skill Level */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-300">
                Skill Level
              </label>
              <div className="grid grid-cols-2 gap-2">
                {SKILL_LEVELS.map((level) => {
                  const style = skillStyle[level];
                  const isSelected = form.skillLevel === level;
                  return (
                    <button
                      key={level}
                      onClick={() =>
                        setForm((f) => ({ ...f, skillLevel: level }))
                      }
                      className={cn(
                        "px-3 py-2 rounded-lg text-sm font-semibold border transition-all",
                        isSelected
                          ? cn(style.bg, style.text, style.border)
                          : "bg-gray-900/40 text-gray-500 border-gray-800 hover:border-gray-600 hover:text-gray-300",
                      )}
                    >
                      {level}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setDialogOpen(false)}
              className="text-gray-400 hover:text-white hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveBot}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold flex gap-2 items-center"
              disabled={formLoading}
            >
              {formLoading && <Loader2 className="animate-spin" size={18} />}
              {editingBot ? "Update Bot" : "Create Bot"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingBot}
        onOpenChange={(open) => !open && setDeletingBot(null)}
      >
        <AlertDialogContent className="bg-gray-950 border-gray-800 text-gray-100">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Delete Bot
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete{" "}
              <span className="text-white font-semibold">
                {deletingBot?.username}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBot}
              className="bg-red-600 hover:bg-red-700 text-white font-bold"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
