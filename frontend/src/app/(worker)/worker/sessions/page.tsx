'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import {
    fetchSessionsByUser,
    rescheduleSession,
} from '@/redux/slices/sessionsSlice';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
    Calendar,
    Clock,
    User,
    CheckCircle2,
    MoreVertical,
    Filter,
    Search,
    Inbox,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';
import Loading from '@/components/ui/loading';
import { cn } from '@/lib/utils';

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

export default function WorkerSessionsPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { items: sessions = [], loading } = useAppSelector((state) => state.sessions);
    const { items: services = [], loading: servicesLoading } = useAppSelector((state) => state.services);

    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | 'reschedule'>('create');
    const [editingSession, setEditingSession] = useState<any>(null);

    const [statusFilter, setStatusFilter] = useState<string>("all");

    // Form state for new/edit session
    const [formData, setFormData] = useState({
        clientName: '',
        clientId: '',
        serviceId: '',
        date: '',
        time: '',
        duration: '1 hour',
        location: '',
        mode: 'onsite' as 'onsite' | 'remote'
    });

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

    const openForCreate = () => {
        setDrawerMode('create');
        setEditingSession(null);
        setFormData({
            clientName: '',
            clientId: '',
            serviceId: services && services.length > 0 ? services[0]._id : '',
            date: '',
            time: '',
            duration: '1 hour',
            location: '',
            mode: 'onsite'
        });
        setIsDrawerOpen(true);
    };

    const openForEdit = (session: any) => {
        setDrawerMode('edit');
        setEditingSession(session);
        const sessionDate = new Date(session.date);
        // determine serviceId: prefer explicit serviceId, else try to match session.type to a service
        let serviceId = session.serviceId ?? '';
        if (!serviceId && session.type) {
            const found = services.find((s: any) => s._id === session.type || s.name === session.type);
            serviceId = found ? found._id : '';
        }
        setFormData({
            clientName: session.clientName,
            clientId: session.clientId,
            serviceId,
            date: format(sessionDate, 'yyyy-MM-dd'),
            time: format(sessionDate, 'HH:mm'),
            duration: session.duration,
            location: session.location,
            mode: session.mode
        });
        setIsDrawerOpen(true);
    };

    const openForReschedule = (session: any) => {
        setDrawerMode('reschedule');
        setEditingSession(session);
        const sessionDate = new Date(session.date);
        let serviceId = session.serviceId ?? '';
        if (!serviceId && session.type) {
            const found = services.find((s: any) => s._id === session.type || s.name === session.type);
            serviceId = found ? found._id : '';
        }
        setFormData({
            clientName: session.clientName,
            clientId: session.clientId,
            serviceId,
            date: format(sessionDate, 'yyyy-MM-dd'),
            time: format(sessionDate, 'HH:mm'),
            duration: session.duration,
            location: session.location,
            mode: session.mode
        });
        setIsDrawerOpen(true);
    };

    const handleSubmit = async () => {
        if (!formData.date || !formData.time) return;

        const [year, month, day] = formData.date.split('-').map(Number);
        const [hour, minute] = formData.time.split(':').map(Number);
        const sessionDateTime = new Date(year, month - 1, day, hour, minute).toISOString();

        if (drawerMode === 'create') {

        } else if (drawerMode === 'edit' && editingSession) {

        } else if (drawerMode === 'reschedule' && editingSession) {
            await dispatch(rescheduleSession({
                id: editingSession.id,
                date: sessionDateTime
            }));
        }

        setIsDrawerOpen(false);
    };

    // const handleCancelSession = async (id: string) => {
    //     await dispatch(cancelSession(id));
    // };

    const nextSession = useMemo(() => {
        const now = new Date();
        return [...sessions]
            .filter(s => new Date(s.date) >= now && s.status !== 'cancelled' && s.status !== "completed")
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
    }, [sessions]);

    return (
        <>
            {
                (loading || servicesLoading) && <Loading />
            }

            <div className="space-y-6">

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="md:text-[19px] text-lg lg:text-xl font-bold tracking-tight">Support Sessions</h1>
                    </div>

                    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} direction="right">
                        {/* <Button onClick={openForCreate} className="">
                            <Plus className="h-4 w-4 mr-2" />
                            Book New Session
                        </Button> */}
                        <DrawerContent>
                            <DrawerHeader>
                                <DrawerTitle className="text-2xl font-bold">
                                    {drawerMode === 'create' && 'Book a New Session'}
                                    {drawerMode === 'edit' && 'Edit Session'}
                                    {drawerMode === 'reschedule' && 'Reschedule Session'}
                                </DrawerTitle>
                                <DrawerDescription>
                                    {drawerMode === 'create' && 'Schedule a new support session with your preferred client.'}
                                    {drawerMode === 'edit' && 'Update the details of your session.'}
                                    {drawerMode === 'reschedule' && 'Choose a new date and time for your session.'}
                                </DrawerDescription>
                            </DrawerHeader>
                            <div className="overflow-y-auto px-6 space-y-4 pb-6">
                                <div className="space-y-6">
                                    <Label htmlFor="client">Select Client</Label>
                                    <Select
                                        value={formData.clientName}
                                        onValueChange={(val) => setFormData({ ...formData, clientName: val })}
                                        disabled={drawerMode === 'reschedule'}
                                    >
                                        <SelectTrigger id="client" className='w-full'>
                                            <SelectValue placeholder="Choose a client" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Sarah Client">Sarah Client</SelectItem>
                                            <SelectItem value="John Smith">John Smith</SelectItem>
                                            <SelectItem value="Emma Wilson">Emma Wilson</SelectItem>
                                            <SelectItem value="Michael Brown">Michael Brown</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-6">
                                        <Label htmlFor="date">Date</Label>
                                        <DatePicker
                                            date={formData.date ? new Date(formData.date) : undefined}
                                            setDate={(date) => setFormData({ ...formData, date: date ? format(date, 'yyyy-MM-dd') : '' })}
                                            placeholder="Select date"
                                        />
                                    </div>
                                    <div className="space-y-6">
                                        <Label htmlFor="time">Time</Label>
                                        <Input
                                            id="time"
                                            type="time"
                                            value={formData.time}
                                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                        />
                                    </div>
                                </div>
                                {drawerMode !== 'reschedule' && (
                                    <>
                                        <div className="space-y-6">
                                            <Label htmlFor="type">Service Type</Label>
                                            <Select
                                                value={formData.serviceId}
                                                onValueChange={(val) => setFormData({ ...formData, serviceId: val })}
                                            >
                                                <SelectTrigger id="type" className='w-full'>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {services && services.length > 0 ? (
                                                        services.map((s: any) => (
                                                            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                                        ))
                                                    ) : (
                                                        [
                                                            'Personal Care',
                                                            'Community Support',
                                                            'Transport',
                                                            'Domestic Aid',
                                                            'Therapy Session'
                                                        ].map((name) => (
                                                            <SelectItem key={name} value={name}>{name}</SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-6">
                                            <Label htmlFor="duration">Duration</Label>
                                            <Select
                                                value={formData.duration}
                                                onValueChange={(val) => setFormData({ ...formData, duration: val })}
                                            >
                                                <SelectTrigger id="duration" className='w-full'>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="30 mins">30 minutes</SelectItem>
                                                    <SelectItem value="1 hour">1 hour</SelectItem>
                                                    <SelectItem value="2 hours">2 hours</SelectItem>
                                                    <SelectItem value="3 hours">3 hours</SelectItem>
                                                    <SelectItem value="4 hours">4 hours</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-6">
                                            <Label htmlFor="location">Location</Label>
                                            <Input
                                                id="location"
                                                placeholder="Enter address or 'Home'"
                                                value={formData.location}
                                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                            <DrawerFooter>
                                <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
                                    {drawerMode === 'create' && 'Confirm Booking'}
                                    {drawerMode === 'edit' && 'Update Session'}
                                    {drawerMode === 'reschedule' && 'Reschedule'}
                                </Button>
                                <DrawerClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                </DrawerClose>
                            </DrawerFooter>
                        </DrawerContent>
                    </Drawer>
                </div>

                <div className="grid grid-cols-12 gap-6">
                    {/* Left Sidebar - Calendar & Quick Info */}
                    <div className="col-span-12 lg:col-span-4 space-y-6">
                        <div className="border-none shadow-sm rounded-lg">

                            <CalendarComponent
                                mode="single"
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                className="rounded-lg border-none w-full"
                            />
                        </div>

                        {nextSession && (
                            <Card className="p-3 md:p-4 border-none shadow-sm bg-gradient-to-br from-blue-400 to-indigo-500 text-white">
                                <h4 className="font-bold mb-1 flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5" />
                                    Your Next Session
                                </h4>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-blue-100 text-xs uppercase tracking-wider font-bold">Time & Date</p>
                                        <p className="font-medium">{new Date(nextSession?.date).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                                        <p className="text-lg font-bold">{new Date(nextSession?.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                    <div className="pt-2 border-t border-white/20">
                                        <p className="text-blue-100 text-xs uppercase tracking-wider font-bold">Client</p>
                                        <div className="font-medium flex items-center gap-2 mt-1">
                                            <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                                                {`${nextSession.client?.firstName?.[0] ?? ""} ${nextSession.client?.lastName?.[0] ?? ""}`}
                                            </div>
                                            <p>
                                                {`${nextSession?.client?.firstName}  ${nextSession?.client?.lastName}`}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="w-full mt-1 bg-white text-blue-700 hover:bg-white/90 border-none font-bold"
                                        onClick={() => nextSession?.client?._id && router.push(`/profile/${nextSession?.client?._id}`)}
                                    >
                                        View Client Profile
                                    </Button>
                                </div>
                            </Card>
                        )}
                    </div>

                    {/* Right Content - Sessions List */}
                    <div className="col-span-12 lg:col-span-8 flex flex-col space-y-4">
                        <div className="">
                            <div className="flex sm:flex-row items-center gap-2 md:gap-3 lg:gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-[50%] lg:top-1/2 transform -translate-y-1/2 text-muted-foreground lg:h-4 lg:w-4 md:h-3.5 md:w-3.5 h-3 w-3" />
                                    <Input
                                        placeholder="Search by client or job title..."
                                        className="md:pl-9 pl-8 lg:pl-10 bg-white text-black h-9"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="h-10 w-[160px]">
                                        <Filter className="lg:h-4 lg:w-4 md:h-3.5 md:w-3.5 h-3 w-3 mr-2" />
                                        <SelectValue placeholder="Filter status" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="scheduled">Scheduled</SelectItem>
                                        <SelectItem value="in-progress">In Progress</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-1">
                                <h3 className="font-bold text-base md:text-[17px] lg:text-lg">
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
                                    const sessionDate = new Date(session.date);
                                    return (
                                        <div key={session._id} className="group  transition-all overflow-hidden">
                                            <div className={`h-1 w-full ${session.status === 'cancelled' ? 'bg-destructive' : 'bg-blue-600'}`} />
                                            <div className="p-5">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex gap-5">
                                                        <div className="flex flex-col items-center justify-center h-14 w-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                                                            <span className="text-xl font-black">{sessionDate.getDate()}</span>
                                                            <span className="text-[10px] uppercase font-bold">{sessionDate.toLocaleDateString([], { month: 'short' })}</span>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-3">
                                                                <h4 className="font-bold text-base">{session?.job?.title}</h4>
                                                                <StatusBadge status={session?.status} className="text-[10px] py-0 h-4 font-bold uppercase tracking-wider" />
                                                            </div>
                                                            <div className="flex flex-wrap gap-y-1 gap-x-4 text-sm text-muted-foreground mt-2">
                                                                <div className="flex items-center gap-1.5">
                                                                    <User className="h-3.5 w-3.5 text-blue-500" />
                                                                    <span className="font-medium text-slate-700 dark:text-slate-300">{session?.client?.firstName} {session?.client?.lastName}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1.5">
                                                                    <Clock className="h-3.5 w-3.5 text-blue-500" />
                                                                    <span>{sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({session?.durationMinutes})</span>
                                                                </div>
                                                                {/* <div className="flex items-center gap-1.5">
                                                                    {session.mode === 'remote' ? <Video className="h-3.5 w-3.5 text-blue-500" /> : <MapPin className="h-3.5 w-3.5 text-blue-500" />}
                                                                    <span className="truncate max-w-[200px]">{session.location}</span>
                                                                </div> */}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {/* <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="hidden sm:flex hover:bg-blue-50 hover:text-blue-600 font-bold border-blue-100"
                                                            onClick={() => openForReschedule(session)}
                                                        >
                                                            Reschedule
                                                        </Button> */}
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-48 p-1">
                                                                <DropdownMenuItem
                                                                    className="cursor-pointer py-2"
                                                                    onClick={() => session?.client?._id && router.push(`/profile/${session?.client?._id}`)}
                                                                >
                                                                    View Client Profile
                                                                </DropdownMenuItem>
                                                                {/* <DropdownMenuItem
                                                                    className="cursor-pointer py-2"
                                                                    onClick={() => router.push(`/client/inbox/${session.client_.mnde}`)}
                                                                >
                                                                    Message Worker
                                                                </DropdownMenuItem> */}
                                                                {/* <DropdownMenuItem
                                                                    className="cursor-pointer py-2"
                                                                    onClick={() => openForEdit(session)}
                                                                >
                                                                    Edit Booking
                                                                </DropdownMenuItem> */}
                                                                {/* {session.status !== 'cancelled' && (
                                                                    <DropdownMenuItem
                                                                        className="text-destructive cursor-pointer py-2 font-bold"
                                                                    // onClick={() => handleCancelSession(session._id)}
                                                                    >
                                                                        Cancel Session
                                                                    </DropdownMenuItem>
                                                                )} */}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            ) : (
                                <Card className=" flex flex-col items-center justify-center p-12 text-center text-muted-foreground border-dashed border-2 bg-transparent">
                                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                        <Inbox className="h-8 w-8 opacity-40" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No sessions scheduled</h3>
                                    <p className="max-w-xs text-sm mt-1">
                                        {selectedDate ?
                                            `There are no sessions booked for ${selectedDate?.toLocaleDateString([], { month: 'long', day: 'numeric' })}. Try selecting another date or book a new session.` : "No upcoming sessions found. Try selecting a date or book a new session."
                                        } </p>
                                    <Button variant="secondary" className="mt-6 font-bold" onClick={() => setSelectedDate(new Date())}>
                                        Go to Today
                                    </Button>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
