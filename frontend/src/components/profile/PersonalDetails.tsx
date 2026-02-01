'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface PersonalDetailsProps {
    onSave: (data: PersonalDetailsData) => void;
    currentView?: string;
}

export interface PersonalDetailsData {
    personalInfo: {
        firstName: string;
        lastName: string;
        dateOfBirth: string;
        gender: string;
    };
    contactInfo: {
        email: string;
        phone: string;
        street: string;
        suburb: string;
        state: string;
        postcode: string;
    };
    bio: string;
}

export default function PersonalDetails({ onSave, currentView = 'personal-info' }: PersonalDetailsProps) {
    const [currentSection, setCurrentSection] = useState(currentView);
    
    const [personalInfo, setPersonalInfo] = useState({
        firstName: 'Sarah',
        lastName: 'Johnson',
        dateOfBirth: '1995-03-15',
        gender: 'female',
    });

    const [contactInfo, setContactInfo] = useState({
        email: 'sarah.johnson@example.com',
        phone: '+61 411 222 333',
        street: '123 Main Street',
        suburb: 'Sydney',
        state: 'NSW',
        postcode: '2000',
    });

    const [bio, setBio] = useState('Experienced disability support worker with 8 years of experience. Passionate about helping people live their best lives with compassion and professionalism.');

    useEffect(() => {
        setCurrentSection(currentView);
    }, [currentView]);

    useEffect(() => {
        const data = { personalInfo, contactInfo, bio };
        console.log('PersonalDetails Data:', data);
    }, [personalInfo, contactInfo, bio]);

    const handleSave = () => {
        const data = { personalInfo, contactInfo, bio };
        console.log('Saving Personal Details:', data);
        onSave(data);
    };

    const renderPersonalInfo = () => (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-2">Personal Information</h2>
                <p className="text-muted-foreground">Update your personal details</p>
            </div>
            <Card>
                <CardContent className="pt-6 space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <Label>First Name</Label>
                            <Input 
                                value={personalInfo.firstName} 
                                onChange={(e) => setPersonalInfo({...personalInfo, firstName: e.target.value})}
                                className="mt-2" 
                            />
                        </div>
                        <div>
                            <Label>Last Name</Label>
                            <Input 
                                value={personalInfo.lastName}
                                onChange={(e) => setPersonalInfo({...personalInfo, lastName: e.target.value})}
                                className="mt-2" 
                            />
                        </div>
                        <div>
                            <Label>Date of Birth</Label>
                            <div className="mt-2">
                                <DatePicker
                                    date={personalInfo.dateOfBirth ? new Date(personalInfo.dateOfBirth) : undefined}
                                    setDate={(date) => setPersonalInfo({ ...personalInfo, dateOfBirth: date ? format(date, 'yyyy-MM-dd') : '' })}
                                    placeholder="Select date of birth"
                                />
                            </div>
                        </div>
                        <div>
                            <Label>Gender</Label>
                            <Select 
                                value={personalInfo.gender}
                                onValueChange={(value) => setPersonalInfo({...personalInfo, gender: value})}
                            >
                                <SelectTrigger className="mt-2 w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <div className="flex justify-end gap-2">
                <Button variant="outline">Cancel</Button>
                <Button onClick={handleSave} className="bg-orange-500 hover:bg-orange-600">
                    Save Changes
                </Button>
            </div>
        </div>
    );

    const renderBio = () => (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-2">Bio & About Me</h2>
                <p className="text-muted-foreground">Tell clients about yourself and your approach to support work</p>
            </div>
            <Card>
                <CardContent className="pt-6 space-y-4">
                    <div>
                        <Label>Your Bio (500 words max)</Label>
                        <Textarea
                            rows={10}
                            placeholder="Tell clients about your experience, approach to care, and what makes you a great support worker..."
                            className="mt-2"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                        />
                        <p className="text-sm text-muted-foreground mt-2">{bio.split(' ').length} / 500 words</p>
                    </div>
                </CardContent>
            </Card>
            <div className="flex justify-end">
                <Button onClick={handleSave} className="bg-orange-500 hover:bg-orange-600">
                    Save and Continue
                </Button>
            </div>
        </div>
    );

    const renderContact = () => (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-2">Contact Details</h2>
                <p className="text-muted-foreground">Your contact information</p>
            </div>
            <Card>
                <CardContent className="pt-6 space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <Label>Email Address</Label>
                            <Input 
                                type="email" 
                                value={contactInfo.email}
                                onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
                                className="mt-2" 
                            />
                        </div>
                        <div>
                            <Label>Phone Number</Label>
                            <Input 
                                type="tel" 
                                value={contactInfo.phone}
                                onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
                                className="mt-2" 
                            />
                        </div>
                        <div>
                            <Label>Street Address</Label>
                            <Input 
                                value={contactInfo.street}
                                onChange={(e) => setContactInfo({...contactInfo, street: e.target.value})}
                                className="mt-2" 
                            />
                        </div>
                        <div>
                            <Label>Suburb</Label>
                            <Input 
                                value={contactInfo.suburb}
                                onChange={(e) => setContactInfo({...contactInfo, suburb: e.target.value})}
                                className="mt-2" 
                            />
                        </div>
                        <div>
                            <Label>State</Label>
                            <Select 
                                value={contactInfo.state}
                                onValueChange={(value) => setContactInfo({...contactInfo, state: value})}
                            >
                                <SelectTrigger className="mt-2 w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="NSW">New South Wales</SelectItem>
                                    <SelectItem value="VIC">Victoria</SelectItem>
                                    <SelectItem value="QLD">Queensland</SelectItem>
                                    <SelectItem value="SA">South Australia</SelectItem>
                                    <SelectItem value="WA">Western Australia</SelectItem>
                                    <SelectItem value="TAS">Tasmania</SelectItem>
                                    <SelectItem value="NT">Northern Territory</SelectItem>
                                    <SelectItem value="ACT">Australian Capital Territory</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Postcode</Label>
                            <Input 
                                value={contactInfo.postcode}
                                onChange={(e) => setContactInfo({...contactInfo, postcode: e.target.value})}
                                className="mt-2" 
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
            <div className="flex justify-end">
                <Button onClick={handleSave} className="bg-orange-500 hover:bg-orange-600">
                    Save and Continue
                </Button>
            </div>
        </div>
    );

    return (
        <div>
            {currentSection === 'personal-info' && renderPersonalInfo()}
            {currentSection === 'bio' && renderBio()}
            {currentSection === 'contact' && renderContact()}
        </div>
    );
}
