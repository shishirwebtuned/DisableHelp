'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import {
    fetchSessions,
    createSession,
    updateSession,
    rescheduleSession,
    cancelSession,
} from '@/redux/slices/sessionsSlice';
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
    Plus,
    Filter,
    Search,
    Inbox,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
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
import { format, parseISO } from 'date-fns';

export default function ClientSessionsPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { items: sessions, loading } = useAppSelector((state) => state.sessions);

    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [searchTerm, setSearchTerm] = useState('');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | 'reschedule'>('create');
    const [editingSession, setEditingSession] = useState<any>(null);

    // Form state for new/edit session
    const [formData, setFormData] = useState({
        workerName: '',
        workerId: '',
        type: 'Personal Care',
        date: '',
        time: '',
        duration: '1 hour',
        location: '',
        mode: 'onsite' as 'onsite' | 'remote'
    });

    useEffect(() => {
        dispatch(fetchSessions());
    }, [dispatch]);

    const filteredSessions = useMemo(() => {
        return sessions.filter(session => {
            const sessionDate = new Date(session.date);
            const matchesSearch = session.workerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                session.type.toLowerCase().includes(searchTerm.toLowerCase());

            const isSameDay = selectedDate &&
                sessionDate.getDate() === selectedDate.getDate() &&
                sessionDate.getMonth() === selectedDate.getMonth() &&
                sessionDate.getFullYear() === selectedDate.getFullYear();

            return matchesSearch && isSameDay;
        });
    }, [sessions, selectedDate, searchTerm]);

    const openForCreate = () => {
        setDrawerMode('create');
        setEditingSession(null);
        setFormData({
            workerName: '',
            workerId: '',
            type: 'Personal Care',
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
        setFormData({
            workerName: session.workerName,
            workerId: session.workerId,
            type: session.type,
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
        setFormData({
            workerName: session.workerName,
            workerId: session.workerId,
            type: session.type,
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
            await dispatch(createSession({
                workerId: formData.workerId || 'w1',
                workerName: formData.workerName,
                type: formData.type,
                date: sessionDateTime,
                duration: formData.duration,
                location: formData.location || 'Home Address',
                mode: formData.mode
            }));
        } else if (drawerMode === 'edit' && editingSession) {
            await dispatch(updateSession({
                ...editingSession,
                workerName: formData.workerName,
                type: formData.type,
                date: sessionDateTime,
                duration: formData.duration,
                location: formData.location,
                mode: formData.mode
            }));
        } else if (drawerMode === 'reschedule' && editingSession) {
            await dispatch(rescheduleSession({
                id: editingSession.id,
                date: sessionDateTime
            }));
        }

        setIsDrawerOpen(false);
    };

    const handleCancelSession = async (id: string) => {
        await dispatch(cancelSession(id));
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'confirmed': return 'default';
            case 'pending': return 'secondary';
            case 'cancelled': return 'destructive';
            default: return 'outline';
        }
    };

    const nextSession = useMemo(() => {
        const now = new Date();
        return [...sessions]
            .filter(s => new Date(s.date) >= now && s.status !== 'cancelled')
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
    }, [sessions]);

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Support Sessions</h1>
                    <p className="text-muted-foreground">Manage your bookings and track worker visits</p>
                </div>

                <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} direction="right">
                    <Button onClick={openForCreate} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Book New Session
                    </Button>
                    <DrawerContent>
                        <DrawerHeader>
                            <DrawerTitle className="text-2xl font-bold">
                                {drawerMode === 'create' && 'Book a New Session'}
                                {drawerMode === 'edit' && 'Edit Session'}
                                {drawerMode === 'reschedule' && 'Reschedule Session'}
                            </DrawerTitle>
                            <DrawerDescription>
                                {drawerMode === 'create' && 'Schedule a new support session with your preferred worker.'}
                                {drawerMode === 'edit' && 'Update the details of your session.'}
                                {drawerMode === 'reschedule' && 'Choose a new date and time for your session.'}
                            </DrawerDescription>
                        </DrawerHeader>
                        <div className="overflow-y-auto px-6 space-y-4 pb-6">
                            <div className="space-y-2">
                                <Label htmlFor="worker">Select Worker</Label>
                                <Select 
                                    value={formData.workerName} 
                                    onValueChange={(val) => setFormData({ ...formData, workerName: val })}
                                    disabled={drawerMode === 'reschedule'}
                                >
                                    <SelectTrigger id="worker" className='w-full'>
                                        <SelectValue placeholder="Choose a worker" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Sarah Worker">Sarah Worker</SelectItem>
                                        <SelectItem value="John Smith">John Smith</SelectItem>
                                        <SelectItem value="Emma Wilson">Emma Wilson</SelectItem>
                                        <SelectItem value="Michael Brown">Michael Brown</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="date">Date</Label>
                                    <DatePicker
                                        date={formData.date ? new Date(formData.date) : undefined}
                                        setDate={(date) => setFormData({ ...formData, date: date ? format(date, 'yyyy-MM-dd') : '' })}
                                        placeholder="Select date"
                                    />
                                </div>
                                <div className="space-y-2">
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
                                    <div className="space-y-2">
                                        <Label htmlFor="type">Service Type</Label>
                                        <Select 
                                            value={formData.type} 
                                            onValueChange={(val) => setFormData({ ...formData, type: val })}
                                        >
                                            <SelectTrigger id="type" className='w-full'>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Personal Care">Personal Care</SelectItem>
                                                <SelectItem value="Community Support">Community Support</SelectItem>
                                                <SelectItem value="Transport">Transport</SelectItem>
                                                <SelectItem value="Domestic Aid">Domestic Aid</SelectItem>
                                                <SelectItem value="Therapy Session">Therapy Session</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
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
                                    <div className="space-y-2">
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
                    <div className=" border-none ">
                        
                        <CalendarComponent
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            className="rounded-md border-none w-full"
                        />
                    </div>

                    {nextSession && (
                        <Card className="p-5 border-none shadow-sm bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
                            <h4 className="font-bold mb-4 flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5" />
                                Your Next Session
                            </h4>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-blue-100 text-xs uppercase tracking-wider font-bold">Time & Date</p>
                                    <p className="font-medium">{new Date(nextSession.date).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                                    <p className="text-lg font-bold">{new Date(nextSession.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                                <div className="pt-2 border-t border-white/20">
                                    <p className="text-blue-100 text-xs uppercase tracking-wider font-bold">Supporting Worker</p>
                                    <p className="font-medium flex items-center gap-2 mt-1">
                                        <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                                            {nextSession.workerName.charAt(0)}
                                        </div>
                                        {nextSession.workerName}
                                    </p>
                                </div>
                                <Button 
                                    variant="secondary" 
                                    size="sm" 
                                    className="w-full mt-2 bg-white text-blue-700 hover:bg-white/90 border-none font-bold"
                                    onClick={() => router.push(`/profile/${nextSession.workerId}`)}
                                >
                                    View Worker Profile
                                </Button>
                            </div>
                        </Card>
                    )}
                </div>

                {/* Right Content - Sessions List */}
                <div className="col-span-12 lg:col-span-8 flex flex-col space-y-4">
                    <div className="">
                        <div className=" flex gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <Input
                                    placeholder="Search by worker or service type..."
                                    className="pl-10 h-10 bg-white dark:bg-slate-950"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button variant="outline" className="h-10">
                                <Filter className="h-4 w-4 mr-2" />
                                Filters
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="font-bold text-lg">
                                {selectedDate?.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' }) === new Date().toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })
                                    ? "Today's Schedule"
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
                                <div key={session.id} className="group  transition-all overflow-hidden">
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
                                                        <h4 className="font-bold text-base">{session.type}</h4>
                                                        <Badge variant={getStatusVariant(session.status)} className="text-[10px] py-0 h-4 font-bold uppercase tracking-wider">
                                                            {session.status}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex flex-wrap gap-y-1 gap-x-4 text-sm text-muted-foreground mt-2">
                                                        <div className="flex items-center gap-1.5">
                                                            <User className="h-3.5 w-3.5 text-blue-500" />
                                                            <span className="font-medium text-slate-700 dark:text-slate-300">{session.workerName}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <Clock className="h-3.5 w-3.5 text-blue-500" />
                                                            <span>{sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({session.duration})</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            {session.mode === 'remote' ? <Video className="h-3.5 w-3.5 text-blue-500" /> : <MapPin className="h-3.5 w-3.5 text-blue-500" />}
                                                            <span className="truncate max-w-[200px]">{session.location}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="hidden sm:flex hover:bg-blue-50 hover:text-blue-600 font-bold border-blue-100"
                                                    onClick={() => openForReschedule(session)}
                                                >
                                                    Reschedule
                                                </Button>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48 p-1">
                                                        <DropdownMenuItem 
                                                            className="cursor-pointer py-2"
                                                            onClick={() => router.push(`/profile/${session.workerId}`)}
                                                        >
                                                            View Worker Profile
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem 
                                                            className="cursor-pointer py-2"
                                                            onClick={() => router.push(`/client/inbox/${session.workerId}`)}
                                                        >
                                                            Message Worker
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem 
                                                            className="cursor-pointer py-2"
                                                            onClick={() => openForEdit(session)}
                                                        >
                                                            Edit Booking
                                                        </DropdownMenuItem>
                                                        {session.status !== 'cancelled' && (
                                                            <DropdownMenuItem
                                                                className="text-destructive cursor-pointer py-2 font-bold"
                                                                onClick={() => handleCancelSession(session.id)}
                                                            >
                                                                Cancel Session
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )})
                        ) : (
                            <Card className="h-64 flex flex-col items-center justify-center p-12 text-center text-muted-foreground border-dashed border-2 bg-transparent">
                                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                    <Inbox className="h-8 w-8 opacity-40" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No sessions scheduled</h3>
                                <p className="max-w-xs text-sm mt-1">There are no sessions booked for {selectedDate?.toLocaleDateString([], { month: 'long', day: 'numeric' })}. Try selecting another date or book a new session.</p>
                                <Button variant="secondary" className="mt-6 font-bold" onClick={() => setSelectedDate(new Date())}>
                                    Go to Today
                                </Button>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
