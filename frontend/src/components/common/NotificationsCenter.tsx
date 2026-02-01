'use client';

import { useState } from 'react';
import { Bell, Check, CheckCheck, Trash2, Briefcase, DollarSign, MessageSquare, UserCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Notification {
    id: string;
    type: 'job' | 'invoice' | 'message' | 'agreement' | 'system';
    title: string;
    message: string;
    time: string;
    read: boolean;
    actionUrl?: string;
}

export default function NotificationsCenter() {
    const [notifications, setNotifications] = useState<Notification[]>([
        {
            id: '1',
            type: 'job',
            title: 'New Job Match',
            message: 'A new job matching your skills is available in your area',
            time: '5 minutes ago',
            read: false,
        },
        {
            id: '2',
            type: 'invoice',
            title: 'Invoice Approved',
            message: 'Your invoice #INV-2026-042 has been approved for payment',
            time: '1 hour ago',
            read: false,
        },
        {
            id: '3',
            type: 'message',
            title: 'New Message',
            message: 'John Client sent you a message',
            time: '2 hours ago',
            read: true,
        },
        {
            id: '4',
            type: 'agreement',
            title: 'Agreement Signed',
            message: 'Emily Anderson has signed the service agreement',
            time: '1 day ago',
            read: true,
        },
        {
            id: '5',
            type: 'system',
            title: 'Profile Update Required',
            message: 'Your NDIS Worker Screening expires in 30 days. Please update.',
            time: '2 days ago',
            read: false,
        },
    ]);

    const unreadCount = notifications.filter((n) => !n.read).length;

    const getIcon = (type: string) => {
        switch (type) {
            case 'job':
                return <Briefcase className="h-4 w-4" />;
            case 'invoice':
                return <DollarSign className="h-4 w-4" />;
            case 'message':
                return <MessageSquare className="h-4 w-4" />;
            case 'agreement':
                return <UserCheck className="h-4 w-4" />;
            case 'system':
                return <AlertCircle className="h-4 w-4" />;
            default:
                return <Bell className="h-4 w-4" />;
        }
    };

    const getIconColor = (type: string) => {
        switch (type) {
            case 'job':
                return 'text-blue-600';
            case 'invoice':
                return 'text-green-600';
            case 'message':
                return 'text-purple-600';
            case 'agreement':
                return 'text-indigo-600';
            case 'system':
                return 'text-orange-600';
            default:
                return 'text-gray-600';
        }
    };

    const markAsRead = (id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
    };

    const markAllAsRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    const deleteNotification = (id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                            {unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[380px]">
                <div className="flex items-center justify-between px-4 py-3 border-b">
                    <div>
                        <h3 className="font-semibold">Notifications</h3>
                        <p className="text-xs text-muted-foreground">
                            You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={markAllAsRead}
                            className="text-xs"
                        >
                            <CheckCheck className="h-4 w-4 mr-1" />
                            Mark all read
                        </Button>
                    )}
                </div>

                <ScrollArea className="h-[400px]">
                    {notifications.length === 0 ? (
                        <div className="py-8 text-center text-sm text-muted-foreground">
                            No notifications
                        </div>
                    ) : (
                        <div>
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`px-4 py-3 border-b hover:bg-muted/50 cursor-pointer transition-colors ${
                                        !notification.read ? 'bg-muted/30' : ''
                                    }`}
                                    onClick={() => markAsRead(notification.id)}
                                >
                                    <div className="flex items-start gap-3">
                                        <div
                                            className={`h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 ${getIconColor(
                                                notification.type
                                            )}`}
                                        >
                                            {getIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <h4 className="text-sm font-semibold truncate">
                                                    {notification.title}
                                                </h4>
                                                {!notification.read && (
                                                    <div className="h-2 w-2 rounded-full bg-blue-600 flex-shrink-0 mt-1" />
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                                {notification.message}
                                            </p>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-xs text-muted-foreground">
                                                    {notification.time}
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 px-2"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteNotification(notification.id);
                                                    }}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                <DropdownMenuSeparator />
                <div className="px-4 py-2">
                    <Button variant="ghost" className="w-full text-sm" size="sm">
                        View All Notifications
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
