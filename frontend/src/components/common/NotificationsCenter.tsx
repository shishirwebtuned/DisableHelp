'use client';

import { useEffect, useState } from 'react';
import { Bell, CheckCheck, Trash2, Briefcase, DollarSign, MessageSquare, UserCheck, AlertCircle, Calendar, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import {
    fetchNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    addNotification,
} from '@/redux/slices/notificationSlice';
import { getSocket } from '@/lib/socket';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import { Dropdown } from 'react-day-picker';

const getIcon = (type: string) => {
    switch (type) {
        case 'job': return <Briefcase className="h-4 w-4" />;
        case 'invoice': return <DollarSign className="h-4 w-4" />;
        case 'message': return <MessageSquare className="h-4 w-4" />;
        case 'agreement': return <UserCheck className="h-4 w-4" />;
        case 'system': return <AlertCircle className="h-4 w-4" />;
        default: return <Bell className="h-4 w-4" />;
        case 'session': return <Calendar className="h-4 w-4" />;
        case 'application': return <FileText className="h-4 w-4" />;
    }
};


const getIconColor = (type: string) => {
    switch (type) {
        case 'job': return 'text-blue-600';
        case 'invoice': return 'text-green-600';
        case 'message': return 'text-purple-600';
        case 'agreement': return 'text-indigo-600';
        case 'system': return 'text-orange-600';
        case 'session': return 'text-red-600';
        case 'application': return 'text-yellow-600';
        default: return 'text-gray-600';
    }
};

export default function NotificationsCenter() {
    const dispatch = useDispatch<AppDispatch>();
    const { items: notifications, unreadCount, loading } = useSelector(
        (s: RootState) => s.notifications
    );

    const [open, setOpen] = useState(false);

    useEffect(() => {
        dispatch(fetchNotifications());
    }, [dispatch]);

    const router = useRouter();
    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-[380px]">
                <div className="flex items-center justify-between px-4 py-3 border-b">
                    <div>
                        <h3 className="font-semibold">Notifications</h3>
                        <p className="text-xs text-muted-foreground">
                            {unreadCount > 0
                                ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
                                : 'All caught up!'}
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => dispatch(markAllNotificationsRead())}
                            className="text-xs"
                        >
                            <CheckCheck className="h-4 w-4 mr-1" />
                            Mark all read
                        </Button>
                    )}
                </div>

                <ScrollArea className="h-[400px]">
                    {loading ? (
                        <div className="py-8 text-center text-sm text-muted-foreground">
                            Loading...
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="py-8 text-center text-sm text-muted-foreground">
                            <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
                            No notifications yet
                        </div>
                    ) : (
                        <div>
                            {notifications.map((notification: any) => (
                                <div
                                    key={notification._id}
                                    className={`px-4 py-3 border-b hover:bg-muted/50 cursor-pointer transition-colors ${!notification.read ? 'bg-muted/30' : ''}`}
                                    onClick={() => {
                                        if (!notification.read) {
                                            dispatch(markNotificationRead(notification._id));
                                        }
                                        if (notification.actionUrl) {
                                            router.push(notification.actionUrl);
                                        }
                                        setOpen(false);
                                    }}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 ${getIconColor(notification.type)}`}>
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
                                            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                                {notification.message}
                                            </p>
                                            <div className="flex items-center justify-between mt-1.5">
                                                <span className="text-[10px] text-muted-foreground">
                                                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 px-2"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        dispatch(deleteNotification(notification._id));
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

                {/* <DropdownMenuSeparator /> */}
                {/* <div className="px-4 py-2">
                    <Button variant="ghost" className="w-full text-sm" size="sm">
                        View All Notifications
                    </Button>
                </div> */}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}