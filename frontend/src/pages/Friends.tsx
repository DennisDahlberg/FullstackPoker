import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { UserPlus, X, Check, Search, Users } from "lucide-react";

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
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Friends</h1>
        <p className="text-muted-foreground">
          Manage your friends and friend requests
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <Button
          variant={activeTab === "friends" ? "default" : "outline"}
          onClick={() => setActiveTab("friends")}
          className="flex-1"
        >
          <Users className="h-4 w-4 mr-2" />
          Friends ({mockFriends.length})
        </Button>
        <Button
          variant={activeTab === "requests" ? "default" : "outline"}
          onClick={() => setActiveTab("requests")}
          className="flex-1"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Requests ({mockRequests.length})
        </Button>
        <Button
          variant={activeTab === "find" ? "default" : "outline"}
          onClick={() => setActiveTab("find")}
          className="flex-1"
        >
          <Search className="h-4 w-4 mr-2" />
          Find Friends
        </Button>
      </div>
      
      {/* Search Bar */}
      {(activeTab === "friends" || activeTab === "requests") && (
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      )}

      {/* Friends Tab */}
      {activeTab === "friends" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-muted-foreground">
              {onlineFriendsCount} online • {mockFriends.length} total
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowOnlineOnly(!showOnlineOnly)}
            >
              {showOnlineOnly ? "Show All" : "Show Online Only"}
            </Button>
          </div>

          <div className="space-y-3">
            {filteredFriends.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No friends found</p>
              </Card>
            ) : (
              filteredFriends.map((friend) => (
                <Card key={friend.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-12 w-12 bg-primary/10 flex items-center justify-center">
                          <span className="text-lg font-semibold">
                            {friend.username[0].toUpperCase()}
                          </span>
                        </Avatar>
                        {friend.isOnline && (
                          <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">{friend.username}</p>
                        <p className="text-sm text-muted-foreground">
                          {friend.isOnline ? "Online" : "Offline"}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Message
                      </Button>
                      <Button variant="ghost" size="sm">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* Friend Requests Tab */}
      {activeTab === "requests" && (
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            {mockRequests.length} pending request{mockRequests.length !== 1 ? "s" : ""}
          </p>

          <div className="space-y-3">
            {filteredRequests.length === 0 ? (
              <Card className="p-8 text-center">
                <UserPlus className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">No friend requests</p>
              </Card>
            ) : (
              filteredRequests.map((request) => (
                <Card key={request.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 bg-primary/10 flex items-center justify-center">
                        <span className="text-lg font-semibold">
                          {request.username[0].toUpperCase()}
                        </span>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{request.username}</p>
                        <p className="text-sm text-muted-foreground">
                          Sent {request.sentAt}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="default" size="sm">
                        <Check className="h-4 w-4 mr-1" />
                        Accept
                      </Button>
                      <Button variant="outline" size="sm">
                        <X className="h-4 w-4 mr-1" />
                        Decline
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* Find Friends Tab */}
      {activeTab === "find" && (
        <div>
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search for users by username..."
                value={findSearchQuery}
                onChange={(e) => setFindSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-3">
            {findSearchQuery === "" ? (
              <Card className="p-8 text-center">
                <Search className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Search for users to add as friends
                </p>
              </Card>
            ) : filteredSearchResults.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No users found</p>
              </Card>
            ) : (
              filteredSearchResults.map((user) => (
                <Card key={user.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 bg-primary/10 flex items-center justify-center">
                        <span className="text-lg font-semibold">
                          {user.username[0].toUpperCase()}
                        </span>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{user.username}</p>
                        {user.status === "friend" && (
                          <p className="text-sm text-muted-foreground">
                            Already friends
                          </p>
                        )}
                        {user.status === "pending" && (
                          <p className="text-sm text-muted-foreground">
                            Request pending
                          </p>
                        )}
                        {user.status === "requested" && (
                          <p className="text-sm text-muted-foreground">
                            Sent you a request
                          </p>
                        )}
                      </div>
                    </div>
                    {getStatusButton(user)}
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}