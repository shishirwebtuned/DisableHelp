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
        <div className="space-y-2">
            {/* Profile View/Edit Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">My Profile</h1>
                        <p className="text-muted-foreground">View and manage your personal information</p>
                    </div>
                    <TabsList>
                        <TabsTrigger value="view">
                            <User className="h-4 w-4 mr-2" />
                            View Profile
                        </TabsTrigger>
                        <TabsTrigger value="edit">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Profile
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* VIEW PROFILE TAB */}
                <TabsContent value="view" className="space-y-6">
                    {/* Profile Header Card */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="flex flex-col items-center md:items-start gap-4">
                                    <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                                        <AvatarImage src={profileImage} />
                                        <AvatarFallback className="text-2xl">
                                            {profileData.firstName[0]}{profileData.lastName[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="text-center md:text-left">
                                        <h2 className="text-2xl font-bold">
                                            {profileData.firstName} {profileData.lastName}
                                        </h2>
                                        <p className="text-muted-foreground">NDIS Participant</p>
                                        <Badge className="mt-2" variant="outline">
                                            <Shield className="h-3 w-3 mr-1" />
                                            ID Verified
                                        </Badge>
                                    </div>
                                </div>
                                
                                <div className="flex-1">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {profileStats.map((stat) => (
                                            <div key={stat.label} className="text-center p-3 rounded-lg bg-muted/50">
                                                <stat.icon className={`h-5 w-5 mx-auto mb-2 ${stat.color}`} />
                                                <div className="text-2xl font-bold">{stat.value}</div>
                                                <div className="text-xs text-muted-foreground">{stat.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="mt-4 text-sm">{profileData.bio}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Personal Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Personal Information
                            </CardTitle>
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
                                <Label className="text-muted-foreground">Email</Label>
                                <p className="font-medium flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    {profileData.email}
                                </p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Phone</Label>
                                <p className="font-medium flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    {profileData.phone}
                                </p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Preferred Language</Label>
                                <p className="font-medium flex items-center gap-2">
                                    <Globe className="h-4 w-4 text-muted-foreground" />
                                    {profileData.preferredLanguage}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Address Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                Address & Location
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label className="text-muted-foreground">Full Address</Label>
                                <p className="font-medium">{profileData.address}</p>
                            </div>
                            <div className="grid gap-4 md:grid-cols-3">
                                <div>
                                    <Label className="text-muted-foreground">Suburb</Label>
                                    <p className="font-medium">{profileData.suburb}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">State</Label>
                                    <p className="font-medium">{profileData.state}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Postcode</Label>
                                    <p className="font-medium">{profileData.postcode}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* NDIS Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                NDIS Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-6 md:grid-cols-2">
                            <div>
                                <Label className="text-muted-foreground">NDIS Number</Label>
                                <p className="font-medium font-mono">{profileData.ndisNumber}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Plan Type</Label>
                                <Badge variant="outline">{profileData.planType}</Badge>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Plan Budget</Label>
                                <p className="font-medium">{profileData.planBudget}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Plan Expiry</Label>
                                <p className="font-medium flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    {new Date(profileData.ndisExpiry).toLocaleDateString()}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Health & Support Needs */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Heart className="h-5 w-5" />
                                Health & Support Needs
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label className="text-muted-foreground">Diagnosis/Condition</Label>
                                <p className="font-medium">{profileData.diagnosis}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Support Needs</Label>
                                <p className="font-medium">{profileData.supportNeeds}</p>
                            </div>
                            <Separator />
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <Label className="text-muted-foreground">Medications</Label>
                                    <p className="text-sm">{profileData.medications}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Allergies</Label>
                                    <p className="text-sm">{profileData.allergies}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Emergency Contact */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5" />
                                Emergency Contact
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-3">
                            <div>
                                <Label className="text-muted-foreground">Name</Label>
                                <p className="font-medium">{profileData.emergencyContact}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Phone</Label>
                                <p className="font-medium">{profileData.emergencyPhone}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Relationship</Label>
                                <p className="font-medium">{profileData.emergencyRelation}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Bank Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                Bank Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
                            <div>
                                <Label className="text-muted-foreground">Account Name</Label>
                                <p className="font-medium">{bankData.accountName}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Bank Name</Label>
                                <p className="font-medium">{bankData.bankName}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">BSB</Label>
                                <p className="font-medium font-mono">{bankData.bsb}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Account Number</Label>
                                <p className="font-medium font-mono">{bankData.accountNumber}</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* EDIT PROFILE TAB */}
                <TabsContent value="edit" className="space-y-6">
                    {/* Profile Photo Upload with Editor */}
                    <ProfileImageEditor onSave={handleProfileImageSave} />

                    {/* Personal Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>First Name *</Label>
                                    <Input
                                        value={profileData.firstName}
                                        onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Last Name *</Label>
                                    <Input
                                        value={profileData.lastName}
                                        onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Email *</Label>
                                    <Input
                                        type="email"
                                        value={profileData.email}
                                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Phone *</Label>
                                    <Input
                                        value={profileData.phone}
                                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label>Date of Birth</Label>
                                    <DatePicker
                                        date={profileData.dateOfBirth ? new Date(profileData.dateOfBirth) : undefined}
                                        setDate={(date) => setProfileData({ ...profileData, dateOfBirth: date ? format(date, 'yyyy-MM-dd') : '' })}
                                        placeholder="Select date of birth"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Gender</Label>
                                    <Input
                                        value={profileData.gender}
                                        onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Language</Label>
                                    <Input
                                        value={profileData.preferredLanguage}
                                        onChange={(e) => setProfileData({ ...profileData, preferredLanguage: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
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
                            <div className="space-y-2">
                                <Label>Full Address *</Label>
                                <Input
                                    value={profileData.address}
                                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label>Suburb</Label>
                                    <Input
                                        value={profileData.suburb}
                                        onChange={(e) => setProfileData({ ...profileData, suburb: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>State</Label>
                                    <Input
                                        value={profileData.state}
                                        onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
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
                                <div className="space-y-2">
                                    <Label>NDIS Number *</Label>
                                    <Input
                                        value={profileData.ndisNumber}
                                        onChange={(e) => setProfileData({ ...profileData, ndisNumber: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Plan Type *</Label>
                                    <Input
                                        value={profileData.planType}
                                        onChange={(e) => setProfileData({ ...profileData, planType: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Plan Budget</Label>
                                    <Input
                                        value={profileData.planBudget}
                                        onChange={(e) => setProfileData({ ...profileData, planBudget: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
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
                            <div className="space-y-2">
                                <Label>Diagnosis/Condition</Label>
                                <Input
                                    value={profileData.diagnosis}
                                    onChange={(e) => setProfileData({ ...profileData, diagnosis: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Support Needs</Label>
                                <Textarea
                                    value={profileData.supportNeeds}
                                    onChange={(e) => setProfileData({ ...profileData, supportNeeds: e.target.value })}
                                    rows={2}
                                />
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Medications</Label>
                                    <Textarea
                                        value={profileData.medications}
                                        onChange={(e) => setProfileData({ ...profileData, medications: e.target.value })}
                                        rows={2}
                                    />
                                </div>
                                <div className="space-y-2">
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
                            <div className="space-y-2">
                                <Label>Contact Name *</Label>
                                <Input
                                    value={profileData.emergencyContact}
                                    onChange={(e) => setProfileData({ ...profileData, emergencyContact: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Contact Phone *</Label>
                                <Input
                                    value={profileData.emergencyPhone}
                                    onChange={(e) => setProfileData({ ...profileData, emergencyPhone: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
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
                                <div className="space-y-2">
                                    <Label>Account Name</Label>
                                    <Input
                                        value={bankData.accountName}
                                        onChange={(e) => setBankData({ ...bankData, accountName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Bank Name</Label>
                                    <Input
                                        value={bankData.bankName}
                                        onChange={(e) => setBankData({ ...bankData, bankName: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>BSB</Label>
                                    <Input
                                        value={bankData.bsb}
                                        onChange={(e) => setBankData({ ...bankData, bsb: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
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
