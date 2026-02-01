'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchTimesheets, createTimesheet, updateTimesheet, deleteTimesheet, updateTimesheetStatus } from '@/redux/slices/timesheetsSlice';
import { Calendar, Clock, Download, Plus, Edit, Save, X, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';
import { DeleteConfirmation } from '@/components/common/DeleteConfirmation';


export default function TimesheetsPage() {
    const dispatch = useAppDispatch();
    const { items: timesheets, loading } = useAppSelector((state) => state.timesheets);
    
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [timesheetDate, setTimesheetDate] = useState<string>('');
    const [editingTimesheetId, setEditingTimesheetId] = useState<number | null>(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; id: number | null; client: string }>({ isOpen: false, id: null, client: '' });
    const [formState, setFormState] = useState({
        client: '',
        date: '',
        startTime: '',
        endTime: '',
        breakMinutes: 0,
        serviceType: 'Personal Care',
        notes: '',
    });

    // Fetch timesheets on mount
    useEffect(() => {
        dispatch(fetchTimesheets());
    }, [dispatch]);

    const openForNew = () => {
        setEditingTimesheetId(null);
        setFormState({
            client: '',
            date: '',
            startTime: '',
            endTime: '',
            breakMinutes: 0,
            serviceType: 'Personal Care',
            notes: '',
        });
        setIsDrawerOpen(true);
    };

    const openForEdit = (timesheet: any) => {
        setEditingTimesheetId(timesheet.id);
        setFormState({
            client: timesheet.client,
            date: timesheet.date,
            startTime: timesheet.startTime,
            endTime: timesheet.endTime,
            breakMinutes: timesheet.breakMinutes,
            serviceType: timesheet.serviceType,
            notes: timesheet.notes,
        });
        setTimesheetDate(timesheet.date);
        setIsDrawerOpen(true);
    };

    const handleSubmit = async () => {
        const hours = calculateHours(formState.startTime, formState.endTime, formState.breakMinutes);
        
        if (editingTimesheetId) {
            // Update existing timesheet
            await dispatch(updateTimesheet({
                id: editingTimesheetId,
                ...formState,
                hours,
                status: 'draft',
                rate: 45,
            }));
        } else {
            // Create new timesheet
            await dispatch(createTimesheet({
                ...formState,
                hours,
                status: 'draft',
                rate: 45,
            }));
        }
        setIsDrawerOpen(false);
    };

    const openDeleteConfirmation = (id: number, client: string) => {
        setDeleteConfirmation({ isOpen: true, id, client });
    };

    const handleDelete = async () => {
        if (deleteConfirmation.id) {
            await dispatch(deleteTimesheet(deleteConfirmation.id));
        }
    };

    const handleStatusChange = async (id: number, newStatus: string) => {
        await dispatch(updateTimesheetStatus({ 
            id, 
            status: newStatus as 'draft' | 'submitted' | 'approved' | 'rejected'
        }));
    };

    const calculateHours = (start: string, end: string, breakMins: number) => {
        if (!start || !end) return 0;
        const [startH, startM] = start.split(':').map(Number);
        const [endH, endM] = end.split(':').map(Number);
        const totalMinutes = (endH * 60 + endM) - (startH * 60 + startM) - breakMins;
        return Math.max(0, totalMinutes / 60);
    };

    const weeklyStats = {
        totalHours: 32.5,
        billableHours: 30.0,
        overtime: 2.5,
        earnings: 1462.5,
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
            draft: 'secondary',
            submitted: 'default',
            approved: 'outline',
            rejected: 'destructive',
        };
        return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Timesheets</h1>
                    <p className="text-muted-foreground">Track your working hours and shifts</p>
                </div>
                <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} direction="right">
                    <DrawerTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Log Hours
                        </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                        <DrawerHeader>
                            <DrawerTitle>{editingTimesheetId ? 'Edit Work Hours' : 'Log Work Hours'}</DrawerTitle>
                            <DrawerDescription>{editingTimesheetId ? 'Update the selected timesheet' : 'Record your work shift details'}</DrawerDescription>
                        </DrawerHeader>
                        <div className="p-4 grid gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="client">Client</Label>
                                    <Select value={formState.client} onValueChange={(v) => setFormState({...formState, client: v})}>
                                        <SelectTrigger className=' w-full'>
                                            <SelectValue placeholder="Select client" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="John Client">John Client</SelectItem>
                                            <SelectItem value="Emily Anderson">Emily Anderson</SelectItem>
                                            <SelectItem value="Sarah Mitchell">Sarah Mitchell</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="date">Date</Label>
                                    <DatePicker
                                        date={formState.date ? new Date(formState.date) : undefined}
                                        setDate={(date) => { const v = date ? format(date, 'yyyy-MM-dd') : ''; setFormState({...formState, date: v}); setTimesheetDate(v); }}
                                        placeholder="Select date"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="start">Start Time</Label>
                                    <Input type="time" id="start" value={formState.startTime} onChange={(e) => setFormState({...formState, startTime: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="end">End Time</Label>
                                    <Input type="time" id="end" value={formState.endTime} onChange={(e) => setFormState({...formState, endTime: e.target.value})} />
                                </div>
                             
                            </div>
                            <div className="grid grid-cols-2 gap-4">

                                   <div className="space-y-2">
                                    <Label htmlFor="break">Break (mins)</Label>
                                    <Input type="number" id="break" placeholder="0" value={String(formState.breakMinutes)} onChange={(e) => setFormState({...formState, breakMinutes: Number(e.target.value)})} />
                                </div>



                            <div className="space-y-2">
                                <Label htmlFor="service">Service Type</Label>
                                <Select value={formState.serviceType} onValueChange={(v) => setFormState({...formState, serviceType: v})}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select service type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Personal Care">Personal Care</SelectItem>
                                        <SelectItem value="Community Access">Community Access</SelectItem>
                                        <SelectItem value="Disability Support">Disability Support</SelectItem>
                                        <SelectItem value="Household Tasks">Household Tasks</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    placeholder="Add any relevant notes about this shift..."
                                    rows={3}
                                    value={formState.notes}
                                    onChange={(e) => setFormState({...formState, notes: e.target.value})}
                                />
                            </div>
                        </div>
                        <DrawerFooter>
                            <DrawerClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DrawerClose>
                            <Button variant="secondary" onClick={handleSubmit}>
                                <Save className="h-4 w-4 mr-2" />
                                {editingTimesheetId ? 'Update' : 'Save as Draft'}
                            </Button>
                            <DrawerClose asChild>
                                <Button onClick={() => setIsDrawerOpen(false)}>Close</Button>
                            </DrawerClose>
                        </DrawerFooter>
                    </DrawerContent>
                </Drawer>
            </div>

            {/* Weekly Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{weeklyStats.totalHours}</div>
                        <p className="text-xs text-muted-foreground">This week</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Billable Hours</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{weeklyStats.billableHours}</div>
                        <p className="text-xs text-muted-foreground">92% of total</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Overtime</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{weeklyStats.overtime}</div>
                        <p className="text-xs text-muted-foreground">Extra hours</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Estimated Earnings</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${weeklyStats.earnings}</div>
                        <p className="text-xs text-muted-foreground">This week</p>
                    </CardContent>
                </Card>
            </div>

            {/* Timesheets Table */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Recent Timesheets</CardTitle>
                            <CardDescription>Your logged work hours and shifts</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* <Button variant="outline" size="sm" onClick={() => openForNew()}>
                                <Plus className="h-4 w-4 mr-2" />
                                Log Hours
                            </Button> */}
                            <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-2" />
                                Export
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="all">
                        <TabsList>
                            <TabsTrigger value="all">All</TabsTrigger>
                            <TabsTrigger value="draft">Draft</TabsTrigger>
                            <TabsTrigger value="submitted">Submitted</TabsTrigger>
                            <TabsTrigger value="approved">Approved</TabsTrigger>
                        </TabsList>
                        <TabsContent value="all" className="mt-4">
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Client</TableHead>
                                            <TableHead>Time</TableHead>
                                            <TableHead>Hours</TableHead>
                                            <TableHead>Service Type</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {timesheets.map((timesheet) => (
                                            <TableRow key={timesheet.id}>
                                                <TableCell>
                                                    {new Date(timesheet.date).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {timesheet.client}
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {timesheet.startTime} - {timesheet.endTime}
                                                </TableCell>
                                                <TableCell>{timesheet.hours}h</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{timesheet.serviceType}</Badge>
                                                </TableCell>
                                                <TableCell className="font-semibold">
                                                    ${(timesheet.hours * timesheet.rate).toFixed(2)}
                                                </TableCell>
                                                <TableCell>
                                                    <Select value={timesheet.status} onValueChange={(v) => handleStatusChange(timesheet.id, v)}>
                                                        <SelectTrigger className="w-32">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="draft">Draft</SelectItem>
                                                            <SelectItem value="submitted">Submitted</SelectItem>
                                                            <SelectItem value="approved">Approved</SelectItem>
                                                            <SelectItem value="rejected">Rejected</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="sm" onClick={() => openForEdit(timesheet)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="sm" onClick={() => openDeleteConfirmation(timesheet.id, timesheet.client)}>
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            <DeleteConfirmation
                isOpen={deleteConfirmation.isOpen}
                onClose={() => setDeleteConfirmation({ isOpen: false, id: null, client: '' })}
                onConfirm={handleDelete}
                title="Delete Timesheet"
                itemName={deleteConfirmation.client}
                description="This action cannot be undone. This will permanently delete this timesheet entry."
            />
        </div>
    );
}
