'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Send, Search } from 'lucide-react';
import { useState } from 'react';

export default function WorkerInboxPage() {
    const [selectedConversation, setSelectedConversation] = useState<string | null>('c1');

    const conversations = [
        {
            id: 'c1',
            participant: 'Alice Freeman',
            avatar: 'https://ui.shadcn.com/avatars/01.png',
            lastMessage: 'Thanks for the update!',
            timestamp: '10:30 AM',
            unread: 2,
        },
        {
            id: 'c2',
            participant: 'Bob Smith',
            avatar: 'https://ui.shadcn.com/avatars/02.png',
            lastMessage: 'Can we reschedule tomorrow?',
            timestamp: 'Yesterday',
            unread: 0,
        },
        {
            id: 'c3',
            participant: 'Platform Admin',
            avatar: 'https://ui.shadcn.com/avatars/03.png',
            lastMessage: 'Your invoice has been approved',
            timestamp: '2 days ago',
            unread: 0,
        },
    ];

    const messages = [
        { id: 1, sender: 'Alice Freeman', content: 'Hi Sarah, how are you?', timestamp: '10:15 AM', isOwn: false },
        { id: 2, sender: 'You', content: 'Hi Alice! I\'m doing well, thanks for asking.', timestamp: '10:20 AM', isOwn: true },
        { id: 3, sender: 'Alice Freeman', content: 'Great! Just wanted to confirm our session tomorrow at 2 PM.', timestamp: '10:25 AM', isOwn: false },
        { id: 4, sender: 'You', content: 'Yes, confirmed! See you tomorrow.', timestamp: '10:28 AM', isOwn: true },
        { id: 5, sender: 'Alice Freeman', content: 'Thanks for the update!', timestamp: '10:30 AM', isOwn: false },
    ];

    return (
        <div className="space-y-2">
            <div>
                <h1 className="text-xl font-bold tracking-tight">Messages</h1>
                <p className="text-muted-foreground">Communicate with clients and admins</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
                {/* Conversations List */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-lg">Conversations</CardTitle>
                        <div className="relative mt-2">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search messages..." className="pl-10" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ScrollArea className="h-[500px]">
                            {conversations.map((conv) => (
                                <div
                                    key={conv.id}
                                    className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors border-b ${selectedConversation === conv.id ? 'bg-muted' : ''
                                        }`}
                                    onClick={() => setSelectedConversation(conv.id)}
                                >
                                    <Avatar>
                                        <AvatarImage src={conv.avatar} />
                                        <AvatarFallback>{conv.participant[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <div className="font-medium truncate">{conv.participant}</div>
                                            <div className="text-xs text-muted-foreground">{conv.timestamp}</div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm text-muted-foreground truncate">{conv.lastMessage}</div>
                                            {conv.unread > 0 && (
                                                <Badge variant="default" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                                                    {conv.unread}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* Chat Area */}
                <Card className="md:col-span-2 flex flex-col">
                    <CardHeader className="border-b">
                        <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarImage src="https://ui.shadcn.com/avatars/01.png" />
                                <AvatarFallback>AF</AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className="text-lg">Alice Freeman</CardTitle>
                                <CardDescription className="text-xs">Active now</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 p-4">
                        <ScrollArea className="h-[400px] pr-4">
                            <div className="space-y-4">
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[70%] rounded-lg p-3 ${message.isOwn
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-muted'
                                                }`}
                                        >
                                            <p className="text-sm">{message.content}</p>
                                            <p className={`text-xs mt-1 ${message.isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                                                }`}>
                                                {message.timestamp}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                    <div className="border-t p-4">
                        <div className="flex gap-2">
                            <Input placeholder="Type your message..." className="flex-1" />
                            <Button size="icon">
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            <Badge variant="outline" className="text-xs">Note:</Badge> Admin can view all conversations for compliance
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
}
