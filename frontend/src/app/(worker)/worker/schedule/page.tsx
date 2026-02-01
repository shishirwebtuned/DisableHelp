'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '@/hooks/redux';
import { RootState } from '@/redux/store';
import {
    fetchScheduleByDate,
    fetchTodaySchedule,
    fetchUpcomingShifts,
    setSelectedDate,
    cancelScheduleItem,
    rescheduleShift,
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

// Mock schedule data for worker - these are the sessions booked by clients
const MOCK_SCHEDULE = [
    {
        id: '1',
        clientName: 'Alice Freeman',
        type: 'Personal Care',
        date: new Date(2026, 0, 27, 9, 0), // Today
        duration: '2 hours',
        location: '123 Main St, Sydney',
        status: 'confirmed',
        mode: 'onsite'
    },
    {
        id: '2',
        clientName: 'Alice Freeman',
        type: 'Personal Care',
        date: new Date(2026, 0, 28, 9, 0), // Tomorrow
        duration: '2 hours',
        location: '123 Main St, Sydney',
        status: 'confirmed',
        mode: 'onsite'
    },
    {
        id: '3',
        clientName: 'Bob Smith',
        type: 'Community Support',
        date: new Date(2026, 0, 27, 14, 0), // Today
        duration: '3 hours',
        location: 'Neutral Bay Community Centre',
        status: 'confirmed',
        mode: 'onsite'
    },
    {
        id: '4',
        clientName: 'Carol Johnson',
        type: 'Initial Assessment',
        date: new Date(2026, 0, 29, 10, 0),
        duration: '1 hour',
        location: 'Online / Video Call',
        status: 'pending',
        mode: 'remote'
    }
];

export default function WorkerSchedulePage() {
    const dispatch = useAppDispatch();
    const { items: scheduleItems, loading, error, selectedDate: reduxSelectedDate } = useSelector(
        (state: RootState) => state.schedule
    );
    
    const [selectedDate, setSelectedDateLocal] = useState<Date | undefined>(new Date());
    const [searchTerm, setSearchTerm] = useState('');

    // Load today's schedule on mount
    useEffect(() => {
        dispatch(fetchTodaySchedule());
    }, [dispatch]);

    // Fetch schedule when date changes
    useEffect(() => {
        if (selectedDate) {
            const dateString = selectedDate.toISOString().split('T')[0];
            dispatch(setSelectedDate(dateString));
            dispatch(fetchScheduleByDate(dateString));
        }
    }, [selectedDate, dispatch]);

    const filteredShifts = useMemo(() => {
        return scheduleItems.filter(shift => {
            const matchesSearch = shift.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                shift.type.toLowerCase().includes(searchTerm.toLowerCase());

            if (!selectedDate) return matchesSearch;

            const shiftDate = new Date(shift.date);
            const isSameDay = selectedDate &&
                shiftDate.getDate() === selectedDate.getDate() &&
                shiftDate.getMonth() === selectedDate.getMonth() &&
                shiftDate.getFullYear() === selectedDate.getFullYear();

            return matchesSearch && isSameDay;
        });
    }, [scheduleItems, selectedDate, searchTerm]);

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'confirmed': return 'default';
            case 'pending': return 'secondary';
            case 'cancelled': return 'destructive';
            default: return 'outline';
        }
    };

    const nextShift = useMemo(() => {
        const now = new Date();
        return [...scheduleItems]
            .filter(s => new Date(s.date) >= now && s.status !== 'cancelled')
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
    }, [scheduleItems]);

    const handleDateSelect = (date: Date | undefined) => {
        setSelectedDateLocal(date);
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
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold tracking-tight">My Schedule</h1>
                    <p className="text-muted-foreground">Manage your upcoming shifts and client sessions</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        Month View
                    </Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-700">
                        Find More Jobs
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
                {/* Left Sidebar */}
                <div className="col-span-12 lg:col-span-4 space-y-2">
                    <div className=" border-none shadow-sm">
                        <CalendarComponent
                            mode="single"
                            selected={selectedDate}
                            onSelect={handleDateSelect}
                            className="rounded-md border-none w-full"
                        />
                    </div>

                    {nextShift && (
                        <div className="p-5 border-none shadow-sm bg-gradient-to-br from-indigo-600 to-violet-700 text-white">
                            <h4 className="font-bold mb-4 flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5" />
                                Your Next Job
                            </h4>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-indigo-100 text-xs uppercase tracking-wider font-bold">Client</p>
                                    <p className="text-lg font-bold">{nextShift.clientName}</p>
                                </div>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-indigo-100 text-xs uppercase tracking-wider font-bold">Time</p>
                                        <p className="font-medium">{new Date(nextShift.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                    <Badge className="bg-white/20 text-white border-none">{nextShift.type}</Badge>
                                </div>
                                <Button variant="secondary" size="sm" className="w-full mt-2 bg-white text-indigo-700 hover:bg-white/90 border-none font-bold">
                                    Shift Details
                                </Button>
                            </div>
                        </div>
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
                                {selectedDate?.toDateString() === new Date().toDateString() ? "Today's Jobs" : `Schedule for ${selectedDate?.toLocaleDateString()}`}
                            </h3>
                            <Badge variant="outline">{filteredShifts.length} Shifts</Badge>
                        </div>

                        {filteredShifts.length > 0 ? (
                            filteredShifts.map((shift) => {
                                const shiftDate = new Date(shift.date);
                                return (
                                <div key={shift.id} className="group hover:border-indigo-500/50 transition-all border-none shadow-sm">
                                    <CardContent className="p-5">
                                        <div className="flex justify-between items-start">
                                            <div className="flex gap-5">
                                                <div className="flex flex-col items-center justify-center h-14 w-14 rounded-2xl bg-indigo-50 text-indigo-600">
                                                    <span className="text-xl font-black">{shiftDate.getDate()}</span>
                                                    <span className="text-[10px] uppercase font-bold">{shiftDate.toLocaleDateString([], { month: 'short' })}</span>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-3">
                                                        <h4 className="font-bold text-base">{shift.clientName}</h4>
                                                        <Badge variant={getStatusVariant(shift.status)} className="text-[10px] py-0 h-4 uppercase">
                                                            {shift.status}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex flex-wrap gap-y-1 gap-x-4 text-sm text-muted-foreground mt-1">
                                                        <div className="flex items-center gap-1.5">
                                                            <Clock className="h-3.5 w-3.5" />
                                                            <span>{shiftDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({shift.duration})</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            {shift.mode === 'remote' ? <Video className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
                                                            <span>{shift.location}</span>
                                                        </div>
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
                                                    <DropdownMenuItem className="flex items-center gap-2">
                                                        <FileText className="h-4 w-4" /> Case Notes
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="flex items-center gap-2">
                                                        <User className="h-4 w-4" /> Client Profile
                                                    </DropdownMenuItem>
                                                    {shift.status === 'pending' && (
                                                        <DropdownMenuItem onClick={() => handleConfirmShift(shift.id)} className="flex items-center gap-2">
                                                            <CheckCircle2 className="h-4 w-4" /> Confirm Shift
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem onClick={() => handleCancelShift(shift.id)} className="text-destructive">
                                                        Request Cancellation
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </CardContent>
                                </div>
                            )})
                        ) : (
                            <Card className="h-64 flex flex-col items-center justify-center p-12 text-center text-muted-foreground border-dashed border-2 bg-transparent">
                                <Inbox className="h-12 w-12 mb-4 opacity-20" />
                                <h3 className="text-lg font-medium">No jobs scheduled</h3>
                                <p className="max-w-xs text-sm">You have no shifts booked for this date.</p>
                                <Button variant="outline" className="mt-4" onClick={() => setSelectedDateLocal(new Date())}>Back to Today</Button>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
