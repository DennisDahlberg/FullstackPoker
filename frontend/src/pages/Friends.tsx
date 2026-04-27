import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { UserPlus, X, MessageSquare, Search, Users, Loader2, Gamepad2, Check } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useFriendsHub } from "@/context/FriendsHubContext";
import { formatDistanceToNow } from "date-fns";
import type { LobbyInvite } from "@/types/Lobby";
import type { Friend, FriendRequest, TabId, User } from "@/types/Friends";

export default function Friends() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabId>("friends");
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [findSearchQuery, setFindSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [sendingRequestTo, setSendingRequestTo] = useState<string | null>(null);
  const [acceptingRequestId, setAcceptingRequestId] = useState<number | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [isLoadingFriends, setIsLoadingFriends] = useState(true);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);

  const [gameInvites, setGameInvites] = useState<LobbyInvite[]>([]);
  const [isLoadingInvites, setIsLoadingInvites] = useState(true);
  const [acceptingInviteId, setAcceptingInviteId] = useState<string | null>(null);
  const [decliningInviteId, setDecliningInviteId] = useState<string | null>(null);

  const friendsHub = useFriendsHub();

  useEffect(() => {
    const fetchFriends = async () => {
      setIsLoadingFriends(true);
      try {
        const data = await api.friends.getFriends();
        setFriends(data);
      } catch (error) {
        toast.error("Failed to load friends", {
          description: error instanceof Error ? error.message : "Could not fetch friends list",
        });
      } finally {
        setIsLoadingFriends(false);
      }
    };
    fetchFriends();
  }, []);

  useEffect(() => {
    const fetchRequests = async () => {
      setIsLoadingRequests(true);
      try {
        const data = await api.friends.getFriendRequests();
        setFriendRequests(data);
      } catch (error) {
        toast.error("Failed to load friend requests", {
          description: error instanceof Error ? error.message : "Could not fetch friend requests",
        });
      } finally {
        setIsLoadingRequests(false);
      }
    };
    fetchRequests();
  }, []);

  useEffect(() => {
    const fetchInvites = async () => {
      setIsLoadingInvites(true);
      try {
        const data = await api.lobby.getPendingInvites();
        setGameInvites(data);
      } catch (error) {
        console.error("Failed to load game invites:", error);
      } finally {
        setIsLoadingInvites(false);
      }
    };
    fetchInvites();
  }, []);


  // SignalR event listeners
  useEffect(() => {
    if (!friendsHub) return;

    const handleReceiveFriendInvite = (senderUsername: string) => {
      console.log("Received friend invite from:", senderUsername);
      
      api.friends.getFriendRequests()
        .then(data => setFriendRequests(data))
        .catch(error => console.error("Failed to refresh requests:", error));
    };

    const handleFriendRequestAccepted = (accepterUsername: string) => {
      toast.success("Friend request accepted", {
        description: `${accepterUsername} accepted your friend request`,
      });
      
      api.friends.getFriends()
        .then(data => {
          setFriends(data);
          window.dispatchEvent(new Event("refreshNotifications"));})
        .catch(error => console.error("Failed to refresh friends:", error));
    };

    const handleFriendStatusChanged = (friendId: string, isOnline: boolean) => {
    setFriends(prev => 
      prev.map(friend => 
        friend.id === friendId 
          ? { ...friend, isOnline }
          : friend
      )
    );
  };


    friendsHub.on("ReceiveFriendInvite", handleReceiveFriendInvite);
    friendsHub.on("FriendRequestAccepted", handleFriendRequestAccepted);
    friendsHub.on("FriendStatusChanged", handleFriendStatusChanged);

    return () => {
      friendsHub.off("ReceiveFriendInvite", handleReceiveFriendInvite);
      friendsHub.off("FriendRequestAccepted", handleFriendRequestAccepted);
      friendsHub.off("FriendStatusChanged", handleFriendStatusChanged);
    };
  }, [friendsHub]);


  // Debounced search for finding users
  useEffect(() => {
    if (activeTab !== "find" || findSearchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await api.friends.findUsers(findSearchQuery);
        setSearchResults(results);
      } catch (error) {
        toast.error("Search failed", {
          description: error instanceof Error ? error.message : "Failed to search users",
        });
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [findSearchQuery, activeTab]);

  const handleSendFriendRequest = async (username: string, userId: string) => {
    setSendingRequestTo(userId);
    try {
      await api.friends.sendFriendRequest(username);
      
      setSearchResults(prev => 
        prev.map(user => 
          user.id === userId 
            ? { ...user, status: "pending" as const }
            : user
        )
      );

      toast.success("Friend request sent", {
        description: `Request sent to ${username}`,
      });
    } catch (error) {
      toast.error("Failed to send request", {
        description: error instanceof Error ? error.message : "Something went wrong",
      });
    } finally {
      setSendingRequestTo(null);
    }
  };

  const handleAcceptRequest = async (requestId: number, username: string) => {
    setAcceptingRequestId(requestId);
    try {
      await api.friends.acceptFriendRequest(requestId);
      
      // Remove from friend requests
      setFriendRequests(prev => prev.filter(req => req.id !== requestId));
      
      // Optionally refresh friends list to show the new friend
      const updatedFriends = await api.friends.getFriends();
      setFriends(updatedFriends);
      
      toast.success("Friend request accepted", {
        description: `You are now friends with ${username}`,
      });
    } catch (error) {
      toast.error("Failed to accept request", {
        description: error instanceof Error ? error.message : "Something went wrong",
      });
    } finally {
      setAcceptingRequestId(null);
    }
  };

  const handleAcceptInvite = async (invite: LobbyInvite) => {
    setAcceptingInviteId(invite.inviteId);
    try {
      const result = await api.lobby.acceptInvite(invite.inviteId);
      setGameInvites(prev => prev.filter(i => i.inviteId !== invite.inviteId));
      toast.success("Invite accepted! Joining lobby...");
      navigate(`/lobby?tableId=${result.tableId}`);
    } catch (err: any) {
      const message = err?.message || "Failed to accept invite";
      toast.error(message);
    } finally {
      setAcceptingInviteId(null);
    }
  };

  const handleDeclineInvite = async (invite: LobbyInvite) => {
    setDecliningInviteId(invite.inviteId);
    try {
      await api.lobby.declineInvite(invite.inviteId);
      setGameInvites(prev => prev.filter(i => i.inviteId !== invite.inviteId));
      toast.info("Invite declined");
    } catch (err) {
      console.error("Failed to decline invite:", err);
      toast.error("Failed to decline invite");
    } finally {
      setDecliningInviteId(null);
    }
  };

  const filteredFriends = friends.filter((friend) => {
    const matchesSearch = friend.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOnline = !showOnlineOnly || friend.isOnline;
    return matchesSearch && matchesOnline;
  });

  const filteredRequests = friendRequests.filter((request) =>
    request.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onlineFriendsCount = friends.filter((f) => f.isOnline).length;

  const getStatusButton = (user: User) => {
    const isLoading = sendingRequestTo === user.id;

    switch (user.status) {
      case "friend":
        return (
          <Button variant="outline" size="sm" disabled className="cursor-not-allowed">
            Already Friends
          </Button>
        );
      case "pending":
        return (
          <Button variant="outline" size="sm" disabled className="cursor-not-allowed">
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
          <Button 
            variant="amberOutline" 
            size="sm"
            onClick={() => handleSendFriendRequest(user.username, user.id)}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-1" />
                Add Friend
              </>
            )}
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
            { id: "requests", label: "Pending", icon: UserPlus, count: friendRequests.length },
            { id: "invites", label: "Game Invites", icon: Gamepad2, count: gameInvites.length },
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
        {activeTab !== "find" && activeTab !== "invites" && (
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

              {isLoadingFriends ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                </div>
              ) : filteredFriends.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">
                  {searchQuery ? "No friends found matching your search" : "No friends yet. Add some friends to get started!"}
                </p>
              ) : (
                filteredFriends.map((friend) => (
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
                      <Button variant="ghost" size="icon" className="rounded-full hover:bg-red-500/10 text-gray-500 hover:text-red-400">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {activeTab === "requests" && (
            <>
              {isLoadingRequests ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                </div>
              ) : filteredRequests.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">
                  No pending requests
                </p>
              ) : (
                filteredRequests.map(request => (
                  <div key={request.id} className="group flex items-center justify-between p-4 border-y border-transparent hover:bg-gray-900/40 hover:border-t-white/5">
                    <div className="flex items-center gap-4">
                      <Avatar className="flex items-center justify-center h-10 w-10 bg-amber-900/20 text-amber-500 font-bold">
                        {request.username[0]}
                      </Avatar>
                      <div>
                        <h4 className="text-sm font-bold">{request.username}</h4>
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">
                          Incoming Request • {formatDistanceToNow(new Date(request.sentAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="amber" 
                        size="sm" 
                        className="h-8 px-4"
                        onClick={() => handleAcceptRequest(request.id, request.username)}
                        disabled={acceptingRequestId === request.id}
                      >
                        {acceptingRequestId === request.id ? (
                          <>
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            Accepting...
                          </>
                        ) : (
                          "Accept"
                        )}
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 hover:bg-red-500/10 text-gray-400 hover:text-red-400">
                        Decline
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {activeTab === "invites" && (
            <>
              {isLoadingInvites ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                </div>
              ) : gameInvites.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <Gamepad2 className="h-10 w-10 text-gray-700 mx-auto" />
                  <p className="text-gray-500 text-sm">No pending game invites</p>
                </div>
              ) : (
                gameInvites.map((invite) => (
                  <div
                    key={invite.inviteId}
                    className="group flex items-center justify-between p-4 border-y border-transparent hover:bg-gray-900/40 hover:border-t-white/5"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="flex items-center justify-center h-10 w-10 bg-amber-900/20 text-amber-500 font-bold">
                        {invite.hostUsername[0]}
                      </Avatar>
                      <div>
                        <h4 className="text-sm font-bold text-gray-200">
                          {invite.hostUsername}
                        </h4>
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">
                          Game Invite • Table #{invite.tableId} •{" "}
                          {formatDistanceToNow(new Date(invite.sentAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="amber"
                        size="sm"
                        className="h-8 px-4"
                        onClick={() => handleAcceptInvite(invite)}
                        disabled={acceptingInviteId === invite.inviteId}
                      >
                        {acceptingInviteId === invite.inviteId ? (
                          <>
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            Joining...
                          </>
                        ) : (
                          <>
                            <Check className="h-3 w-3 mr-1" />
                            Accept
                          </>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 hover:bg-red-500/10 text-gray-400 hover:text-red-400"
                        onClick={() => handleDeclineInvite(invite)}
                        disabled={decliningInviteId === invite.inviteId}
                      >
                        {decliningInviteId === invite.inviteId ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          "Decline"
                        )}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {activeTab === "find" && (
            <div className="space-y-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
                <Input
                  placeholder="Find new players... (min 2 characters)"
                  value={findSearchQuery}
                  onChange={(e) => setFindSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-900 border-gray-800 focus:border-amber-500"
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-amber-500" />
                )}
              </div>
              
              {findSearchQuery.length > 0 && findSearchQuery.length < 2 && (
                <p className="text-gray-500 text-sm text-center py-8">
                  Type at least 2 characters to search
                </p>
              )}

              {findSearchQuery.length >= 2 && !isSearching && searchResults.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-8">
                  No users found matching "{findSearchQuery}"
                </p>
              )}

              <div className="divide-y divide-gray-800/50">
                {searchResults.map(user => (
                  <div key={user.id} className="flex items-center justify-between py-4 group hover:bg-gray-900/40 px-2 rounded-lg transition-colors">
                    <div className="flex items-center gap-4">
                      <Avatar className="flex items-center justify-center h-10 w-10 bg-gray-800 border border-white/5">
                        <span className="font-bold text-amber-500">{user.username[0].toUpperCase()}</span>
                      </Avatar>
                      <span className="font-bold text-sm text-gray-300 group-hover:text-white transition-colors">
                        {user.username}
                      </span>
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