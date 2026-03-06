'use client';

import { useState, useRef } from 'react';
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
    User,
    Mail,
    Phone,
    MapPin,
    Camera,
    Save,
    Shield,
    Calendar,
    Heart,
    Baby,
    Home,
    CreditCard,
    Globe,
    FileCheck,
    Edit,
    CheckCircle,
    Clock,
    Users,
    Activity,
    AlertCircle
} from 'lucide-react';
import { useAppSelector } from '@/hooks/redux';
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';
import ProfileImageEditor from '@/components/profile/ProfileImageEditor';

export default function ClientProfilePage() {
    const { user } = useAppSelector((state) => state.auth);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('view');
    const [profileImage, setProfileImage] = useState<string>('https://ui.shadcn.com/avatars/01.png');
    const [profileImageBinary, setProfileImageBinary] = useState<Blob | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [profileData, setProfileData] = useState({
        firstName: 'Alice',
        lastName: 'Freeman',
        email: 'alice@example.com',
        phone: '+61 411 222 333',
        dateOfBirth: '1985-03-15',
        gender: 'Female',
        address: '123 Main St, Sydney, NSW 2000',
        suburb: 'Sydney',
        state: 'NSW',
        postcode: '2000',
        bio: 'Looking for a reliable support worker for weekend assistance and community access. I enjoy outdoor activities and community events.',
        emergencyContact: 'John Freeman',
        emergencyPhone: '+61 400 000 000',
        emergencyRelation: 'Spouse',
        ndisNumber: '430 000 000',
        planType: 'Self Managed',
        planBudget: '$45,000',
        ndisExpiry: '2027-05-20',
        diagnosis: 'Mobility Support',
        supportNeeds: 'Personal care, Community access, Transport',
        medications: 'Daily medication schedule maintained',
        allergies: 'None',
        preferredLanguage: 'English',
        culturalNeeds: 'None specified',
    });

    const [bankData, setBankData] = useState({
        accountName: 'Alice Freeman',
        bsb: '062-000',
        accountNumber: '1234 5678',
        bankName: 'Commonwealth Bank',
    });

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleProfileImageSave = (imageData: { base64: string; binary: Blob | null }) => {
        setProfileImage(imageData.base64);
        setProfileImageBinary(imageData.binary);
        console.log('Profile image saved:', {
            hasBase64: !!imageData.base64,
            hasBinary: !!imageData.binary,
            binarySize: imageData.binary?.size
        });
    };

    const handleSubmit = async () => {
        // Convert profile image to binary if needed
        const formData = new FormData();
        
        // Add profile data
        Object.entries(profileData).forEach(([key, value]) => {
            formData.append(key, value);
        });

        // Add profile image as binary
        if (profileImageBinary) {
            formData.append('profileImage', profileImageBinary, 'profile-image.jpg');
        } else if (fileInputRef.current?.files?.[0]) {
            formData.append('profileImage', fileInputRef.current.files[0]);
        }

        // Add bank data
        Object.entries(bankData).forEach(([key, value]) => {
            formData.append(key, value);
        });

        try {
            // Simulate API call
            console.log('Submitting profile data...');
            await new Promise((resolve) => setTimeout(resolve, 1000));
            alert('Profile updated successfully!');
            setIsEditing(false);
        } catch (error) {
            alert('Failed to update profile');
        }
    };

    const profileStats = [
        { label: 'Active Workers', value: '2', icon: Users, color: 'text-blue-600' },
        { label: 'Sessions This Month', value: '12', icon: Calendar, color: 'text-green-600' },
        { label: 'Profile Complete', value: '85%', icon: Activity, color: 'text-purple-600' },
        { label: 'NDIS Status', value: 'Active', icon: CheckCircle, color: 'text-green-600' },
    ];

    return (
        <div className="space-y-6">
            {/* Modern header */}
            <div className="rounded-lg overflow-hidden shadow p-6">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center md:items-end gap-6">
                    <div className="relative">
                        <div className="bg-white rounded-full p-1 shadow-lg -translate-y-6 md:-translate-y-10">
                            <Avatar className="h-32 w-32">
                                <AvatarImage src={profileImage} />
                                <AvatarFallback className="text-2xl">
                                    {profileData.firstName[0]}{profileData.lastName[0]}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </div>

                    <div className="flex-1 text-center md:text-left -mt-4 md:mt-0">
                        <h1 className="text-3xl font-extrabold">{profileData.firstName} {profileData.lastName}</h1>
                        <p className="text-sm text-muted-foreground mt-1">NDIS Participant • {profileData.suburb}, {profileData.state}</p>
                        <div className="mt-3 flex items-center justify-center md:justify-start gap-3">
                            <Button variant="ghost" onClick={() => setActiveTab('edit')}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Profile
                            </Button>
                            <Button variant="outline">
                                <Mail className="h-4 w-4 mr-2" />
                                Message
                            </Button>
                        </div>
                    </div>

                    <div className="hidden md:flex md:items-center md:gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-semibold">{profileStats[0].value}</div>
                            <div className="text-xs text-muted-foreground">Workers</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-semibold">{profileStats[1].value}</div>
                            <div className="text-xs text-muted-foreground">Sessions</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-semibold">{profileStats[2].value}</div>
                            <div className="text-xs text-muted-foreground">Complete</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs and content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div></div>
                    <TabsList className=' flex  gap-8'>
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

                <TabsContent value="view" className="space-y-6 max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1 space-y-6">
                            <Card className="sticky top-20">
                                <CardContent className="text-center">
                                    <h3 className="text-lg font-bold">Quick Details</h3>
                                    <p className="text-sm text-muted-foreground mt-2">{profileData.bio}</p>
                                    <Separator className="my-4" />
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="text-left">
                                            <Label className="text-muted-foreground">Email</Label>
                                            <p className="font-medium">{profileData.email}</p>
                                        </div>
                                        <div className="text-left">
                                            <Label className="text-muted-foreground">Phone</Label>
                                            <p className="font-medium">{profileData.phone}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>NDIS</CardTitle>
                                    <CardDescription>{profileData.planType} • {profileData.planBudget}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        <p className="font-mono font-medium">{profileData.ndisNumber}</p>
                                        <p className="text-sm text-muted-foreground">Plan expires: {new Date(profileData.ndisExpiry).toLocaleDateString()}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="lg:col-span-2 space-y-6">
                            {/* Personal Info Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Personal Information</CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-6 md:grid-cols-2">
                                    <div>
                                        <Label className="text-muted-foreground">Full Name</Label>
                                        <p className="font-medium">{profileData.firstName} {profileData.lastName}</p>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">Date of Birth</Label>
                                        <p className="font-medium">{new Date(profileData.dateOfBirth).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">Gender</Label>
                                        <p className="font-medium">{profileData.gender}</p>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">Preferred Language</Label>
                                        <p className="font-medium">{profileData.preferredLanguage}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Address, Health, Emergency and Bank (collapsed into cards) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Address</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="font-medium">{profileData.address}</p>
                                        <p className="text-sm text-muted-foreground mt-2">{profileData.suburb}, {profileData.state} {profileData.postcode}</p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Health & Support</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="font-medium">{profileData.diagnosis}</p>
                                        <p className="text-sm text-muted-foreground mt-2">{profileData.supportNeeds}</p>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Emergency Contact</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="font-medium">{profileData.emergencyContact}</p>
                                        <p className="text-sm text-muted-foreground">{profileData.emergencyPhone} • {profileData.emergencyRelation}</p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Bank Details</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="font-medium">{bankData.accountName}</p>
                                        <p className="text-sm text-muted-foreground">{bankData.bankName} • {bankData.bsb} • {bankData.accountNumber}</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="edit" className="space-y-6 max-w-6xl mx-auto">
                    {/* Profile Photo Upload with Editor */}
                    <Card>
                        <CardContent>
                            <ProfileImageEditor onSave={handleProfileImageSave} />
                            <div className="mt-4 text-right">
                                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* keep edit form cards as before (unchanged below) */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-6">
                                    <Label>First Name *</Label>
                                    <Input
                                        value={profileData.firstName}
                                        onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-6">
                                    <Label>Last Name *</Label>
                                    <Input
                                        value={profileData.lastName}
                                        onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-6">
                                    <Label>Email *</Label>
                                    <Input
                                        type="email"
                                        value={profileData.email}
                                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-6">
                                    <Label>Phone *</Label>
                                    <Input
                                        value={profileData.phone}
                                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-6">
                                    <Label>Date of Birth</Label>
                                    <DatePicker
                                        date={profileData.dateOfBirth ? new Date(profileData.dateOfBirth) : undefined}
                                        setDate={(date) => setProfileData({ ...profileData, dateOfBirth: date ? format(date, 'yyyy-MM-dd') : '' })}
                                        placeholder="Select date of birth"
                                    />
                                </div>
                                <div className="space-y-6">
                                    <Label>Gender</Label>
                                    <Input
                                        value={profileData.gender}
                                        onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-6">
                                    <Label>Language</Label>
                                    <Input
                                        value={profileData.preferredLanguage}
                                        onChange={(e) => setProfileData({ ...profileData, preferredLanguage: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-6">
                                <Label>Bio</Label>
                                <Textarea
                                    value={profileData.bio}
                                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                                    rows={3}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Address */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Address</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-6">
                                <Label>Full Address *</Label>
                                <Input
                                    value={profileData.address}
                                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-6">
                                    <Label>Suburb</Label>
                                    <Input
                                        value={profileData.suburb}
                                        onChange={(e) => setProfileData({ ...profileData, suburb: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-6">
                                    <Label>State</Label>
                                    <Input
                                        value={profileData.state}
                                        onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-6">
                                    <Label>Postcode</Label>
                                    <Input
                                        value={profileData.postcode}
                                        onChange={(e) => setProfileData({ ...profileData, postcode: e.target.value })}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* NDIS Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>NDIS Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-6">
                                    <Label>NDIS Number *</Label>
                                    <Input
                                        value={profileData.ndisNumber}
                                        onChange={(e) => setProfileData({ ...profileData, ndisNumber: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-6">
                                    <Label>Plan Type *</Label>
                                    <Input
                                        value={profileData.planType}
                                        onChange={(e) => setProfileData({ ...profileData, planType: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-6">
                                    <Label>Plan Budget</Label>
                                    <Input
                                        value={profileData.planBudget}
                                        onChange={(e) => setProfileData({ ...profileData, planBudget: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-6">
                                    <Label>Plan Expiry Date</Label>
                                    <DatePicker
                                        date={profileData.ndisExpiry ? new Date(profileData.ndisExpiry) : undefined}
                                        setDate={(date) => setProfileData({ ...profileData, ndisExpiry: date ? format(date, 'yyyy-MM-dd') : '' })}
                                        placeholder="Select plan expiry date"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Health & Support */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Health & Support Needs</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-6">
                                <Label>Diagnosis/Condition</Label>
                                <Input
                                    value={profileData.diagnosis}
                                    onChange={(e) => setProfileData({ ...profileData, diagnosis: e.target.value })}
                                />
                            </div>
                            <div className="space-y-6">
                                <Label>Support Needs</Label>
                                <Textarea
                                    value={profileData.supportNeeds}
                                    onChange={(e) => setProfileData({ ...profileData, supportNeeds: e.target.value })}
                                    rows={2}
                                />
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-6">
                                    <Label>Medications</Label>
                                    <Textarea
                                        value={profileData.medications}
                                        onChange={(e) => setProfileData({ ...profileData, medications: e.target.value })}
                                        rows={2}
                                    />
                                </div>
                                <div className="space-y-6">
                                    <Label>Allergies</Label>
                                    <Textarea
                                        value={profileData.allergies}
                                        onChange={(e) => setProfileData({ ...profileData, allergies: e.target.value })}
                                        rows={2}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Emergency Contact */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Emergency Contact</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-6">
                                <Label>Contact Name *</Label>
                                <Input
                                    value={profileData.emergencyContact}
                                    onChange={(e) => setProfileData({ ...profileData, emergencyContact: e.target.value })}
                                />
                            </div>
                            <div className="space-y-6">
                                <Label>Contact Phone *</Label>
                                <Input
                                    value={profileData.emergencyPhone}
                                    onChange={(e) => setProfileData({ ...profileData, emergencyPhone: e.target.value })}
                                />
                            </div>
                            <div className="space-y-6">
                                <Label>Relationship</Label>
                                <Input
                                    value={profileData.emergencyRelation}
                                    onChange={(e) => setProfileData({ ...profileData, emergencyRelation: e.target.value })}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Bank Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Bank Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-6">
                                    <Label>Account Name</Label>
                                    <Input
                                        value={bankData.accountName}
                                        onChange={(e) => setBankData({ ...bankData, accountName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-6">
                                    <Label>Bank Name</Label>
                                    <Input
                                        value={bankData.bankName}
                                        onChange={(e) => setBankData({ ...bankData, bankName: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-6">
                                    <Label>BSB</Label>
                                    <Input
                                        value={bankData.bsb}
                                        onChange={(e) => setBankData({ ...bankData, bsb: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-6">
                                    <Label>Account Number</Label>
                                    <Input
                                        value={bankData.accountNumber}
                                        onChange={(e) => setBankData({ ...bankData, accountNumber: e.target.value })}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Save Button */}
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setActiveTab('view')}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit}>
                            <Save className="h-4 w-4 mr-2" />
                            Save All Changes
                        </Button>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
