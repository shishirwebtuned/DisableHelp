"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Search, Check, CheckCheck, Mail } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSocket, setActiveSocketChat, connectSocket } from "@/lib/socket";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchMyChats, setActiveChat, updateLastMessage } from "@/redux/slices/chatSlice";
import { fetchMessagesByChat, markMessagesRead, sendMessage, addMessage } from "@/redux/slices/messageSlice";
import { markNotificationRead } from "@/redux/slices/notificationSlice";

const chatStatusConfig: Record<string, { label: string; className: string }> = {
    active: {
        label: "Active",
        className: "bg-green-100 text-green-600 border border-green-300",
    },
    pending: {
        label: "Pending",
        className: "bg-yellow-100 text-yellow-600 border border-yellow-300",
    },
    suspended: {
        label: "Suspended",
        className: "bg-red-100 text-red-600 border border-red-300",
    },
};

export default function WorkerInboxPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { items: chats, activeChat } = useSelector((s: RootState) => s.chat);
    const { items: messages, loading } = useSelector((s: RootState) => s.message);
    const user = useSelector((s: RootState) => s.auth.user);
    const notifications = useSelector((s: RootState) => s.notifications.items);

    const [messageInput, setMessageInput] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const bottomRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const socketRef = useRef<any>(null);

    const isInitialLoad = useRef(true);
    const prevMessageCount = useRef(0);
    const prevScrollHeight = useRef(0);
    const isFetching = useRef(false);

    const isActive = activeChat?.status === "active";

    // 1. Fetch chat list on mount
    useEffect(() => {
        dispatch(fetchMyChats());
    }, [dispatch]);

    // 1b. Connect socket after user is authenticated
    useEffect(() => {
        if (!user || !user._id) return;
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) return;
        socketRef.current = connectSocket(token, user._id);
    }, [user]);

    // 2. When active chat changes
    useEffect(() => {
        if (!activeChat) return;
        const socket = socketRef.current;
        const chatId = activeChat._id;

        setPage(1);
        setHasMore(true);
        setLoadingMore(false);
        isInitialLoad.current = true;
        prevMessageCount.current = 0;
        isFetching.current = false;

        dispatch(fetchMessagesByChat(chatId));
        dispatch(markMessagesRead(chatId));

        // Mark related message notifications as read
        notifications
            .filter(
                (n) =>
                    n.type === "message" &&
                    !n.read &&
                    (n as any).chat === chatId
            )
            .forEach((n) => {
                dispatch(markNotificationRead(n._id));
            });

        setActiveSocketChat(chatId);

        if (socket && socket.connected) {
            socket.emit("joinChat", chatId);
        } else if (socket) {
            socket.once("connect", () => {
                socket.emit("joinChat", chatId);
            });
        }

        return () => {
            if (socket) socket.emit("leaveChat", chatId);
            setActiveSocketChat(null);
        };
    }, [activeChat?._id, dispatch, notifications]);

    // 3. Socket listener
    useEffect(() => {
        const socket = socketRef.current;

        const handleNewMessage = (msg: any) => {
            if (activeChat && (msg.chat === activeChat._id || msg.chat?._id === activeChat._id)) {
                dispatch(addMessage(msg));
                dispatch(markMessagesRead(activeChat._id));
            }
            dispatch(updateLastMessage({
                chatId: msg.chat?._id || msg.chat,
                lastMessage: msg,
            }));
        };

        socket.on("newMessage", handleNewMessage);
        return () => { socket.off("newMessage", handleNewMessage); };
    }, [activeChat?._id, dispatch]);

    // 4. Smart scroll behavior
    useEffect(() => {
        const container = messagesContainerRef.current;
        if (!container || messages.length === 0) return;

        const newCount = messages.length;
        const prevCount = prevMessageCount.current;

        if (isInitialLoad.current) {
            // Initial — instant scroll to bottom
            container.scrollTop = container.scrollHeight;
            isInitialLoad.current = false;
            prevMessageCount.current = newCount;
            return;
        }

        if (newCount > prevCount) {
            const added = newCount - prevCount;

            if (added === 1) {
                // New single message (sent/received) — smooth scroll to bottom
                bottomRef.current?.scrollIntoView({ behavior: "smooth" });
            } else {
                // Pagination prepend — restore scroll position so view doesn't jump
                requestAnimationFrame(() => {
                    if (container) {
                        container.scrollTop = container.scrollHeight - prevScrollHeight.current;
                    }
                });
            }
        }

        prevMessageCount.current = newCount;
    }, [messages]);

    // 5. Scroll-up pagination
    const handleScroll = useCallback(async () => {
        const container = messagesContainerRef.current;
        if (!container || !hasMore || isFetching.current || !activeChat) return;
        if (container.scrollTop > 80) return;

        isFetching.current = true;
        setLoadingMore(true);

        // Capture scroll height BEFORE fetch so we can restore position
        prevScrollHeight.current = container.scrollHeight;

        const nextPage = page + 1;
        const result = await dispatch(
            fetchMessagesByChat({ chatId: activeChat._id, page: nextPage, limit: 10 } as any)
        );

        const fetched = (result.payload as any[]) ?? [];

        if (fetched.length === 0) {
            setHasMore(false);
            setLoadingMore(false);
            isFetching.current = false;
            return;
        }

        setPage(nextPage);
        setLoadingMore(false);
        isFetching.current = false;
        // scroll position restoration is handled in useEffect above via prevScrollHeight
    }, [activeChat?._id, hasMore, page, dispatch]);

    const handleSend = async () => {
        if (!messageInput.trim() || !activeChat || !isActive) return;
        await dispatch(sendMessage({ chatId: activeChat._id, message: messageInput.trim() }));
        setMessageInput("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleSelectChat = (chat: any) => {
        if (activeChat?._id === chat._id) return;
        dispatch(setActiveChat(chat));
    };

    const getOtherParticipant = (chat: any) =>
        chat.client._id === user?._id ? chat.worker : chat.client;

    const isOwnMessage = (msg: any) => msg.sender._id === user?._id;

    const filteredChats = chats.filter((c) => {
        const other = getOtherParticipant(c);
        return `${other?.firstName} ${other?.lastName}`
            .toLowerCase()
            .includes(search.toLowerCase());
    });

    const statusConfig = activeChat
        ? chatStatusConfig[activeChat.status] ?? chatStatusConfig.pending
        : null;

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-base md:text-lg lg:text-xl font-bold tracking-tight">Messages</h1>
                <p className="text-muted-foreground text-[10px] md:text-xs lg:text-sm">Communicate with your clients</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-200px)]">

                {/* ── Conversations List ── */}
                <Card className="md:col-span-1 md:py-3 py-2 lg:py-4 flex flex-col overflow-hidden">
                    <CardHeader className="pb-1.5 md:pb-2 lg:pb-3 shrink-0">
                        <CardTitle className="text-xs md:text-sm lg:text-base">Conversations</CardTitle>
                        <div className="relative mt-1 md:mt-2">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-2.5 w-2.5 md:h-3 md:w-3 lg:h-4 lg:w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search..."
                                className="pl-8 md:pl-9 lg:pl-10 h-6 md:h-7 lg:h-8 text-[10px] md:text-xs lg:text-sm"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 overflow-hidden">
                        <ScrollArea className="h-full">
                            {filteredChats.length === 0 && (
                                <p className="text-xs text-muted-foreground text-center py-4 md:py-6 lg:py-8">
                                    No conversations
                                </p>
                            )}
                            {filteredChats.map((chat) => {
                                const other = getOtherParticipant(chat);
                                const isSelected = activeChat?._id === chat._id;
                                return (
                                    <div
                                        key={chat._id}
                                        onClick={() => handleSelectChat(chat)}
                                        className={`flex items-center gap-3 px-3 md:px-4 py-1.5 md:py-2 lg:py-3 cursor-pointer hover:bg-muted/50 transition-colors border-b last:border-0 ${isSelected ? "bg-muted/80" : ""}`}
                                    >
                                        <Avatar className="w-8 h-8 md:w-8.5 md:h-8.5 lg:h-9 lg:w-9 shrink-0 ">
                                            <AvatarFallback className="bg-gray-200 text-[8px] md:text-[10px] lg:text-xs">
                                                {other?.firstName[0]}{other?.lastName[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-1">
                                                <span className="text-xs md:text-[13px] lg:text-sm font-medium truncate">
                                                    {other?.firstName} {other?.lastName}
                                                </span>
                                                <span className="text-[8px] md:text-[9px] lg:text-[10px] text-muted-foreground shrink-0">
                                                    {chat.lastMessage
                                                        ? new Date(chat.lastMessage.createdAt).toLocaleTimeString([], {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })
                                                        : ""}
                                                </span>
                                            </div>
                                            <span className="text-[10px] md:text-[11px] lg:text-xs text-muted-foreground truncate block">
                                                {chat.lastMessage?.message ?? "No messages yet"}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* ── Chat Area ── */}
                {activeChat ? (
                    <Card className="md:col-span-2 flex flex-col overflow-hidden py-1.5 md:py-2">

                        {/* Header */}
                        <div className="flex items-center justify-between px-3 md:px-3.5 lg:px-4 py-2 md:py-3 border-b shrink-0">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8 md:h-9 md:w-9">
                                    <AvatarFallback className="text-xs">
                                        {getOtherParticipant(activeChat)?.firstName[0]}
                                        {getOtherParticipant(activeChat)?.lastName[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-[12px] md:text-[13px] lg:text-sm font-semibold leading-tight">
                                        {getOtherParticipant(activeChat)?.firstName}{" "}
                                        {getOtherParticipant(activeChat)?.lastName}
                                    </p>
                                    <p className="text-[9px] md:text-[10px] lg:text-[11px] text-muted-foreground leading-tight">
                                        {getOtherParticipant(activeChat).email ?? ""}
                                    </p>
                                </div>
                            </div>
                            {statusConfig && (
                                <Badge className={`text-[10px] md:text-[11px] lg:text-xs font-medium px-2 py-0.5 capitalize ${statusConfig.className}`}>
                                    {statusConfig.label}
                                </Badge>
                            )}
                        </div>

                        {/* Content */}
                        <div
                            ref={messagesContainerRef}
                            className="flex-1 overflow-y-auto px-2.5 md:px-3 lg:px-4 py-2 md:py-2.5 lg:py-3"
                            onScroll={() => { handleScroll(); }}
                        >
                            {/* Top indicators */}
                            {loadingMore && (
                                <div className="flex justify-center py-2">
                                    <span className="text-[9px] md:text-[10px] lg:text-[11px] text-gray-700 bg-muted/70 px-3 py-1 rounded-full">
                                        Loading older messages...
                                    </span>
                                </div>
                            )}
                            {!hasMore && !loadingMore && messages.length > 0 && (
                                <div className="flex justify-center py-2">
                                    <span className="text-[9px] md:text-[10px] lg:text-[11px] text-gray-700 bg-muted/70 px-3 py-1 rounded-full">
                                        Beginning of conversation
                                    </span>
                                </div>
                            )}

                            {loading ? (
                                <div className="flex items-center justify-center h-full text-muted-foreground text-xs md:text-[13px] lg:text-sm">
                                    Loading messages...
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex items-center justify-center h-full text-muted-foreground text-xs md:text-[13px] lg:text-sm">
                                    No messages yet. Say hello!
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {messages.map((msg, index) => {
                                        const own = isOwnMessage(msg);
                                        const prevMsg = messages[index - 1];
                                        const showDateSeparator = !prevMsg ||
                                            new Date(msg.createdAt).toDateString() !==
                                            new Date(prevMsg.createdAt).toDateString();

                                        return (
                                            <div key={msg._id}>
                                                {/* Date separator */}
                                                {showDateSeparator && (
                                                    <div className="flex justify-center my-2 md:my-2.5 lg:my-3">
                                                        <span className="text-[8px] md:text-[9px] lg:text-[10px] text-gray-700 bg-muted/70 px-3 py-0.5 rounded-full">
                                                            {new Date(msg.createdAt).toLocaleDateString([], {
                                                                weekday: "short",
                                                                month: "short",
                                                                day: "numeric",
                                                            })}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className={`flex flex-col ${own ? "items-end" : "items-start"}`}>
                                                    <div className={`max-w-[70%] rounded-2xl px-3 py-2 ${own
                                                        ? "bg-blue-500 text-white rounded-br-sm"
                                                        : "bg-muted rounded-bl-sm"
                                                        }`}>
                                                        <p className="text-xs md:text-[13px] lg:text-sm leading-relaxed break-words">
                                                            {msg.message}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-1 mt-0.5 px-1">
                                                        <span className="text-[8px] md:text-[9px] lg:text-[10px] text-muted-foreground">
                                                            {new Date(msg.createdAt).toLocaleTimeString([], {
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            })}
                                                        </span>
                                                        {own && (
                                                            msg.read
                                                                ? <CheckCheck className="h-2.5 w-2.5 md:h-3 md:w-3 text-blue-400" />
                                                                : <Check className="h-2.5 w-2.5 md:h-3 md:w-3 text-muted-foreground" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={bottomRef} />
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="border-t px-3 md:px-3.5 lg:px-4 pb-1 pt-2 md:pb-1.5 md:pt-3 shrink-0">
                            {!isActive && (
                                <p className="text-[10px] md:text-[11px] lg:text-xs text-muted-foreground mb-2 text-center">
                                    {activeChat.status === "suspended"
                                        ? "This chat has been suspended and is read-only."
                                        : "This chat is pending and not yet active."}
                                </p>
                            )}
                            <div className="flex gap-2">
                                <Input
                                    placeholder={isActive ? "Type your message..." : "Messaging is disabled"}
                                    className="flex-1 h-7 md:h-8 lg:h-9 text-[11px] md:text-xs lg:text-sm"
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    disabled={!isActive}
                                />
                                <Button
                                    size="icon"
                                    className="h-7 w-7 md:h-8 md:w-8 lg:h-9 lg:w-9 shrink-0"
                                    onClick={handleSend}
                                    disabled={!messageInput.trim() || !isActive}
                                >
                                    <Send className="h-3 w-3 md:h-3.5 md:w-3.5 lg:h-4 lg:w-4 mt-[1px] mr-[1px]" />
                                </Button>
                            </div>
                            <p className="text-[8px] md:text-[9px] lg:text-[10px] text-muted-foreground mt-2">
                                <Badge variant="outline" className="text-[8px] md:text-[9px] lg:text-[10px] border border-[red] text-red-400 mr-1">Note</Badge>
                                Admin can view all conversations for compliance
                            </p>
                        </div>
                    </Card>
                ) : (
                    <Card className="md:col-span-2 flex flex-col items-center justify-center text-gray-600 text-xs md:text-sm lg:text-base gap-4">
                        <Mail className="w-8 h-8 md:h-10 md:w-10 lg:h-12 lg:w-12 mb-0 opacity-60" />
                        <p>
                            Select a conversation to start chatting
                        </p>
                    </Card>
                )}
            </div>
        </div>
    );
}