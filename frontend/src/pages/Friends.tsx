import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
// import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { UserPlus, X, MessageSquare, Search, Users } from "lucide-react";

type TabId = "friends" | "requests" | "find";

interface Friend {
  id: string;
  username: string;
  isOnline: boolean;
}

interface FriendRequest {
  id: string;
  username: string;
  sentAt: string;
}

interface User {
  id: string;
  username: string;
  status: "none" | "friend" | "pending" | "requested";
}

// Mock data
const mockFriends: Friend[] = [
  { id: "1", username: "PokerPro123", isOnline: true },
  { id: "2", username: "AllInAnnie", isOnline: true },
  { id: "3", username: "BluffMaster", isOnline: false },
  { id: "4", username: "ChipLeader", isOnline: true },
  { id: "5", username: "RiverRat", isOnline: false },
  { id: "6", username: "FoldOrGold", isOnline: false },
];

const mockRequests: FriendRequest[] = [
  { id: "1", username: "NewPlayer99", sentAt: "2 hours ago" },
  { id: "2", username: "TexasHoldem", sentAt: "1 day ago" },
  { id: "3", username: "RoyalFlush", sentAt: "3 days ago" },
];

const mockSearchResults: User[] = [
  { id: "7", username: "AceKingQueen", status: "none" },
  { id: "8", username: "FullHouseFred", status: "none" },
  { id: "1", username: "PokerPro123", status: "friend" },
  { id: "9", username: "CheckRaiseChris", status: "none" },
  { id: "10", username: "SlowRollSally", status: "pending" },
  { id: "11", username: "NutFlushNancy", status: "none" },
  { id: "2", username: "AllInAnnie", status: "friend" },
  { id: "12", username: "TiltMaster5000", status: "requested" },
];

export default function Friends() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"friends" | "requests" | "find">("friends");
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [findSearchQuery, setFindSearchQuery] = useState("");

  const filteredFriends = mockFriends.filter((friend) => {
    const matchesSearch = friend.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOnline = !showOnlineOnly || friend.isOnline;
    return matchesSearch && matchesOnline;
  });

  const filteredRequests = mockRequests.filter((request) =>
    request.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSearchResults = mockSearchResults.filter((user) =>
    user.username.toLowerCase().includes(findSearchQuery.toLowerCase())
  );

  const onlineFriendsCount = mockFriends.filter((f) => f.isOnline).length;

  const getStatusButton = (user: User) => {
    switch (user.status) {
      case "friend":
        return (
          <Button variant="outline" size="sm" disabled>
            Already Friends
          </Button>
        );
      case "pending":
        return (
          <Button variant="outline" size="sm" disabled>
            Request Sent
          </Button>
        );
      case "requested":
        return (
          <Button variant="default" size="sm">
            Accept Request
          </Button>
        );
      default:
        return (
          <Button variant="default" size="sm">
            <UserPlus className="h-4 w-4 mr-1" />
            Add Friend
          </Button>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <Users className="text-amber-500 w-8 h-8" />
            Friends
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Manage your social circle and game invites
          </p>
        </div>
        
        {/* Sub-Tabs (Discord Style) */}
        <div className="flex bg-gray-900 p-1 rounded-lg border border-white/5">
          {[
            { id: "friends", label: "All", icon: Users },
            { id: "requests", label: "Pending", icon: UserPlus, count: mockRequests.length },
            { id: "find", label: "Add Friend", icon: Search },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabId)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all
                ${activeTab === tab.id 
                  ? "bg-gray-800 text-amber-500 shadow-sm" 
                  : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"}`}
            >
              {tab.label}
              {tab.count ? <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full">{tab.count}</span> : null}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="space-y-6">
        {/* Global Search (only for existing friends/requests) */}
        {activeTab !== "find" && (
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-amber-500 h-4 w-4 transition-colors" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-900/50 border-gray-800 focus:border-amber-500/50 transition-all h-10"
            />
          </div>
        )}

        {/* List Logic */}
        <div className="divide-y divide-gray-800/50">
          {activeTab === "friends" && (
            <>
              <div className="flex justify-between items-center py-2 px-2">
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
                  Online — {onlineFriendsCount}
                </span>
                <button 
                  onClick={() => setShowOnlineOnly(!showOnlineOnly)}
                  className="text-[11px] font-bold uppercase tracking-widest text-amber-500 hover:underline"
                >
                  {showOnlineOnly ? "Show All" : "Filter Online"}
                </button>
              </div>

              {filteredFriends.map((friend) => (
                <div 
                  key={friend.id} 
                  className="group flex items-center justify-between p-3 rounded-xl transition-all border-y border-transparent hover:border-t-white/5 hover:border-b-black/20 hover:bg-gray-900/40"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar className="flex items-center justify-center h-10 w-10 border border-gray-800 group-hover:border-amber-500/30 transition-colors">
                        <span className="font-bold text-amber-500">{friend.username[0]}</span>
                      </Avatar>
                      <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-gray-950 ${friend.isOnline ? 'bg-green-500' : 'bg-gray-600'}`} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-200 group-hover:text-white">{friend.username}</h4>
                      <p className="text-xs text-gray-500">{friend.isOnline ? 'Active Now' : 'Offline'}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-800 text-gray-400 hover:text-white">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-red-500/10 text-gray-500 hover:text-red-400">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Render Requests & Find Tabs with similar "item" styling */}
          {activeTab === "requests" && filteredRequests.map(request => (
             <div key={request.id} className="group flex items-center justify-between p-4 border-y border-transparent hover:bg-gray-900/40 hover:border-t-white/5">
                <div className="flex items-center gap-4">
                   <Avatar className="flex items-center justify-center h-10 w-10 bg-amber-900/20 text-amber-500 font-bold">{request.username[0]}</Avatar>
                   <div>
                      <h4 className="text-sm font-bold">{request.username}</h4>
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">Incoming Request • {request.sentAt}</p>
                   </div>
                </div>
                <div className="flex gap-2">
                   <Button variant="amber" size="sm" className="h-8 px-4">Accept</Button>
                   <Button variant="ghost" size="sm" className="h-8 hover:bg-red-500/10 text-gray-400 hover:text-red-400">Decline</Button>
                </div>
             </div>
          ))}

          {activeTab === "find" && (
            <div className="space-y-6">
              <Input
                placeholder="Find new players..."
                value={findSearchQuery}
                onChange={(e) => setFindSearchQuery(e.target.value)}
                className="bg-gray-900 border-gray-800 focus:border-amber-500"
              />
              <div className="divide-y divide-gray-800/50">
                {filteredSearchResults.map(user => (
                   <div key={user.id} className="flex items-center justify-between py-4 group">
                      <div className="flex items-center gap-4">
                        <Avatar className="flex items-center justify-center h-10 w-10 bg-gray-800 border border-white/5">{user.username[0]}</Avatar>
                        <span className="font-bold text-sm text-gray-300 group-hover:text-white">{user.username}</span>
                      </div>
                      {getStatusButton(user)}
                   </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}