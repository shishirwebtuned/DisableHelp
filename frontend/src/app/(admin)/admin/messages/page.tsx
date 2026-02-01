'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Search,
    MoreVertical,
    Edit2,
    Trash2,
    Flag,
    Archive,
    Reply,
    Forward,
    Filter,
    MailOpen,
    Mail
} from 'lucide-react';

// Mock messages data
const mockMessages = [
    {
        id: '1',
        sender: 'Sarah Worker',
        subject: 'Inquiry about Agreement AGR-1002',
        body: 'Hello, I have a question regarding the nursing support hours listed in the new agreement template...',
        time: '10:30 AM',
        unread: true,
        category: 'Inquiry',
    },
    {
        id: '2',
        sender: 'Alice Freeman',
        subject: 'Document Verification Status',
        body: 'I uploaded my new NDIS screening documents yesterday. Could you please check if they are valid?',
        time: 'Yesterday',
        unread: false,
        category: 'Verification',
    },
    {
        id: '3',
        sender: 'System Alert',
        subject: 'New User Registration',
        body: 'A new Support Worker has registered and is awaiting initial profile review.',
        time: '2 days ago',
        unread: false,
        category: 'Alert',
    },
    {
        id: '4',
        sender: 'Bob Smith',
        subject: 'Payment Dispute - Invoice #INV-552',
        body: 'There seems to be an error in the billing for the morning shift on Jan 15th...',
        time: '3 days ago',
        unread: true,
        category: 'Support',
    }
];

export default function AdminMessagesPage() {
    const [selectedMessage, setSelectedMessage] = useState(mockMessages[0]);
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <div className="h-[calc(100vh-180px)]">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Messages</h1>
                    <p className="text-muted-foreground">Manage communications and support requests</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                        <Archive className="h-4 w-4 mr-2" />
                        Archive
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700 size-sm">
                        <Edit2 className="h-4 w-4 mr-2" />
                        Compose
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6 h-full">
                {/* Inbox List */}
                <Card className="col-span-12 lg:col-span-4 flex flex-col h-full border-none shadow-sm overflow-hidden">
                    <div className="p-4 border-b bg-muted/30">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="Search messages..."
                                className="pl-10 h-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <ScrollArea className="flex-1">
                        <div className="divide-y">
                            {mockMessages.map((msg) => (
                                <div
                                    key={msg.id}
                                    onClick={() => setSelectedMessage(msg)}
                                    className={`p-4 cursor-pointer transition-colors hover:bg-muted/50 ${selectedMessage.id === msg.id ? 'bg-muted border-l-4 border-blue-600' : ''
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className={`text-sm font-semibold truncate ${msg.unread ? 'text-foreground' : 'text-muted-foreground'}`}>
                                            {msg.sender}
                                        </h4>
                                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">{msg.time}</span>
                                    </div>
                                    <p className={`text-xs font-medium truncate mb-1 ${msg.unread ? 'text-foreground' : 'text-muted-foreground'}`}>
                                        {msg.subject}
                                    </p>
                                    <p className="text-xs text-muted-foreground line-clamp-1">
                                        {msg.body}
                                    </p>
                                    <div className="mt-2 flex items-center justify-between">
                                        <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4 font-normal">
                                            {msg.category}
                                        </Badge>
                                        {msg.unread && <div className="h-2 w-2 rounded-full bg-blue-600" />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </Card>

                {/* Message Detail */}
                <Card className="col-span-12 lg:col-span-8 flex flex-col h-full border-none shadow-sm overflow-hidden">
                    {selectedMessage ? (
                        <>
                            <div className="p-4 border-b flex items-center justify-between bg-muted/30">
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarFallback>{selectedMessage.sender.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="text-sm font-semibold">{selectedMessage.sender}</div>
                                        <div className="text-xs text-muted-foreground">{selectedMessage.category} Request</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <Reply className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <ScrollArea className="flex-1 p-6">
                                <h2 className="text-xl font-bold mb-4">{selectedMessage.subject}</h2>
                                <div className="text-sm text-muted-foreground mb-6 flex items-center gap-2">
                                    <span>From: <b>{selectedMessage.sender}</b></span>
                                    <span>&bull;</span>
                                    <span>Received: {selectedMessage.time}</span>
                                </div>
                                <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed">
                                    <p>{selectedMessage.body}</p>
                                    <p>I would appreciate it if you could look into this at your earliest convenience. Thank you for your support.</p>
                                    <p>Best regards,<br />{selectedMessage.sender}</p>
                                </div>
                            </ScrollArea>
                            <div className="p-4 border-t bg-muted/30">
                                <div className="flex gap-2">
                                    <Button className="bg-blue-600 hover:bg-blue-700 flex-1">
                                        <Reply className="h-4 w-4 mr-2" />
                                        Reply
                                    </Button>
                                    <Button variant="outline" className="flex-1">
                                        <Forward className="h-4 w-4 mr-2" />
                                        Forward
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-12">
                            <Mail className="h-12 w-12 mb-4 opacity-20" />
                            <p>Select a message to view its content</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
