import { useState } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Settings,
  LogOut,
  Coins,
  PanelLeft,
  User,
  ChevronsUpDown,
  CirclePlay,
  UserRound,
  ChartColumn,
  Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "./ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export default function SidebarLayout() {
  const [isOpen, setIsOpen] = useState(window.innerWidth >= 768);
  const { data, loading, logout } = useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: CirclePlay, label: "Game", href: "/lobby" },
    { icon: Bot, label: "Bots", href: "/bots" },
    { icon: UserRound, label: "Friends", href: "/friends" },
    { icon: ChartColumn, label: "Statistics", href: "/statistics" },
  ];

  function handleLogOut() {
    logout();
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 relative">
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-50
        w-64 bg-gray-950 border-r border-gray-800
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        flex flex-col
      `}
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-gray-800">
          <div className="flex items-center gap-2 text-amber-500 font-bold text-xl">
            <Coins className="w-6 h-6" />
            <span>PokerAI</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => {
                  if (window.innerWidth < 768) setIsOpen(false);
                }}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                  ${
                    isActive
                      ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                      : "hover:bg-gray-900 text-gray-400 hover:text-gray-100"
                  }
                `}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer / User Profile */}
        <div className="p-4">
          {loading ? (
            <div className="flex items-center gap-3 px-2 py-2">
              <Skeleton className="h-8 w-8 rounded-lg bg-gray-800" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-24 bg-gray-800" />
                <Skeleton className="h-2 w-16 bg-gray-800" />
              </div>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full h-auto py-3 px-2 flex items-center justify-between hover:bg-gray-900 text-gray-300 hover:text-white"
                >
                  <div className="flex items-center gap-3 text-left">
                    <Avatar className="h-8 w-8 rounded-lg border border-gray-700">
                      <AvatarImage src="" alt="User" />
                      <AvatarFallback className="rounded-lg bg-gray-800 text-gray-300">
                        CN
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {data?.user?.name || "Player One"}
                      </span>
                      <span
                        className={cn(
                          "truncate text-xs text-gray-500",
                          data?.user?.rank === "Beginner" && "text-gray-400",
                          data?.user?.rank === "Amateur" && "text-green-500",
                          data?.user?.rank === "Intermediate" &&
                            "text-emerald-400",
                          data?.user?.rank === "Advanced" && "text-teal-400",
                          data?.user?.rank === "Veteran" && "text-cyan-400",
                          data?.user?.rank === "Expert" && "text-blue-500",
                          data?.user?.rank === "Pro" && "text-indigo-400",
                          data?.user?.rank === "Master" && "text-purple-500",
                          data?.user?.rank === "Elite" && "text-red-500",
                          data?.user?.rank === "Legend" && "text-amber-400",
                        )}
                      >
                        {data?.user?.rank}
                      </span>
                      <span className="truncate text-xs text-amber-400 flex items-center gap-1">
                        <Coins className="w-3 h-3" />
                        {data?.user?.balance?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 min-w-56 rounded-lg bg-gray-950 border-gray-800 text-gray-200"
                side="right"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg border border-gray-700">
                      <AvatarImage src="" alt="User" />
                      <AvatarFallback className="rounded-lg bg-gray-800 text-gray-300">
                        CN
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {data?.user?.name}
                      </span>
                      <span className="truncate text-xs text-gray-500">
                        {data?.user?.email}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-800" />
                <DropdownMenuItem
                  className="focus:bg-gray-900 focus:text-white cursor-pointer"
                  onClick={() => navigate("/profile")}
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="focus:bg-gray-900 focus:text-white cursor-pointer"
                  onClick={() => navigate("/settings")}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-800" />
                <DropdownMenuItem
                  className="text-red-400 focus:text-red-300 focus:bg-red-900/20 cursor-pointer"
                  onClick={handleLogOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </aside>

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
            fixed z-[51] top-4 p-2 
            bg-gray-950 text-gray-400 hover:text-white hover:bg-gray-900
            rounded-md shadow-md
            transition-all duration-300 ease-in-out
            ${isOpen ? "left-[264px]" : "left-4"}
        `}
        title="Toggle Sidebar"
      >
        <PanelLeft className="w-5 h-5" />
      </button>

      {/* Main Content Area */}
      <div
        className={`
        flex-1 flex flex-col min-w-0 min-h-screen
        transition-all duration-300 ease-in-out
        ${isOpen ? "md:ml-64" : "ml-0"}
      `}
      >
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
