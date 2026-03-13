'use client';

import { useState, useMemo, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import {
    cancelScheduleItem,
    confirmScheduleItem,
} from '@/redux/slices/scheduleSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
    Calendar as CalendarIcon,
    Clock,
    User,
    MapPin,
    CheckCircle2,
    Video,
    MoreVertical,
    Filter,
    Search,
    Inbox,
    FileText
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { fetchSessionsByUser } from '@/redux/slices/sessionsSlice';


type Status = "scheduled" | "in-progress" | "completed" | "cancelled";

interface StatusBadgeProps {
    status: Status | string;
    className?: string;
}

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
    const base =
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize";

    const variants: Record<string, string> = {
        scheduled: "bg-blue-100 text-blue-700 border border-blue-200",
        "in-progress": "bg-yellow-100 text-yellow-700 border border-yellow-200",
        completed: "bg-green-100 text-green-700 border border-green-200",
        cancelled: "bg-red-100 text-red-700 border border-red-200",
    };

    const style = variants[status] || "bg-gray-100 text-gray-600 border";

    return (
        <span className={cn(base, style, className)}>
            {status?.replace("-", " ")}
        </span>
    );
};

export default function WorkerSchedulePage() {
    const router = useRouter();

    const dispatch = useAppDispatch();
    const { items: sessions, loading } = useAppSelector((state) => state.sessions);


    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>("all");

    useEffect(() => {
        dispatch(fetchSessionsByUser());
    }, [dispatch]);

    const filteredSessions = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();

        return sessions.filter(session => {
            const sessionDate = new Date(session.date);

            const firstName = session.client?.firstName?.toLowerCase() || "";
            const lastName = session.client?.lastName?.toLowerCase() || "";
            const jobTitle = session.job?.title?.toLowerCase() || "";

            const matchesSearch =
                firstName.includes(term) ||
                lastName.includes(term) ||
                `${firstName} ${lastName}`.includes(term) ||
                jobTitle.includes(term);

            let dateFilter = true;
            if (selectedDate) {
                dateFilter = sessionDate.getDate() === selectedDate.getDate() &&
                    sessionDate.getMonth() === selectedDate.getMonth() &&
                    sessionDate.getFullYear() === selectedDate.getFullYear();
            } else {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                dateFilter = sessionDate >= today;
            }

            const matchesStatus =
                statusFilter === "all" || session.status === statusFilter;

            return matchesSearch && dateFilter && matchesStatus;
        });
    }, [sessions, selectedDate, searchTerm, statusFilter]);

    const nextShift = useMemo(() => {
        const now = new Date();
        return [...sessions]
            .filter(s => new Date(s.date) >= now && s.status !== 'cancelled' && s.status !== "completed")
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
    }, [sessions]);

    const handleDateSelect = (date: Date | undefined) => {
        setSelectedDate(date);
    };

    const handleCancelShift = async (id: string) => {
        if (confirm('Are you sure you want to cancel this shift?')) {
            await dispatch(cancelScheduleItem({ id, reason: 'Worker requested cancellation' }));
        }
    };

    const handleConfirmShift = async (id: string) => {
        await dispatch(confirmScheduleItem(id));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold tracking-tight">My Sessions</h1>
                    {/* <p className="text-muted-foreground">Manage your upcoming shifts and client sessions</p> */}
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        Month View
                    </Button>
                    <Button className="">
                        Find More Jobs
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
                {/* Left Sidebar */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <div className=" border-none shadow-sm">
                        <CalendarComponent
                            mode="single"
                            selected={selectedDate}
                            onSelect={handleDateSelect}
                            className="rounded-md border-none w-full"
                        />
                    </div>

                    {nextShift && (
                        <Card className="p-3 md:p-4 border-none shadow-sm bg-gradient-to-br from-blue-400 to-indigo-500 text-white">
                            <h4 className="font-bold mb-3 flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5" />
                                Your Next Session
                            </h4>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-indigo-100 text-xs uppercase tracking-wider font-bold">Client</p>
                                    <p className="text-lg font-bold">{`${nextShift.client.firstName} ${nextShift.client.lastName}`}</p>
                                </div>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-indigo-100 text-xs uppercase tracking-wider font-bold">Time</p>
                                        <p className="font-medium">{new Date(nextShift.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                    {/* <Badge className="bg-white/20 text-white border-none">{nextShift.type}</Badge> */}
                                </div>
                                <Button variant="secondary" size="sm" className="w-full mt-2 bg-white text-indigo-700 hover:bg-white/90 border-none font-bold">
                                    Shift Details
                                </Button>
                            </div>
                        </Card>
                    )}
                </div>

                {/* Right Content */}
                <div className="col-span-12 lg:col-span-8 space-y-4">
                    <div className="border-none ">
                        <CardContent className="p-4 flex gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <Input
                                    placeholder="Search by client or service..."
                                    className="pl-10 bg-white"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="font-bold text-lg">
                                {!selectedDate
                                    ? "Upcoming Schedule"
                                    : selectedDate?.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' }) === new Date().toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })
                                        ? "Upcoming Schedule"
                                        : `Schedule for ${selectedDate?.toLocaleDateString([], { month: 'short', day: 'numeric' })}`}
                            </h3>
                            <Badge variant="outline" className="text-xs font-normal">
                                {filteredSessions.length} {filteredSessions.length === 1 ? 'Session' : 'Sessions'} found
                            </Badge>
                        </div>

                        {filteredSessions.length > 0 ? (
                            filteredSessions.map((session) => {
                                const shiftDate = new Date(session.date);
                                return (
                                    <div key={session._id} className="group hover:border-indigo-500/50 transition-all border-none shadow-sm">
                                        <CardContent className="p-5">
                                            <div className="flex justify-between items-start">
                                                <div className="flex gap-5">
                                                    <div className="flex flex-col items-center justify-center h-14 w-14 rounded-2xl bg-indigo-50 text-indigo-600">
                                                        <span className="text-xl font-black">{shiftDate.getDate()}</span>
                                                        <span className="text-[10px] uppercase font-bold">{shiftDate.toLocaleDateString([], { month: 'short' })}</span>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-3">
                                                            <h4 className="font-bold text-base">{session.job.title}</h4>
                                                            <StatusBadge status={session.status} className="text-[10px] py-0 h-4 font-bold uppercase tracking-wider" />
                                                        </div>
                                                        <div className="flex flex-wrap gap-y-1 gap-x-4 text-sm text-muted-foreground mt-1">
                                                            <div className="flex items-center gap-1.5">
                                                                <User className="h-3.5 w-3.5 text-blue-500" />
                                                                <span className="font-medium text-slate-700 dark:text-slate-300">{session.client.firstName} {session.client.lastName}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                <Clock className="h-3.5 w-3.5" />
                                                                <span>{shiftDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({session.durationMinutes})</span>
                                                            </div>
                                                            {/* <div className="flex items-center gap-1.5">
                                                                {session. === 'remote' ? <Video className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
                                                                <span>{session.location}</span>
                                                            </div> */}
                                                        </div>
                                                    </div>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        {/* <DropdownMenuItem className="flex items-center gap-2">
                                                            <FileText className="h-4 w-4" /> Case Notes
                                                        </DropdownMenuItem> */}
                                                        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer" onClick={() => router.push(`/profile/${session.client._id}`)}>
                                                            <User className="h-4 w-4" /> Client Profile
                                                        </DropdownMenuItem>
                                                        {/* {session.status === 'scheduled' && (
                                                            <DropdownMenuItem onClick={() => handleConfirmShift(session._id)} className="flex items-center gap-2">
                                                                <CheckCircle2 className="h-4 w-4" /> Confirm Shift
                                                            </DropdownMenuItem>
                                                        )} */}
                                                        <DropdownMenuItem onClick={() => handleCancelShift(session._id)} className="text-destructive">
                                                            Cancel Session
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </CardContent>
                                    </div>
                                )
                            })
                        ) : (
                            <Card className="h-64 flex flex-col items-center justify-center p-12 text-center text-muted-foreground border-dashed border-2 bg-transparent">
                                <Inbox className="h-12 w-12 mb-4 opacity-20" />
                                <h3 className="text-lg font-medium">No jobs scheduled</h3>
                                <p className="max-w-xs text-sm">You have no shifts booked for this date.</p>
                                <Button variant="outline" className="mt-4" onClick={() => setSelectedDate(new Date())}>Back to Today</Button>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
