'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchAllChats, setActiveChat } from '@/redux/slices/chatSlice';
import { fetchMessagesByChat, addMessage } from '@/redux/slices/messageSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Mail, Check, CheckCheck, MessagesSquare, MessageSquareMore } from 'lucide-react';
import { getSocket } from '@/lib/socket';

const chatStatusConfig: Record<string, { label: string; className: string }> = {
    active: {
        label: 'Active',
        className: 'bg-green-100 text-green-600 border border-green-300',
    },
    pending: {
        label: 'Pending',
        className: 'bg-yellow-100 text-yellow-600 border border-yellow-300',
    },
    suspended: {
        label: 'Suspended',
        className: 'bg-red-100 text-red-600 border border-red-300',
    },
};

export default function AdminMessagesPage() {
    const dispatch = useAppDispatch();
    const { items: chats, activeChat } = useAppSelector((s) => s.chat);
    const { items: messages, loading } = useAppSelector((s) => s.message);

    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const socketRef = useRef(getSocket());

    const isInitialLoad = useRef(true);
    const prevMessageCount = useRef(0);
    const prevScrollHeight = useRef(0);
    const isFetching = useRef(false);

    // 1. Fetch all chats on mount
    useEffect(() => {
        dispatch(fetchAllChats());
    }, [dispatch]);

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
        socket.emit('joinChat', chatId);

        return () => {
            socket.emit('leaveChat', chatId);
        };
    }, [activeChat?._id]);

    // 3. Socket listener — admin can see live messages but not send
    useEffect(() => {
        const socket = socketRef.current;

        const handleNewMessage = (msg: any) => {
            if (activeChat && msg.chat === activeChat._id) {
                dispatch(addMessage(msg));
            }
        };

        socket.on('newMessage', handleNewMessage);
        return () => { socket.off('newMessage', handleNewMessage); };
    }, [activeChat?._id]);

    // 4. Smart scroll
    useEffect(() => {
        const container = messagesContainerRef.current;
        if (!container || messages.length === 0) return;

        const newCount = messages.length;
        const prevCount = prevMessageCount.current;

        if (isInitialLoad.current) {
            container.scrollTop = container.scrollHeight;
            isInitialLoad.current = false;
            prevMessageCount.current = newCount;
            return;
        }

        if (newCount > prevCount) {
            const added = newCount - prevCount;
            if (added === 1) {
                bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
            } else {
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
        prevScrollHeight.current = container.scrollHeight;

        const nextPage = page + 1;
        const result = await dispatch(
            fetchMessagesByChat({ chatId: activeChat._id, page: nextPage, limit: 10 } as any)
        );

        const fetched = (result.payload as any[]) ?? [];
        if (fetched.length === 0) {
            setHasMore(false);
        } else {
            setPage(nextPage);
        }

        setLoadingMore(false);
        isFetching.current = false;
    }, [activeChat?._id, hasMore, page, dispatch]);

    const handleSelectChat = (chat: any) => {
        if (activeChat?._id === chat._id) return;
        dispatch(setActiveChat(chat));
    };

    const filteredChats = chats.filter((c) => {
        const workerName = `${c.worker?.firstName} ${c.worker?.lastName}`.toLowerCase();
        const clientName = `${c.client?.firstName} ${c.client?.lastName}`.toLowerCase();
        return workerName.includes(search.toLowerCase()) || clientName.includes(search.toLowerCase());
    });

    const statusConfig = activeChat
        ? chatStatusConfig[activeChat.status] ?? chatStatusConfig.pending
        : null;

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-base md:text-lg lg:text-xl font-bold tracking-tight">Messages</h1>
                <p className="text-muted-foreground text-[10px] md:text-xs lg:text-sm">
                    View all conversations between clients and workers
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-200px)]">

                {/* ── Conversations List ── */}
                <Card className="md:col-span-1 md:py-3 py-3 lg:py-4 flex flex-col overflow-hidden">
                    <CardHeader className="pb-1 md:pb-1.5 lg:pb-2 shrink-0">
                        <CardTitle className="text-xs md:text-sm lg:text-base">All Conversations</CardTitle>
                        <div className="relative mt-1 md:mt-1.5">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-2.5 w-2.5 md:h-3 md:w-3 lg:h-4 lg:w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by worker or client..."
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
                                const isSelected = activeChat?._id === chat._id;
                                return (
                                    <div
                                        key={chat._id}
                                        onClick={() => handleSelectChat(chat)}
                                        className={`px-3 py-2.5 cursor-pointer hover:bg-muted/90 transition-colors border-b last:border-0 ${isSelected ? 'bg-muted border-l-2 border-l-primary' : ''}`}
                                    >
                                        <div className="flex items-center gap-2 md:gap-3 lg:gap-3.5 pl-2 md:pl-2 lg:pl-3">
                                            {/* Worker */}
                                            <div className="flex items-center gap-1.5 min-w-0">
                                                <Avatar className="h-6.5 w-6.5 md:h-7 md:w-7 shrink-0">
                                                    <AvatarFallback className="text-[8px] md:text-[9px] bg-blue-100 text-blue-700">
                                                        {chat.worker?.firstName?.[0]}{chat.worker?.lastName?.[0]}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0">
                                                    <p className="text-[11px] md:text-xs font-semibold truncate leading-tight">
                                                        {chat.worker?.firstName}
                                                    </p>
                                                </div>
                                            </div>
                                            <MessageSquareMore className='lg:w-5 lg:h-5 md:w-4.5 md:h-4.5 w-3.5 h-3.5 text-gray-600' />
                                            {/* Client */}
                                            <div className="flex items-center gap-1.5 min-w-0">
                                                <Avatar className="h-6.5 w-6.5 md:h-7 md:w-7 shrink-0">
                                                    <AvatarFallback className="text-[8px] md:text-[9px] bg-green-100 text-green-700">
                                                        {chat.client?.firstName?.[0]}{chat.client?.lastName?.[0]}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0">
                                                    <p className="text-[11px] md:text-xs font-semibold truncate leading-tight">
                                                        {chat.client?.firstName}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* ── Chat Area ── */}
                {activeChat ? (
                    <Card className="md:col-span-2 flex flex-col overflow-hidden py-0.5 md:py-1">

                        {/* Header */}
                        <div className="flex items-center justify-between px-3 md:px-3.5 lg:px-4 py-2 md:py-3 border-b shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="flex  flex-wrap flex-row items-center md:gap-4 gap-3.5 lg:gap-5">
                                    <div className="flex items-center gap-2">
                                        <div className='space-y-0.5'>
                                            <p className="text-[12px] md:text-[13px] lg:text-sm font-semibold leading-tight">
                                                {activeChat.worker?.firstName} {activeChat.worker?.lastName}
                                                <span className="text-muted-foreground font-normal"> (Worker)</span>
                                            </p>
                                            <p className="text-[9px] md:text-[10px] lg:text-[11px] text-muted-foreground leading-tight">
                                                {activeChat.worker?.email}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 ">
                                        <div className='space-y-0.5'>
                                            <p className="text-[12px] md:text-[13px] lg:text-sm font-semibold leading-tight">
                                                {activeChat.client?.firstName} {activeChat.client?.lastName}
                                                <span className="text-muted-foreground font-normal"> (Client)</span>
                                            </p>
                                            <p className="text-[9px] md:text-[10px] lg:text-[11px] text-muted-foreground leading-tight">
                                                {activeChat.client?.email}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {statusConfig && (
                                <Badge className={`text-[10px] md:text-[11px] lg:text-xs font-medium px-2 py-0.5 capitalize ${statusConfig.className}`}>
                                    {statusConfig.label}
                                </Badge>
                            )}
                        </div>

                        {/* Admin read-only notice */}
                        <div className="px-3 md:px-4 py-3 md:-mt-5.5 -mt-5.5 lg:-mt-5.5 flex items-start justify-center bg-yellow-50 border-b">
                            <p className="text-[10px] md:text-xs text-yellow-700">
                                👁 You are viewing this conversation as an admin. Messages are read-only.
                            </p>
                        </div>

                        {/* Content */}
                        <div
                            ref={messagesContainerRef}
                            className="flex-1 overflow-y-auto px-2.5 md:px-3 lg:px-4 py-2 md:py-2.5 lg:py-3"
                            onScroll={() => { handleScroll(); }}
                        >
                            {loadingMore && (
                                <div className="flex justify-center py-2">
                                    <span className="text-[9px] md:text-[10px] text-gray-700 bg-muted/70 px-3 py-1 rounded-full">
                                        Loading older messages...
                                    </span>
                                </div>
                            )}
                            {!hasMore && !loadingMore && messages.length > 0 && (
                                <div className="flex justify-center py-2">
                                    <span className="text-[9px] md:text-[10px] text-gray-700 bg-muted/70 px-3 py-1 rounded-full">
                                        Beginning of conversation
                                    </span>
                                </div>
                            )}

                            {loading ? (
                                <div className="flex items-center justify-center h-full text-muted-foreground text-xs md:text-sm">
                                    Loading messages...
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex items-center justify-center h-full text-muted-foreground text-xs md:text-sm">
                                    No messages in this conversation.
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {messages.map((msg, index) => {
                                        const isWorker = msg.sender._id === activeChat.worker?._id;
                                        const prevMsg = messages[index - 1];
                                        const showDateSeparator = !prevMsg ||
                                            new Date(msg.createdAt).toDateString() !==
                                            new Date(prevMsg.createdAt).toDateString();

                                        return (
                                            <div key={msg._id}>
                                                {showDateSeparator && (
                                                    <div className="flex justify-center my-2 md:my-3">
                                                        <span className="text-[8px] md:text-[9px] lg:text-[10px] text-gray-700 bg-muted/70 px-3 py-0.5 rounded-full">
                                                            {new Date(msg.createdAt).toLocaleDateString([], {
                                                                weekday: 'short', month: 'short', day: 'numeric',
                                                            })}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className={`flex flex-col ${isWorker ? 'items-end' : 'items-start'}`}>
                                                    {/* Sender label */}
                                                    <span className="text-[9px] text-muted-foreground px-1 mb-0.5">
                                                        {msg.sender.firstName} {msg.sender.lastName}
                                                        {' · '}
                                                        <span className="italic">
                                                            {isWorker ? 'Worker' : 'Client'}
                                                        </span>
                                                    </span>
                                                    <div className={`max-w-[70%] rounded-2xl px-3 py-2 ${isWorker
                                                        ? 'bg-blue-500 text-white rounded-br-sm'
                                                        : 'bg-muted rounded-bl-sm'
                                                        }`}>
                                                        <p className="text-xs md:text-[13px] lg:text-sm leading-relaxed break-words">
                                                            {msg.message}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-1 mt-0.5 px-1">
                                                        <span className="text-[8px] md:text-[9px] lg:text-[10px] text-muted-foreground">
                                                            {new Date(msg.createdAt).toLocaleTimeString([], {
                                                                hour: '2-digit', minute: '2-digit',
                                                            })}
                                                        </span>
                                                        {msg.read
                                                            ? <CheckCheck className="h-2.5 w-2.5 md:h-3 md:w-3 text-blue-400" />
                                                            : <Check className="h-2.5 w-2.5 md:h-3 md:w-3 text-muted-foreground" />
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={bottomRef} />
                                </div>
                            )}
                        </div>

                        {/* Read-only footer */}
                        <div className="border-t px-3 md:px-4 py-2 shrink-0">
                            <p className="text-[10px] md:text-xs text-center text-muted-foreground">
                                Admin view — messaging is disabled
                            </p>
                        </div>
                    </Card>
                ) : (
                    <Card className="md:col-span-2 flex flex-col items-center justify-center gap-2 text-gray-600 text-xs md:text-sm lg:text-base">
                        <Mail className="w-8 h-8 md:h-10 md:w-10 lg:h-12 lg:w-12 opacity-60" />
                        <p>Select a conversation to view messages</p>
                    </Card>
                )}
            </div>
        </div>
    );
}