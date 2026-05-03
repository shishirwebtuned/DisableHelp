'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { format, set } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';

interface PersonalDetailsProps {
    onSave: (data: PersonalDetailsData, navigate?: boolean) => void;
    currentView?: string;
    initialData?: PersonalDetailsData;
    isNdisProvider?: boolean;
}

export interface PersonalDetailsData {
    personalInfo: {
        firstName: string;
        lastName?: string;
        gender: string;
        dateOfBirth: string;
        bio: string;
    };
    contactInfo: {
        email: string;
        phone: string;
        name: string;
        street: string;
        suburb: string;
        state: string;
        postcode: string;
    };
    bio: string;
}

export default function PersonalDetails({ onSave, currentView = 'personal-info', initialData, isNdisProvider = false }: PersonalDetailsProps) {
    const [currentSection, setCurrentSection] = useState(currentView);
    const showGender = !isNdisProvider;

    const [personalInfo, setPersonalInfo] = useState({
        firstName: initialData?.personalInfo?.firstName || '',
        lastName: initialData?.personalInfo?.lastName || '',
        gender: initialData?.personalInfo?.gender || '',
        dateOfBirth: initialData?.personalInfo?.dateOfBirth || '',
        bio: initialData?.personalInfo?.bio || ''
    });

    const [contactInfo, setContactInfo] = useState({
        email: initialData?.contactInfo?.email || '',
        name: initialData?.contactInfo?.name || '',
        phone: initialData?.contactInfo?.phone || '',
        street: initialData?.contactInfo?.street || '',
        suburb: initialData?.contactInfo?.suburb || '',
        state: initialData?.contactInfo?.state || '',
        postcode: initialData?.contactInfo?.postcode || '',
    });

    const [bio, setBio] = useState(initialData?.bio || '');
    const [bioTouched, setBioTouched] = useState(false);
    const [contactTouched, setContactTouched] = useState(false);

    const isInitialized = useRef(false);

    // Update state when initialData provided
    useEffect(() => {
        if (initialData) {
            setPersonalInfo(prev => {
                const updated = {
                    firstName: initialData.personalInfo?.firstName || '',
                    lastName: initialData.personalInfo?.lastName || '',
                    gender: initialData.personalInfo?.gender || '',
                    dateOfBirth: initialData.personalInfo?.dateOfBirth || '',
                    bio: initialData.personalInfo?.bio || ''
                };
                return JSON.stringify(updated) === JSON.stringify(prev) ? prev : updated;
            });

            setContactInfo(prev => {
                const updated = {
                    email: initialData.contactInfo?.email || '',
                    name: initialData.contactInfo?.name || '',
                    phone: initialData.contactInfo?.phone || '',
                    street: initialData.contactInfo?.street || '',
                    suburb: initialData.contactInfo?.suburb || '',
                    state: initialData.contactInfo?.state || '',
                    postcode: initialData.contactInfo?.postcode || '',

                };
                return JSON.stringify(updated) === JSON.stringify(prev) ? prev : updated;
            });

            setBio(prev => {
                const updated = initialData.bio || '';
                return updated === prev ? prev : updated;
            });

            isInitialized.current = true;
        }
    }, [initialData]);

    useEffect(() => {
        setCurrentSection(currentView);
    }, [currentView]);

    const currentData = useMemo(() => ({
        personalInfo,
        contactInfo,
        bio
    }), [personalInfo, contactInfo, bio]);

    // Auto-sync back to parent
    useEffect(() => {
        if (!initialData || !isInitialized.current) return;

        const initialStr = JSON.stringify(initialData);
        const currentStr = JSON.stringify(currentData);

        // Only sync if there's a real difference
        if (currentStr !== initialStr) {
            const timeoutId = setTimeout(() => {
                onSave(currentData, false);
            }, 0);
            return () => clearTimeout(timeoutId);
        }
    }, [currentData, initialData, onSave]);

    const handleSave = useCallback(() => {
        onSave(currentData, true);
    }, [currentData, onSave]);


    const isBioValid = bio.trim().length < 500 && bio.trim().length >= 5;
    const isSuburbValid = contactInfo.suburb.trim().length > 0;
    const isStateValid = contactInfo.state.trim().length > 0;
    const isContactFormValid = isSuburbValid && isStateValid;
    const renderPersonalInfo = () => (
        <div className="space-y-6">
            <div>
                <h2 className="md:text-xl text-lg lg:text-2xl font-bold mb-1 md:mb-2">Personal Information</h2>
                <p className="text-muted-foreground lg:text-base md:text-[15px] text-[13px]">Update your personal details</p>
            </div>
            <Card className=' border-none p-0'>
                <CardContent className="pt-6 p-0 space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <Label>{isNdisProvider ? 'Company Name' : 'First Name'}</Label>
                            <Input
                                value={personalInfo.firstName}
                                disabled
                                onChange={(e) => setPersonalInfo({ ...personalInfo, firstName: e.target.value })}
                                className="mt-2 cursor-not-allowed"
                            />
                        </div>
                        {!isNdisProvider && (
                            <div>
                                <Label>Last Name</Label>
                                <Input
                                    value={personalInfo?.lastName}
                                    disabled
                                    onChange={(e) => setPersonalInfo({ ...personalInfo, lastName: e.target.value })}
                                    className="mt-2 cursor-not-allowed"
                                />
                            </div>
                        )}
                        {showGender && (
                            <div>
                                <Label>Gender</Label>
                                <Select
                                    value={personalInfo.gender}
                                    disabled
                                    onValueChange={(value) => setPersonalInfo({ ...personalInfo, gender: value })}
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
                        )}
                        <div>
                            <Label>{isNdisProvider ? 'Date of Registration' : 'Date of Birth'}</Label>
                            <DatePicker
                                value={personalInfo.dateOfBirth}
                                disabled
                                className="mt-2 cursor-not-allowed"
                                onChange={(value) => setPersonalInfo({ ...personalInfo, dateOfBirth: value ? value.toISOString() : '' })}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    const renderBio = () => (
        <div className="space-y-6">
            <div>
                <h2 className="md:text-xl text-lg lg:text-2xl font-bold mb-1 md:mb-2">Bio & About Me</h2>
                <p className="text-muted-foreground lg:text-base md:text-[15px] text-[13px]">Tell clients about yourself and your approach to support work</p>
            </div>
            <Card className=' border-none p-0'>
                <CardContent className="md:pt-4 pt-2 lg:pt-4 p-0 space-y-4">
                    <div>
                        <Label className='flex items-center gap-1'>
                            Your Bio (500 words max){' '}
                            <span className="text-red-500 text-lg">*</span>
                        </Label>
                        <Textarea
                            rows={10}
                            placeholder="Tell clients about your experience, approach to care, and what makes you a great support worker..."
                            className={`mt-2 lg:text-base md:text-sm text-xs ${bioTouched && !isBioValid ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            onBlur={() => setBioTouched(true)}
                        />
                        {bioTouched && !isBioValid && (
                            <p className="text-red-500 text-sm mt-1">Bio is required and must be at least 5 characters long.</p>
                        )}
                        <p className="md:text-[13px] text-[11px] lg:text-sm text-muted-foreground mt-2">{bio.trim() ? bio.trim().split(/\s+/).length : 0} / 500 words</p>
                    </div>
                </CardContent>
            </Card>
            <div className=" disabled flex justify-end">
                <Button
                    onClick={() => {
                        setBioTouched(true);
                        if (isBioValid) handleSave();
                    }}
                    className=""
                >
                    Save and Continue
                </Button>
            </div>
        </div>
    );

    const renderContact = () => (
        <div className="space-y-6">
            <div>
                <h2 className="md:text-xl text-lg lg:text-2xl font-bold mb-1 md:mb-2">Contact Details</h2>
                <p className="text-muted-foreground lg:text-base md:text-[15px] text-[13px]">Your contact information</p>
            </div>
            <Card className=' p-0 border-none'>
                <CardContent className="pt-6 p-0 space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <Label>Email Address</Label>
                            <Input
                                type="email"
                                value={contactInfo.email}
                                disabled
                                readOnly
                                // onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                                className="mt-2"
                            />
                        </div>
                        <div>
                            <Label>Phone Number</Label>
                            <Input
                                type="tel"
                                value={contactInfo.phone}
                                disabled
                                readOnly
                                // onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                                className="mt-2"
                            />
                        </div>
                        <div>
                            <Label>Street Address</Label>
                            <Input
                                value={contactInfo.name}
                                onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })}
                                className="mt-2"
                            />
                        </div>
                        <div>
                            <Label className='flex items-center gap-1 relative'>
                                Suburb <span className="text-red-500 text-lg absolute left-13">*</span>
                            </Label>
                            <Input
                                value={contactInfo.suburb}
                                onChange={(e) => setContactInfo({ ...contactInfo, suburb: e.target.value })}
                                onBlur={() => setContactTouched(true)}
                                className={`mt-2 ${contactTouched && !isSuburbValid ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
                            />

                            {contactTouched && !isSuburbValid && (
                                <p className="text-red-500 text-xs mt-1">Suburb is required</p>
                            )}
                        </div>
                        <div>
                            <Label className='flex items-center gap-1 relative'>
                                State <span className="text-red-500 text-lg absolute left-10">*</span>
                            </Label>
                            <Select
                                value={contactInfo.state}
                                onValueChange={(value) => {
                                    setContactInfo({ ...contactInfo, state: value });
                                    setContactTouched(true);
                                }}
                            >
                                <SelectTrigger className={`mt-2 w-full ${contactTouched && !isStateValid ? 'border-red-400 ring-red-400' : ''}`}>
                                    <SelectValue placeholder="Select state" />
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
                            {contactTouched && !isStateValid && (
                                <p className="text-red-500 text-xs mt-1">State is required</p>
                            )}
                        </div>
                        <div>
                            <Label>Postcode</Label>
                            <Input
                                value={contactInfo.postcode}
                                onChange={(e) => setContactInfo({ ...contactInfo, postcode: e.target.value })}
                                className="mt-2"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
            <div className="flex justify-end">
                <Button
                    onClick={() => {
                        setContactTouched(true);
                        if (isContactFormValid) handleSave();
                    }}
                    className=""
                >
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
