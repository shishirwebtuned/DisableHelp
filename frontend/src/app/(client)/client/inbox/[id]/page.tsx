'use client';

import { useParams } from 'next/navigation';
import { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    Search,
    MoreVertical,
    Edit2,
    Trash2,
    Archive,
    Reply,
    Mail,
    Send
} from 'lucide-react';

// Mock messages data
const mockMessages = [
    {
        id: '1',
        sender: 'Sarah Worker',
        subject: "Tomorrow's Session Update",
        body: 'Hi Alice, just confirming I will be there at 9 AM tomorrow for our personal care session. See you then!',
        time: '9:15 AM',
        unread: true,
    },
    {
        id: '2',
        sender: 'Emma Wilson',
        subject: 'Service Agreement Questions',
        body: 'Hello! I noticed a small detail in the community support agreement we discussed. Could we have a quick chat about it?',
        time: 'Yesterday',
        unread: false,
    },
    {
        id: 'w2',
        sender: 'Platform Notification',
        subject: 'Payment Successful',
        body: 'Your payment for Invoice #INV-2045 has been processed successfully. Thank you!',
        time: '2 days ago',
        unread: false,
    }
];

export default function ClientInboxPage() {
    const params = useParams();
    const urlId = params?.id as string; // Extract ID from URL

    const [searchTerm, setSearchTerm] = useState('');
    const [replyText, setReplyText] = useState('');
    const [selectedMessage, setSelectedMessage] = useState<(typeof mockMessages)[0] | null>(null);

    // 1. Logic: Filter messages based on URL ID AND Search Term
    const filteredMessages = useMemo(() => {
        return mockMessages.filter((msg) => {
            const matchesId = urlId ? msg.id === urlId : true;
            const matchesSearch = 
                msg.sender.toLowerCase().includes(searchTerm.toLowerCase()) || 
                msg.subject.toLowerCase().includes(searchTerm.toLowerCase());
            
            return matchesId && matchesSearch;
        });
    }, [urlId, searchTerm]);

    // 2. Logic: Automatically select the first message in the filtered list
    useEffect(() => {
        if (filteredMessages.length > 0) {
            setSelectedMessage(filteredMessages[0]);
        } else {
            setSelectedMessage(null);
        }
    }, [filteredMessages]);

    return (
        <div className="h-[calc(100vh-180px)] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-xl font-bold tracking-tight">
                        {urlId ? `Conversation #${urlId}` : 'Messages'}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {urlId ? 'Viewing specific conversation' : 'Chat with your support workers and teams'}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                        <Archive className="h-4 w-4 mr-2" />
                        Archive
                    </Button>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Edit2 className="h-4 w-4 mr-2" />
                        New Message
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6 flex-1 overflow-hidden">
                {/* Inbox List (Left Column) */}
                <Card className="col-span-12 lg:col-span-4 flex flex-col border-none shadow-sm overflow-hidden">
                    <div className="p-4 border-b bg-muted/30">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="Search conversations..."
                                className="pl-10 h-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <ScrollArea className="flex-1">
                        <div className="divide-y">
                            {filteredMessages.length > 0 ? (
                                filteredMessages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        onClick={() => setSelectedMessage(msg)}
                                        className={`p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
                                            selectedMessage?.id === msg.id ? 'bg-muted border-l-4 border-blue-600' : ''
                                        }`}
                                    >
                                        <div className="flex gap-3">
                                            <Avatar className="h-10 w-10 border">
                                                <AvatarFallback>{msg.sender.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-0.5">
                                                    <h4 className={`text-sm font-semibold truncate ${msg.unread ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                        {msg.sender}
                                                    </h4>
                                                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">{msg.time}</span>
                                                </div>
                                                <p className={`text-xs font-medium truncate mb-0.5 ${msg.unread ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                    {msg.subject}
                                                </p>
                                                <p className="text-xs text-muted-foreground line-clamp-1">
                                                    {msg.body}
                                                </p>
                                            </div>
                                            {msg.unread && (
                                                <div className="mt-2 h-2 w-2 rounded-full bg-blue-600 flex-shrink-0" />
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-sm text-muted-foreground">
                                    No conversations found.
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </Card>

                {/* Message Detail / Chat View (Right Column) */}
                <Card className="col-span-12 lg:col-span-8 flex flex-col border-none shadow-sm overflow-hidden">
                    {selectedMessage ? (
                        <>
                            <div className="p-4 border-b flex items-center justify-between bg-muted/30">
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarFallback>{selectedMessage.sender.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="text-sm font-semibold">{selectedMessage.sender}</div>
                                        <div className="text-xs text-green-600 flex items-center gap-1">
                                            <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                            Online
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <Reply className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <ScrollArea className="flex-1 p-6">
                                <div className="space-y-6">
                                    <div className="flex flex-col items-center mb-4">
                                        <span className="text-[10px] bg-muted px-2 py-0.5 rounded text-muted-foreground uppercase font-bold tracking-wider">
                                            Earlier Today
                                        </span>
                                    </div>

                                    {/* Received Message Bubble */}
                                    <div className="flex gap-3 max-w-[85%]">
                                        <Avatar className="h-8 w-8 mt-1">
                                            <AvatarFallback>{selectedMessage.sender.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="space-y-1">
                                            <div className="bg-muted p-3 rounded-2xl rounded-tl-none text-sm">
                                                <p className="font-bold mb-1 text-xs text-blue-600">{selectedMessage.subject}</p>
                                                {selectedMessage.body}
                                            </div>
                                            <span className="text-[10px] text-muted-foreground ml-1">{selectedMessage.time}</span>
                                        </div>
                                    </div>

                                    {/* Sent Message Bubble */}
                                    <div className="flex flex-row-reverse gap-3 max-w-[85%] ml-auto">
                                        <Avatar className="h-8 w-8 mt-1">
                                            <AvatarFallback>ME</AvatarFallback>
                                        </Avatar>
                                        <div className="space-y-1 items-end flex flex-col">
                                            <div className="bg-blue-600 text-white p-3 rounded-2xl rounded-tr-none text-sm">
                                                Thanks for the update! Looking forward to it.
                                            </div>
                                            <span className="text-[10px] text-muted-foreground mr-1">9:30 AM &bull; Read</span>
                                        </div>
                                    </div>
                                </div>
                            </ScrollArea>

                            {/* Reply Input Area */}
                            <div className="p-4 border-t bg-muted/20">
                                <div className="flex gap-2 items-center">
                                    <Input
                                        placeholder="Type your message..."
                                        className="flex-1 bg-background h-10"
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') setReplyText('');
                                        }}
                                    />
                                    <Button
                                        size="icon"
                                        className="bg-blue-600 hover:bg-blue-700 h-10 w-10 shrink-0 shadow-lg"
                                        onClick={() => setReplyText('')}
                                    >
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="flex gap-4 mt-2 px-1">
                                    <button className="text-[10px] font-medium text-muted-foreground hover:text-blue-600 transition-colors">Attach File</button>
                                    <button className="text-[10px] font-medium text-muted-foreground hover:text-blue-600 transition-colors">Send Schedule</button>
                                    <button className="text-[10px] font-medium text-muted-foreground hover:text-blue-600 transition-colors">Templates</button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-12">
                            <Mail className="h-12 w-12 mb-4 opacity-20" />
                            <p className="text-sm">Select a conversation to start chatting</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}