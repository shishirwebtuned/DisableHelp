'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, Eye } from 'lucide-react';
import Link from 'next/link';
import PersonalDetails, { PersonalDetailsData } from '@/components/profile/PersonalDetails';
import ProfessionalDetails, { ProfessionalDetailsData } from '@/components/profile/ProfessionalDetails';
import JobDetails, { JobDetailsData } from '@/components/profile/JobDetails';
import AdditionalDetails, { AdditionalDetailsData } from '@/components/profile/AdditionalDetails';
import ProfileImageEditor from '@/components/profile/ProfileImageEditor';

export default function WorkerProfilePage() {
    const [currentSection, setCurrentSection] = useState('personal-info');
    const [allProfileData, setAllProfileData] = useState<{
        personalDetails?: PersonalDetailsData;
        professionalDetails?: ProfessionalDetailsData;
        jobDetails?: JobDetailsData;
        additionalDetails?: AdditionalDetailsData;
        profileImage?: { base64: string; binary: Blob | null };
    }>({});

    // Navigation sections
    const sections = {
        personalDetails: [
            { id: 'personal-info', label: 'Personal Info', completed: true },
            { id: 'photo', label: 'Profile Photo', completed: true },
            { id: 'bio', label: 'Bio & About Me', completed: true },
            { id: 'contact', label: 'Contact Details', completed: true },
        ],
        jobDetails: [
            { id: 'preferred-hours', label: 'Preferred Hours', completed: true },
            { id: 'indicative-rates', label: 'Indicative Rates', completed: true },
            { id: 'services', label: 'Services Offered', completed: true },
        ],
        professionalDetails: [
            { id: 'experience', label: 'Experience', completed: true },
            { id: 'work-history', label: 'Work History', completed: true },
            { id: 'education-training', label: 'Education & Training', completed: true },
            { id: 'credentials', label: 'Credentials & Certifications', completed: true },
        ],
        additionalDetails: [
            { id: 'languages', label: 'Languages', completed: true },
            { id: 'interests-hobbies', label: 'Interests & Hobbies', completed: true },
            { id: 'cultural-background', label: 'Cultural Background', completed: true },
            { id: 'preferences', label: 'My Preferences', completed: false },
            { id: 'bank-account', label: 'Bank Account', completed: false },
        ],
    };

    const handlePersonalDetailsSave = (data: PersonalDetailsData) => {
        const updatedData = { ...allProfileData, personalDetails: data };
        setAllProfileData(updatedData);
        console.log('=== COMPLETE PROFILE DATA ===');
        console.log(JSON.stringify(updatedData, null, 2));
    };

    const handleProfessionalDetailsSave = (data: ProfessionalDetailsData) => {
        const updatedData = { ...allProfileData, professionalDetails: data };
        setAllProfileData(updatedData);
        console.log('=== COMPLETE PROFILE DATA ===');
        console.log(JSON.stringify(updatedData, null, 2));
    };

    const handleJobDetailsSave = (data: JobDetailsData) => {
        const updatedData = { ...allProfileData, jobDetails: data };
        setAllProfileData(updatedData);
        console.log('=== COMPLETE PROFILE DATA ===');
        console.log(JSON.stringify(updatedData, null, 2));
    };

    const handleAdditionalDetailsSave = (data: AdditionalDetailsData) => {
        const updatedData = { ...allProfileData, additionalDetails: data };
        setAllProfileData(updatedData);
        console.log('=== COMPLETE PROFILE DATA ===');
        console.log(JSON.stringify(updatedData, null, 2));
    };

    const handleProfileImageSave = (imageData: { base64: string; binary: Blob | null }) => {
        const updatedData = { ...allProfileData, profileImage: imageData };
        setAllProfileData(updatedData);
        console.log('=== COMPLETE PROFILE DATA ===');
        console.log('Profile Image Base64:', imageData.base64.substring(0, 100) + '...');
        console.log('Profile Image Binary:', {
            hasBinary: !!imageData.binary,
            size: imageData.binary?.size,
            type: imageData.binary?.type
        });
        console.log(JSON.stringify({ 
            ...updatedData, 
            profileImage: { 
                base64: '[BASE64_DATA]', 
                binary: imageData.binary ? '[BINARY_DATA]' : null 
            } 
        }, null, 2));
    };

    const handleSubmitAll = async () => {
        console.log('=== SUBMITTING ALL PROFILE DATA ===');
        
        // Here you would send the data to your API
        // The binary image can be sent using FormData
        if (allProfileData.profileImage?.binary) {
            const formData = new FormData();
            formData.append('profileImage', allProfileData.profileImage.binary, 'profile.png');
            formData.append('profileData', JSON.stringify({
                personalDetails: allProfileData.personalDetails,
                professionalDetails: allProfileData.professionalDetails,
                jobDetails: allProfileData.jobDetails,
                additionalDetails: allProfileData.additionalDetails,
            }));

            console.log('=== FormData Prepared for API ===');
            console.log('Profile Image (Binary):', {
                name: 'profile.png',
                size: allProfileData.profileImage.binary.size,
                type: allProfileData.profileImage.binary.type,
                isBinary: true
            });
            console.log('Profile Data:', {
                personalDetails: allProfileData.personalDetails,
                professionalDetails: allProfileData.professionalDetails,
                jobDetails: allProfileData.jobDetails,
                additionalDetails: allProfileData.additionalDetails,
            });
            
            // Uncomment to send to API:
            // const response = await fetch('/api/worker/profile', { 
            //     method: 'POST', 
            //     body: formData 
            // });
            
            alert('Profile data ready! Binary image included in FormData. Check console for details.');
        } else {
            console.log('No profile image binary available');
            console.log('Profile Data:', {
                personalDetails: allProfileData.personalDetails,
                professionalDetails: allProfileData.professionalDetails,
                jobDetails: allProfileData.jobDetails,
                additionalDetails: allProfileData.additionalDetails,
            });
            alert('Profile data logged (no image uploaded). Check console for details.');
        }
    };

    const renderSection = () => {
        switch (currentSection) {
            // Personal Details sections
            case 'personal-info':
            case 'bio':
            case 'contact':
                return <PersonalDetails onSave={handlePersonalDetailsSave} currentView={currentSection} />;
            
            case 'photo':
                return <ProfileImageEditor onSave={handleProfileImageSave} />;
            
            // Job Details sections
            case 'preferred-hours':
            case 'indicative-rates':
            case 'services':
                return <JobDetails onSave={handleJobDetailsSave} currentView={currentSection} />;
            
            // Professional Details sections
            case 'experience':
            case 'work-history':
            case 'education-training':
            case 'credentials':
                return <ProfessionalDetails onSave={handleProfessionalDetailsSave} currentView={currentSection} />;
            
            // Additional Details sections
            case 'languages':
            case 'interests-hobbies':
            case 'cultural-background':
            case 'preferences':
            case 'bank-account':
                return <AdditionalDetails onSave={handleAdditionalDetailsSave} currentView={currentSection} />;
            
            default:
                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Section Coming Soon</h2>
                            <p className="text-muted-foreground">This section is being developed</p>
                        </div>
                    </div>
                );
        }
    };

    const totalSections = Object.values(sections).flat().length;
    const completedSections = Object.values(sections).flat().filter(s => s.completed).length;
    const completionPercentage = Math.round((completedSections / totalSections) * 100);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
            <div className="container mx-auto">
                {/* Header */}
                <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-xl font-bold mb-2">My Profile</h1>
                        <p className="text-sm sm:text-base text-muted-foreground">
                            Complete your profile to attract more clients
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <Link href="/worker/view-profile" className="w-full sm:w-auto">
                            <Button variant="outline" className="w-full sm:w-auto">
                                <Eye className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline">Preview Profile</span>
                                <span className="sm:hidden">Preview</span>
                            </Button>
                        </Link>
                        <Button onClick={handleSubmitAll} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
                            <span className="hidden sm:inline">Submit All Data</span>
                            <span className="sm:hidden">Submit</span>
                        </Button>
                    </div>
                </div>

                {/* Completion Progress */}
                <Card className="mb-3 border-l-4 border-l-blue-600">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Profile Completeness</CardTitle>
                            <Badge variant={completionPercentage === 100 ? "default" : "secondary"} className="text-lg px-3 py-1">
                                {completionPercentage}%
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Progress value={completionPercentage} className="h-3" />
                        <p className="text-sm text-muted-foreground mt-2">
                            {completedSections} of {totalSections} sections completed
                        </p>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Left Sidebar - Navigation (Desktop only) */}
                    <div className="hidden lg:block lg:col-span-1">
                        <Card className="sticky top-6">
                            <CardContent className="p-4 space-y-6">
                                {/* Personal Details */}
                                <div>
                                    <h3 className="font-semibold text-sm px-3 mb-2 text-muted-foreground uppercase tracking-wider">Personal Details</h3>
                                    <div className="space-y-0.5">
                                        {sections.personalDetails.map((section) => (
                                            <button
                                                key={section.id}
                                                onClick={() => setCurrentSection(section.id)}
                                                className={`
                                                    w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors
                                                    ${currentSection === section.id
                                                        ? 'bg-blue-600 text-white font-medium shadow-sm'
                                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                                    }
                                                `}
                                            >
                                                {section.completed ? (
                                                    <CheckCircle className={`h-4 w-4 ${currentSection === section.id ? 'text-white' : 'text-green-600'}`} />
                                                ) : (
                                                    <Circle className={`h-4 w-4 ${currentSection === section.id ? 'text-white' : 'text-gray-400'}`} />
                                                )}
                                                <span className="flex-1 text-left">{section.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Job Details */}
                                <div>
                                    <h3 className="font-semibold text-sm px-3 mb-2 text-muted-foreground uppercase tracking-wider">Job Details</h3>
                                    <div className="space-y-0.5">
                                        {sections.jobDetails.map((section) => (
                                            <button
                                                key={section.id}
                                                onClick={() => setCurrentSection(section.id)}
                                                className={`
                                                    w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors
                                                    ${currentSection === section.id
                                                        ? 'bg-blue-600 text-white font-medium shadow-sm'
                                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                                    }
                                                `}
                                            >
                                                {section.completed ? (
                                                    <CheckCircle className={`h-4 w-4 ${currentSection === section.id ? 'text-white' : 'text-green-600'}`} />
                                                ) : (
                                                    <Circle className={`h-4 w-4 ${currentSection === section.id ? 'text-white' : 'text-gray-400'}`} />
                                                )}
                                                <span className="flex-1 text-left">{section.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Professional Details */}
                                <div>
                                    <h3 className="font-semibold text-sm px-3 mb-2 text-muted-foreground uppercase tracking-wider">Professional Details</h3>
                                    <div className="space-y-0.5">
                                        {sections.professionalDetails.map((section) => (
                                            <button
                                                key={section.id}
                                                onClick={() => setCurrentSection(section.id)}
                                                className={`
                                                    w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors
                                                    ${currentSection === section.id
                                                        ? 'bg-blue-600 text-white font-medium shadow-sm'
                                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                                    }
                                                `}
                                            >
                                                {section.completed ? (
                                                    <CheckCircle className={`h-4 w-4 ${currentSection === section.id ? 'text-white' : 'text-green-600'}`} />
                                                ) : (
                                                    <Circle className={`h-4 w-4 ${currentSection === section.id ? 'text-white' : 'text-gray-400'}`} />
                                                )}
                                                <span className="flex-1 text-left">{section.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Additional Details */}
                                <div>
                                    <h3 className="font-semibold text-sm px-3 mb-2 text-muted-foreground uppercase tracking-wider">Additional Details</h3>
                                    <div className="space-y-0.5">
                                        {sections.additionalDetails.map((section) => (
                                            <button
                                                key={section.id}
                                                onClick={() => setCurrentSection(section.id)}
                                                className={`
                                                    w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors
                                                    ${currentSection === section.id
                                                        ? 'bg-blue-600 text-white font-medium shadow-sm'
                                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                                    }
                                                `}
                                            >
                                                {section.completed ? (
                                                    <CheckCircle className={`h-4 w-4 ${currentSection === section.id ? 'text-white' : 'text-green-600'}`} />
                                                ) : (
                                                    <Circle className={`h-4 w-4 ${currentSection === section.id ? 'text-white' : 'text-gray-400'}`} />
                                                )}
                                                <span className="flex-1 text-left">{section.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <Card>
                            {/* Horizontal Scrollable Navigation (Mobile/Tablet only) */}
                            <div className="lg:hidden border-b bg-white dark:bg-slate-950 sticky top-0 z-10">
                                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800" style={{ maxHeight: '4rem' }}>
                                    <div className="flex gap-1 p-2 min-w-max items-center">
                                        {Object.values(sections).flat().map((section) => (
                                            <button
                                                key={section.id}
                                                onClick={() => setCurrentSection(section.id)}
                                                className={`
                                                    flex items-center gap-2 px-4 py-2 rounded-md text-sm whitespace-nowrap transition-colors
                                                    ${currentSection === section.id
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                                                    }
                                                `}
                                            >
                                                {section.completed ? (
                                                    <CheckCircle className="h-4 w-4" />
                                                ) : (
                                                    <Circle className="h-4 w-4" />
                                                )}
                                                <span>{section.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
                                <div className="scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
                                    {renderSection()}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
