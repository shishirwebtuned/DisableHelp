'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
    User, Mail, Phone, MapPin, Camera, Save, Shield,
    Calendar, Heart, Baby, Home, CreditCard, Globe,
    FileCheck, Edit, CheckCircle, Clock, Users, Activity, AlertCircle
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { updateClientProfile } from '@/redux/slices/profileSlice';
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';
import ProfileImageEditor from '@/components/profile/ProfileImageEditor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ClientProfilePage() {
    const dispatch = useAppDispatch();
    const { mee } = useAppSelector((state) => state.auth);
    const { loading } = useAppSelector((state) => state.profile);

    const [activeTab, setActiveTab] = useState('view');
    const [profileImage, setProfileImage] = useState<string>('');
    const [profileImageBinary, setProfileImageBinary] = useState<Blob | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const userData = mee as any;
    const user = userData?.user;
    const profile = userData?.profile;

    const [formData, setFormData] = useState({
        gender: '',
        carePreferences: [] as string[],
        receiveAgreementsEmails: true,
        receiveEventDeliveriesEmails: true,
        receivePlannedSessionReminderEmails: true,
        isNdisManaged: false,
        emergencyContact: {
            name: '',
            phone: '',
            relationship: '',
        },
    });

    useEffect(() => {
        if (profile) {
            setFormData({
                gender: profile.gender || '',
                carePreferences: profile.carePreferences || [],
                receiveAgreementsEmails: profile.receiveAgreementsEmails ?? true,
                receiveEventDeliveriesEmails: profile.receiveEventDeliveriesEmails ?? true,
                receivePlannedSessionReminderEmails: profile.receivePlannedSessionReminderEmails ?? true,
                isNdisManaged: profile.isNdisManaged ?? false,
                emergencyContact: {
                    name: profile.emergencyContact?.name || '',
                    phone: profile.emergencyContact?.phone || '',
                    relationship: profile.emergencyContact?.relationship || '',
                },
            });
        }
        // Set avatar from profile
        if (profile?.avatar?.url) {
            setProfileImage(profile.avatar.url);
        }
    }, [profile]);

    const handleProfileImageSave = (imageData: { base64: string; binary: Blob | null }) => {
        setProfileImage(imageData.base64);
        setProfileImageBinary(imageData.binary);
    };

    const handleSubmit = async () => {
        if (profileImageBinary) {
            const fd = new FormData();
            fd.append('avatar', profileImageBinary, 'avatar.jpg');
            fd.append('gender', formData.gender);
            fd.append('isNdisManaged', String(formData.isNdisManaged));
            fd.append('receiveAgreementsEmails', String(formData.receiveAgreementsEmails));
            fd.append('receiveEventDeliveriesEmails', String(formData.receiveEventDeliveriesEmails));
            fd.append('receivePlannedSessionReminderEmails', String(formData.receivePlannedSessionReminderEmails));
            fd.append('emergencyContact[name]', formData.emergencyContact.name || '');
            fd.append('emergencyContact[phone]', formData.emergencyContact.phone || '');
            fd.append('emergencyContact[relationship]', formData.emergencyContact.relationship || '');
            await dispatch(updateClientProfile(fd as any));
        } else {
            await dispatch(updateClientProfile(formData as any));
        }
        setActiveTab('view');
    };

    const profileStats = [
        { label: 'Profile Complete', value: '85%', icon: Activity, color: 'text-purple-600' },
        { label: 'NDIS Status', value: profile?.isNdisManaged ? 'Managed' : 'Self', icon: CheckCircle, color: 'text-green-600' },
    ];

    if (!user) return <div className="text-sm text-muted-foreground p-6">Loading...</div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="rounded-lg overflow-hidden shadow p-4 md:p-5 lg:p-6">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center md:items-center gap-6">
                    <div className="relative">
                        <div className="bg-white rounded-full p-1 shadow-lg">
                            <Avatar className="h-20 w-20 md:h-26 md:w-26 lg:h-32 lg:w-32">
                                <AvatarImage src={profileImage || ''} />
                                <AvatarFallback className="text-lg md:text-xl lg:text-2xl">
                                    {user.firstName?.[0]}{user.lastName?.[0]}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" />
                    </div>

                    <div className="flex-1 text-center md:text-left -mt-4 md:mt-0">
                        <h1 className="text-[20px] md:text-[26px] lg:text-3xl font-bold md:font-extrabold">{user.firstName} {user.lastName}</h1>
                        <p className="text-xs md:text-[13px] lg:text-sm text-muted-foreground mt-1">
                            NDIS Participant • {user.address?.state ?? ''}
                        </p>
                        {/* <div className="mt-3 flex items-center justify-center md:justify-start gap-3">
                            <Button variant="ghost" onClick={() => setActiveTab('edit')}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Profile
                            </Button>
                            <Button variant="outline">
                                <Mail className="h-4 w-4 mr-2" />
                                Message
                            </Button>
                        </div> */}
                    </div>

                    <div className="hidden md:flex md:items-center md:gap-4">
                        {profileStats.map((stat) => (
                            <div key={stat.label} className="text-center">
                                <div className="text-lg md:text-xl lg:text-2xl font-semibold">{stat.value}</div>
                                <div className="text-[10px] md:text-[11px] lg:text-xs text-muted-foreground">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <TabsList className="flex gap-8">
                        <TabsTrigger value="view">
                            <User className="h-4 w-4 mr-2" />
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="edit">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* VIEW TAB */}
                <TabsContent value="view" className=" mt-2">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-5">
                        <div className="lg:col-span-1 space-y-6">
                            <Card className="lg:sticky lg:top-20">
                                <CardContent className="text-center">
                                    <h3 className="text-sm md:text-[16px] lg:text-lg font-bold">Quick Details</h3>
                                    <Separator className="my-4" />
                                    <div className="grid grid-cols-2 gap-8 md:gap-10 lg:gap-14">
                                        <div className="text-left">
                                            <Label className="text-muted-foreground">Email</Label>
                                            <p className="font-medium text-[12px] md:text-[13px] lg:text-sm">{user?.email}</p>
                                        </div>
                                        <div className="text-left">
                                            <Label className="text-muted-foreground">Phone</Label>
                                            <p className="font-medium text-[12px] md:text-[13px] lg:text-sm">{user?.phoneNumber || '—'}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className='text-sm md:text-[13px] lg:text-base'>NDIS</CardTitle>
                                    <CardDescription className='text-xs md:text-[13px] lg:text-sm'>
                                        {profile?.isNdisManaged ? 'NDIS Managed' : 'Self Managed'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <p className="text-xs md:text-[13px] lg:text-sm text-muted-foreground">
                                            Status:{' '}
                                            <span className={user.approved ? 'text-green-500 font-normal px-2 py-1 md:py-1.5 rounded-2xl ml-1 border border-green-500 bg-green-50' : 'text-yellow-500 font-medium px-2 py-1 md:py-1.5 rounded-2xl ml-1 border border-yellow-500 bg-yellow-50'}>
                                                {user.approved ? 'Approved' : 'Pending'}
                                            </span>
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="lg:col-span-2 space-y-4 md:space-y-5 lg:space-y-6">
                            <Card>
                                <CardHeader >
                                    <CardTitle className='text-sm md:text-[13px] lg:text-base'>Personal Information</CardTitle>
                                </CardHeader>
                                <CardContent className="grid md:gap-5 gap-4 lg:gap-6 md:grid-cols-2 lg:text-base md:text-sm text-xs">
                                    <div>
                                        <Label className="text-muted-foreground">Full Name</Label>
                                        <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">Gender</Label>
                                        <p className="font-medium capitalize">{profile?.gender || '—'}</p>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">Date of Birth</Label>
                                        <p className="font-medium">
                                            {user.dateOfBirth
                                                ? new Date(user.dateOfBirth).toLocaleDateString()
                                                : '—'}
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">Timezone</Label>
                                        <p className="font-medium">{user?.timezone || '—'}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className='text-sm md:text-[13px] lg:text-base'>Address</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {user.address?.line1 ? (
                                            <>
                                                <p className="font-medium lg:text-base md:text-[14px] text-[13px]">{user.address.line1}</p>
                                                {user.address.line2 && (
                                                    <p className="text-xs md:text-[13px] lg:text-sm text-muted-foreground">{user.address.line2}</p>
                                                )}
                                                <p className="text-xs md:text-[13px] lg:text-sm text-muted-foreground mt-1">
                                                    {user.address.state} {user.address.postalCode}
                                                </p>
                                            </>
                                        ) : (
                                            <p className="text-xs md:text-[13px] lg:text-sm text-muted-foreground">No address on file</p>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className='text-sm md:text-[13px] lg:text-base'>Notification Preferences</CardTitle>
                                    </CardHeader>
                                    <CardContent className="md:space-y-1.5 space-y-1 lg:space-y-2 md:text-[13px] text-xs lg:text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Agreement Emails</span>
                                            <Badge className={profile?.receiveAgreementsEmails ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                                                {profile?.receiveAgreementsEmails ? 'On' : 'Off'}
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Event Emails</span>
                                            <Badge className={profile?.receiveEventDeliveriesEmails ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                                                {profile?.receiveEventDeliveriesEmails ? 'On' : 'Off'}
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Session Reminders</span>
                                            <Badge className={profile?.receivePlannedSessionReminderEmails ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                                                {profile?.receivePlannedSessionReminderEmails ? 'On' : 'Off'}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className='text-sm md:text-[13px] lg:text-base'>Emergency Contact</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {profile?.emergencyContact?.name ? (
                                            <>
                                                <p className="font-medium lg:text-base md:text-sm text-[13px]">{profile.emergencyContact.name}</p>
                                                <p className="text-xs md:text-[13px] lg:text-sm text-muted-foreground">
                                                    {profile.emergencyContact.phone} • {profile.emergencyContact.relationship}
                                                </p>
                                            </>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">No emergency contact on file</p>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className='text-sm md:text-[13px] lg:text-base'>Care Preferences</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {profile?.carePreferences?.length > 0 ? (
                                            <div className="flex flex-wrap gap-2 md:text-[13px] text-xs lg:text-sm">
                                                {profile.carePreferences.map((p: string) => (
                                                    <Badge key={p} variant="secondary">{p}</Badge>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="md:text-[13px] text-xs lg:text-sm text-muted-foreground">No preferences set</p>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* EDIT TAB */}
                <TabsContent value="edit" className="flex flex-col lg:flex-row mt-2 gap-5">
                    <Card className='h-fit'>
                        <CardContent>
                            <ProfileImageEditor onSave={handleProfileImageSave} />
                        </CardContent>
                    </Card>
                    <div className='space-y-4 md:space-y-5 lg:space-y-6'>
                        <Card>
                            <CardHeader>
                                <CardTitle className='text-sm md:text-[13px] lg:text-base'>Personal Information</CardTitle>
                                <CardDescription className='text-xs md:text-[13px] lg:text-sm'>
                                    Contact your administrator to update name, email, phone, or address.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 ">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>First Name</Label>
                                        <Input value={user.firstName} disabled className="bg-muted/40" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Last Name</Label>
                                        <Input value={user.lastName} disabled className="bg-muted/40" />
                                    </div>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Email</Label>
                                        <Input value={user.email} disabled className="bg-muted/40" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Phone</Label>
                                        <Input value={user.phoneNumber || ''} disabled className="bg-muted/40" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Gender</Label>
                                    <Select
                                        value={formData.gender}
                                        onValueChange={(val) => setFormData({ ...formData, gender: val })}

                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select gender" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="male">Male</SelectItem>
                                            <SelectItem value="female">Female</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                            <SelectItem value="prefer not to say">Prefer not to say</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className='text-sm md:text-[13px] lg:text-base'>Emergency Contact</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label>Contact Name</Label>
                                    <Input
                                        value={formData.emergencyContact.name}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            emergencyContact: { ...formData.emergencyContact, name: e.target.value }
                                        })}
                                        placeholder="Full name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Contact Phone</Label>
                                    <Input
                                        value={formData.emergencyContact.phone}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            emergencyContact: { ...formData.emergencyContact, phone: e.target.value }
                                        })}
                                        placeholder="+61 400 000 000"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Relationship</Label>
                                    <Input
                                        value={formData.emergencyContact.relationship}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            emergencyContact: { ...formData.emergencyContact, relationship: e.target.value }
                                        })}
                                        placeholder="e.g. Spouse, Parent"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className='text-sm md:text-[13px] lg:text-base'>NDIS Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>NDIS Plan Management</Label>
                                    <Select
                                        value={formData.isNdisManaged ? 'true' : 'false'}
                                        onValueChange={(val) => setFormData({ ...formData, isNdisManaged: val === 'true' })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="true">NDIS Managed</SelectItem>
                                            <SelectItem value="false">Self Managed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className='text-sm md:text-[13px] lg:text-base'>Notification Preferences</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {[
                                    { key: 'receiveAgreementsEmails' as const, label: 'Agreement Emails' },
                                    { key: 'receiveEventDeliveriesEmails' as const, label: 'Event Delivery Emails' },
                                    { key: 'receivePlannedSessionReminderEmails' as const, label: 'Session Reminder Emails' },
                                ].map(({ key, label }) => (
                                    <div key={key} className="grid gap-4 md:grid-cols-2 items-center">
                                        <Label>{label}</Label>
                                        <Select
                                            value={formData[key] ? 'true' : 'false'}
                                            onValueChange={(val) => setFormData({ ...formData, [key]: val === 'true' })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="true">Enabled</SelectItem>
                                                <SelectItem value="false">Disabled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setActiveTab('view')}>
                                Cancel
                            </Button>
                            <Button onClick={handleSubmit} disabled={loading}>
                                <Save className="h-4 w-4 mr-2" />
                                {loading ? 'Saving...' : 'Save All Changes'}
                            </Button>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}