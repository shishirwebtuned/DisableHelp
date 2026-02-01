'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Send, Paperclip, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';

export default function MessageDetailPage() {
    const params = useParams();
    const router = useRouter();
    const conversationId = params.id as string;
    const [newMessage, setNewMessage] = useState('');

    // Mock conversation data
    const conversation = {
        id: conversationId,
        participant: {
            name: conversationId === '1' ? 'Alice Freeman' : 'Bob Smith',
            role: 'Client',
            initials: conversationId === '1' ? 'AF' : 'BS',
        },
        messages: [
            {
                id: 1,
                content: 'Hi! I wanted to discuss the schedule for next week.',
                sender: 'them',
                timestamp: '2026-01-28T10:30:00',
            },
            {
                id: 2,
                content: 'Of course! What changes would you like to make?',
                sender: 'me',
                timestamp: '2026-01-28T10:35:00',
            },
            {
                id: 3,
                content: 'Can we shift Tuesday session to Wednesday?',
                sender: 'them',
                timestamp: '2026-01-28T10:40:00',
            },
            {
                id: 4,
                content: 'Yes, that works perfectly. I will update the schedule.',
                sender: 'me',
                timestamp: '2026-01-28T10:45:00',
            },
        ],
    };

    const handleSendMessage = () => {
        if (newMessage.trim()) {
            // TODO: Dispatch to Redux to send message
            console.log('Sending message:', newMessage);
            setNewMessage('');
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarFallback>{conversation.participant.initials}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="text-xl font-bold">{conversation.participant.name}</h1>
                            <p className="text-sm text-muted-foreground">
                                {conversation.participant.role}
                            </p>
                        </div>
                    </div>
                </div>
                <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                </Button>
            </div>

            <Card className="h-[calc(100vh-300px)] flex flex-col">
                <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
                    {conversation.messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[70%] rounded-lg p-3 ${
                                    message.sender === 'me'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted'
                                }`}
                            >
                                <p className="text-sm">{message.content}</p>
                                <p
                                    className={`text-xs mt-1 ${
                                        message.sender === 'me'
                                            ? 'text-primary-foreground/70'
                                            : 'text-muted-foreground'
                                    }`}
                                >
                                    {format(new Date(message.timestamp), 'HH:mm')}
                                </p>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4">
                    <div className="flex items-end gap-2">
                        <Button variant="ghost" size="icon">
                            <Paperclip className="h-5 w-5" />
                        </Button>
                        <Textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="min-h-[60px] resize-none"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage();
                                }
                            }}
                        />
                        <Button onClick={handleSendMessage} size="icon">
                            <Send className="h-5 w-5" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
