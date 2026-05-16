import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, ArrowLeft, MessageCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { ChatConversation } from "@/types/Chat";
import { useChatStore } from "@/stores/useChatStore";
import { api } from "@/lib/api";
import type { Friend } from "@/types/Friends";

interface ChatProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialFriendId?: string;
}

export default function Chat({
  open,
  onOpenChange,
  initialFriendId,
}: ChatProps) {
  const {
    connection,
    isConnected,
    conversations,
    activeChat,
    getTotalUnread,
    sendMessage,
    getOrCreateConversation,
    setActiveChat,
    loadMessages,
    loadConversations,
  } = useChatStore();

  const [activeConversation, setActiveConversation] =
    useState<ChatConversation | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(false); 


  useEffect(() => {
    if (!initialFriendId || !open) {
      setActiveConversation(null);
      setInitializing(false); // Reset when closing
      return;
    }

    const loadFriend = async () => {
      setInitializing(true); // Set to true when starting to load
      try {
        const friends = await api.friends.getFriends();
        const friend = friends.find((f: Friend) => f.id === initialFriendId);

        if (friend) {
          const conversation = getOrCreateConversation(
            friend.id,
            friend.username,
            friend.profileImageUrl,
            friend.isOnline,
          );

          await loadMessages(friend.id);
          setActiveConversation(conversation);
          setActiveChat(friend.id);
        }
      } catch (error) {
        console.error("Failed to load friend for chat:", error);
      } finally {
        setInitializing(false); // Done loading
      }
    };
    loadFriend();
  }, [initialFriendId, open, getOrCreateConversation, setActiveChat, loadMessages]);

  useEffect(() => {
    if (activeChat) {
      const conv = conversations.get(activeChat);
      if (conv) {
        setActiveConversation(conv);
      }
    }
  }, [conversations, activeChat]);

  useEffect(() => {
    if (open && isConnected) {
      loadConversations().catch(err => {
        console.error("Failed to load conversations:", err);
      });
    }
  }, [open, isConnected, loadConversations]);

  const handleSelectConversation = (conversation: ChatConversation) => {
    setActiveConversation(conversation);
    setActiveChat(conversation.friendId);
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeConversation || !isConnected) return;

    try {
      await sendMessage(activeConversation.friendId, messageInput);
      setMessageInput("");
    } catch (err) {
      console.error("Failed to send message:", err);
      toast.error("Failed to send message");
    }
  };

  const handleBack = () => {
    setActiveConversation(null);
    setActiveChat(null);
  };

  const conversationList = Array.from(conversations.values());
  const totalUnread = getTotalUnread();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:w-[440px] p-0 bg-gray-950 border-gray-800"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="p-4 border-b border-gray-800">
            <div className="flex items-center gap-3">
              {activeConversation && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBack}
                  className="hover:bg-gray-800"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
              <SheetTitle className="text-white flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-amber-500" />
                {activeConversation
                  ? activeConversation.friendUsername
                  : "Messages"}
                {!activeConversation && totalUnread > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {totalUnread}
                  </span>
                )}
              </SheetTitle>
              {!isConnected && (
                <span className="text-xs text-red-400">Disconnected</span>
              )}
            </div>
          </SheetHeader>

          {/* Show loader if initializing with initialFriendId */}
          {initializing ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            </div>
          ) : !activeConversation ? (
            <div className="flex-1 overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                </div>
              ) : conversationList.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 px-4">
                  <MessageCircle className="h-12 w-12 mb-3 text-gray-700" />
                  <p className="text-sm text-center">
                    No conversations yet. Start chatting with your friends!
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-800/50">
                  {conversationList.map((conversation) => (
                    <button
                      key={conversation.friendId}
                      onClick={() => handleSelectConversation(conversation)}
                      className="w-full p-4 hover:bg-gray-900/50 transition-colors text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="h-12 w-12 border-2 border-gray-800 group-hover:border-amber-500/30">
                            <AvatarImage
                              src={conversation.friendProfileImageUrl}
                            />
                            <AvatarFallback className="bg-gray-800 text-amber-500">
                              {conversation.friendUsername[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div
                            className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-gray-950 ${
                              conversation.isOnline
                                ? "bg-green-500"
                                : "bg-gray-600"
                            }`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-bold text-sm text-gray-200 group-hover:text-white truncate">
                              {conversation.friendUsername}
                            </h4>
                            {conversation.messages.length > 0 && (
                              <span className="text-xs text-gray-500">
                                {formatDistanceToNow(
                                  new Date(
                                    conversation.messages[
                                      conversation.messages.length - 1
                                    ].timestamp,
                                  ),
                                  { addSuffix: false },
                                )}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500 truncate">
                              {conversation.messages.length > 0
                                ? conversation.messages[
                                    conversation.messages.length - 1
                                  ].message
                                : "No messages yet"}
                            </p>
                            {conversation.unreadCount > 0 && (
                              <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-2">
                                {conversation.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Friend Info */}
              <div className="p-3 border-b border-gray-800 bg-gray-900/50">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10 border border-gray-800">
                      <AvatarImage
                        src={activeConversation.friendProfileImageUrl}
                      />
                      <AvatarFallback className="bg-gray-800 text-amber-500">
                        {activeConversation.friendUsername[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-gray-950 ${
                        activeConversation.isOnline
                          ? "bg-green-500"
                          : "bg-gray-600"
                      }`}
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">
                      {activeConversation.friendUsername}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {activeConversation.isOnline ? "Active now" : "Offline"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {activeConversation.messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <p className="text-sm">No messages yet. Say hi! 👋</p>
                  </div>
                ) : (
                  activeConversation.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.isOwnMessage ? "flex-row-reverse" : ""}`}
                    >
                      {!message.isOwnMessage && (
                        <Avatar className="h-8 w-8 border border-gray-800 flex-shrink-0">
                          <AvatarImage src={message.senderProfileImageUrl} />
                          <AvatarFallback className="bg-gray-800 text-amber-500 text-xs">
                            {message.senderUsername[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`flex flex-col ${message.isOwnMessage ? "items-end" : "items-start"} max-w-[75%]`}
                      >
                        <div
                          className={`rounded-2xl px-4 py-2 ${
                            message.isOwnMessage
                              ? "bg-amber-600 text-white"
                              : "bg-gray-800 text-gray-200"
                          }`}
                        >
                          <p className="text-sm break-words">
                            {message.message}
                          </p>
                        </div>
                        <span className="text-[10px] text-gray-600 mt-1 px-2">
                          {formatDistanceToNow(new Date(message.timestamp), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-800 bg-gray-900/50">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    disabled={!isConnected}
                    className="bg-gray-800 border-gray-700 focus:border-amber-500 text-white placeholder:text-gray-500"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim() || !isConnected}
                    className="bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                {!isConnected && (
                  <p className="text-xs text-red-400 mt-2">
                    Connecting to chat server...
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}