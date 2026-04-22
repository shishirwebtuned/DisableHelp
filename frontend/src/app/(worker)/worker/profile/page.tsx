'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Circle, Eye } from 'lucide-react';
import Link from 'next/link';
import PersonalDetails, { PersonalDetailsData } from '@/components/profile/PersonalDetails';
import ProfessionalDetails, { ProfessionalDetailsData } from '@/components/profile/ProfessionalDetails';
import JobDetails, { JobDetailsData } from '@/components/profile/JobDetails';
import AdditionalDetails, { AdditionalDetailsData } from '@/components/profile/AdditionalDetails';
import ProfileImageEditor from '@/components/profile/ProfileImageEditor';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { updateWorkerProfile } from '@/redux/slices/profileSlice';
import { transformToAPISchema } from '@/types/profileTransformer';
import { toast } from 'sonner';

const sectionOrder = [
    'personal-info', 'photo', 'bio', 'contact',
    'preferred-hours', 'indicative-rates', 'services',
    'experience', 'work-history', 'education-training', 'credentials',
    'languages', 'interests-hobbies', 'cultural-background', 'preferences', 'bank-account', 'immunisation'
];

export default function WorkerProfilePage() {
    const dispatch = useAppDispatch();
    const { loading, error } = useAppSelector((state) => state.profile);
    const { mee } = useAppSelector((state) => state.auth);
    const isProvider = Boolean((mee as any)?.user?.isNdisProvider);

    const [currentSection, setCurrentSection] = useState('personal-info');
    const [allProfileData, setAllProfileData] = useState<{
        personalDetails?: PersonalDetailsData;
        professionalDetails?: ProfessionalDetailsData;
        jobDetails?: JobDetailsData;
        additionalDetails?: AdditionalDetailsData;
        profileImage?: { base64: string; binary: Blob | null };
    }>({});

    const visibleSectionOrder = useMemo(() => {
        return sectionOrder.filter((sectionId) => {
            if (!isProvider) return true;
            return !['work-history', 'education-training', 'immunisation'].includes(sectionId);
        });
    }, [isProvider]);

    useEffect(() => {
        if (!visibleSectionOrder.includes(currentSection)) {
            setCurrentSection(visibleSectionOrder[0] || 'personal-info');
        }
    }, [currentSection, visibleSectionOrder]);

    useEffect(() => {
        if (mee) {
            const userData = mee as any;
            const profile = userData.profile;
            // Map Personal Details
            const mappedPersonalDetails: PersonalDetailsData = {
                personalInfo: {
                    firstName: userData.user?.firstName || '',
                    lastName: userData.user?.lastName || '',
                    gender: profile?.gender || userData.user?.gender || '',
                    dateOfBirth: profile?.personalDetails?.dateOfBirth || profile?.dateOfBirth || userData.user?.dateOfBirth || '',
                    bio: profile?.personalDetails?.bio || profile?.bio || '',
                },
                contactInfo: {
                    email: userData.user?.email || '',
                    phone: userData.user?.phoneNumber || '',
                    name: profile?.locations?.[0]?.name || '',
                    street: profile?.locations?.[0]?.street || '',
                    suburb: profile?.locations?.[0]?.suburb || profile?.address?.suburb || '',
                    state: profile?.locations?.[0]?.state || profile?.address?.state || '',
                    postcode: profile?.locations?.[0]?.postalCode || profile?.address?.postcode || '',
                },
                bio: profile?.personalDetails?.bio || profile?.bio || '',
            };

            // Map Professional Details
            const mappedProfessionalDetails: ProfessionalDetailsData = {
                experience: {
                    years: profile?.experienceSummary?.disability?.experience?.[0]?.replace(/[^0-9]/g, '') ||
                        profile?.experienceSummary?.agedCare?.experience?.[0]?.replace(/[^0-9]/g, '') || '',
                    totalHours: '', // Field not in API schema
                    specializations: profile?.experienceSummary?.disability?.description ||
                        profile?.experienceSummary?.agedCare?.description || '',
                },
                workHistory: profile?.workHistory?.map((work: any, index: number) => ({
                    id: index + 1,
                    jobTitle: work.jobTitle,
                    organisation: work.organisation,
                    startDate: work.startDate,
                    endDate: work.endDate,
                    currentlyWorkingHere: work.currentlyWorkingHere,
                    desc: '', // Field not in API schema
                })) || [],
                education: profile?.educationAndTraining?.map((edu: any, index: number) => ({
                    id: index + 1,
                    course: edu.course,
                    institution: edu.institution,
                    startDate: edu.startDate,
                    endDate: edu.endDate,
                    currentlyStudyingHere: edu.currentlyStudyingHere,
                })) || [],
                ndisWorkerScreening: {
                    screening_number: profile?.ndisWorkerScreening?.screening_number || '',
                    expiry_date: profile?.ndisWorkerScreening?.expiry_date || '',
                    legal_first_name: profile?.ndisWorkerScreening?.legal_first_name || '',
                    legal_last_name: profile?.ndisWorkerScreening?.legal_last_name || '',
                    date_of_birth: profile?.ndisWorkerScreening?.date_of_birth || '',
                },
                wwcc: {
                    wwccNumber: profile?.personalDetails?.wwcc?.wwccNumber || profile?.wwcc?.wwccNumber || '',
                    expiryDate: profile?.personalDetails?.wwcc?.expiryDate || profile?.wwcc?.expiryDate || '',
                },
                additionalTraining: {
                    cpr: { expiryDate: profile?.personalDetails?.additionalTraining?.cpr?.expiryDate || profile?.additionalTraining?.cpr?.expiryDate || '' },
                    firstAid: { expiryDate: profile?.personalDetails?.additionalTraining?.firstAid?.expiryDate || profile?.additionalTraining?.firstAid?.expiryDate || '' },
                    driverLicense: { expiryDate: profile?.personalDetails?.additionalTraining?.driverLicense?.expiryDate || profile?.additionalTraining?.driverLicense?.expiryDate || '' },
                },
            };

            // Map Job Details
            const mapAvailabilityToUI = (availability: any) => {
                if (!availability) return {};
                const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                const result: any = {};

                days.forEach(day => {
                    const key = day.toLowerCase();
                    const dayData = availability[key];
                    if (dayData) {
                        result[day] = {
                            enabled: dayData.available,
                            slots: dayData.times?.map((t: any) => `${convertTo12Hour(t.startTime)}-${convertTo12Hour(t.endTime)}`) || []
                        };
                    }
                });
                return result;
            };

            const convertTo12Hour = (time: string) => {
                if (!time) return '';
                const [h, m] = time.split(':').map(Number);
                const ampm = h >= 12 ? 'pm' : 'am';
                const hour12 = h % 12 || 12;
                return `${hour12}${ampm}`;
            };

            const mappedJobDetails: JobDetailsData = {
                preferredHours: mapAvailabilityToUI(profile?.availability),
                rates: {
                    standard: profile?.rates?.find((r: any) => r.name === 'Hourly Rate')?.rate || 0,
                    weekend: profile?.rates?.find((r: any) => r.name === 'Weekend Rate')?.rate || 0,
                    evening: profile?.rates?.find((r: any) => r.name === 'Evening Rate')?.rate || 0,
                    overnight: profile?.rates?.find((r: any) => r.name === 'Overnight Rate')?.rate || 0,
                },
                selectedServices: profile?.services || [],
                freeMeetAndGreet: profile?.freeMeetAndGreet || false,
            };

            // Map Additional Details
            const mappedAdditionalDetails: AdditionalDetailsData = {
                languages: {
                    firstLanguages: profile?.languages?.firstLanguages || [],
                    secondLanguages: profile?.languages?.secondLanguages || [],
                },
                selectedInterests: profile?.interests || [],
                culturalInfo: {
                    background: profile?.culturalBackground || [],
                    religion: profile?.religion || [],
                    smokingPolicy: profile?.aboutMe?.nonSmoker === true ? 'non-smoker' :
                        profile?.aboutMe?.nonSmoker === false ? 'smoker' : 'non-smoker',
                    petFriendly: profile?.aboutMe?.petFriendly === true ? 'yes' :
                        profile?.aboutMe?.petFriendly === false ? 'no' : 'yes',
                },
                preferences: {
                    preferredClientAge: Array.isArray(profile?.preferences) ? (profile.preferences[0] || 'No preference') : 'No preference',
                    preferredGender: Array.isArray(profile?.preferences) ? (profile.preferences[1] || 'No preference') : 'No preference',
                    willingToTravel: profile?.preferences?.willingToTravel || 'yes',
                    maxTravelDistance: profile?.preferences?.maxTravelDistance || '20',
                },
                bankDetails: profile?.bankDetails || {
                    accountName: '',
                    bsb: '',
                    accountNumber: '',
                },
                immunisation: {
                    hasSeasonalFluShot: profile?.immunisation?.hasSeasonalFluShot || profile?.personalDetails?.immunisation?.hasSeasonalFluShot || false,
                    covidVaccineStatus: profile?.immunisation?.covidVaccineStatus || profile?.personalDetails?.immunisation?.covidVaccineStatus || 'notVaccinated',
                    statusConfirmed: profile?.immunisation?.statusConfirmed || profile?.personalDetails?.immunisation?.statusConfirmed || false,
                },
                lgbtqiaPlusFriendly: profile?.lgbtqiaPlusFriendly || false,
                personality: profile?.aboutMe?.personality || '',
            };

            setAllProfileData({
                personalDetails: mappedPersonalDetails,
                professionalDetails: mappedProfessionalDetails,
                jobDetails: mappedJobDetails,
                additionalDetails: mappedAdditionalDetails,
                profileImage: profile?.personalDetails?.avatar ? {
                    base64: profile.personalDetails.avatar.url,
                    binary: null
                } : undefined
            });
        }
    }, [mee]);

    const handleNextSection = useCallback(() => {
        const currentIndex = visibleSectionOrder.indexOf(currentSection);
        if (currentIndex < visibleSectionOrder.length - 1) {
            setCurrentSection(visibleSectionOrder[currentIndex + 1]);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [currentSection, visibleSectionOrder]);

    const isSectionCompleted = useCallback((sectionId: string) => {
        const data = allProfileData;
        const profile = (mee as any)?.profile;
        switch (sectionId) {
            case 'personal-info': return !!(data.personalDetails?.personalInfo.firstName && data.personalDetails?.personalInfo.lastName);
            case 'bio': return !!data.personalDetails?.bio;
            case 'contact': return !!(data.personalDetails?.contactInfo.email && data.personalDetails?.contactInfo.phone);
            case 'photo': return !!(data.profileImage?.base64 || profile?.personalDetails?.avatar?.url);
            case 'preferred-hours': return !!(data.jobDetails?.preferredHours && Object.keys(data.jobDetails.preferredHours).length > 0);
            case 'indicative-rates': return !!(data.jobDetails?.rates && data.jobDetails.rates.standard > 0);
            case 'services': return !!(data.jobDetails?.selectedServices && data.jobDetails.selectedServices.length > 0);
            case 'experience': return !!data.professionalDetails?.experience?.years;
            case 'work-history': return !!(data.professionalDetails?.workHistory && data.professionalDetails.workHistory.length > 0);
            case 'education-training': return !!(data.professionalDetails?.education && data.professionalDetails.education.length > 0);
            case 'credentials': return !!(data.professionalDetails?.ndisWorkerScreening?.screening_number || data.professionalDetails?.wwcc?.wwccNumber);
            case 'languages': return !!(data.additionalDetails?.languages?.firstLanguages && data.additionalDetails.languages.firstLanguages.length > 0);
            case 'interests-hobbies': return !!(data.additionalDetails?.selectedInterests && data.additionalDetails.selectedInterests.length > 0);
            case 'cultural-background': return !!(data.additionalDetails?.culturalInfo?.background && data.additionalDetails.culturalInfo.background.length > 0);
            case 'preferences': return !!data.additionalDetails?.preferences?.preferredClientAge;
            case 'bank-account': return !!data.additionalDetails?.bankDetails?.accountName;
            case 'immunisation': return !!data.additionalDetails?.immunisation?.covidVaccineStatus;
            default: return false;
        }
    }, [allProfileData, mee]);

    const sections = useMemo(() => {
        const personalDetails = [
            { id: 'personal-info', label: 'Personal Information', completed: isSectionCompleted('personal-info') },
            { id: 'photo', label: 'Profile Photo', completed: isSectionCompleted('photo') },
            { id: 'bio', label: 'Bio', completed: isSectionCompleted('bio') },
            { id: 'contact', label: 'Contact Details', completed: isSectionCompleted('contact') },
        ];

        const jobDetails = [
            { id: 'preferred-hours', label: 'Preferred Hours', completed: isSectionCompleted('preferred-hours') },
            { id: 'indicative-rates', label: 'Indicative Rates', completed: isSectionCompleted('indicative-rates') },
            { id: 'services', label: 'Services Offered', completed: isSectionCompleted('services') },
        ];

        const professionalDetails = [
            { id: 'experience', label: 'Experience', completed: isSectionCompleted('experience') },
            ...(!isProvider ? [
                { id: 'work-history', label: 'Work History', completed: isSectionCompleted('work-history') },
                { id: 'education-training', label: 'Education & Training', completed: isSectionCompleted('education-training') },
            ] : []),
            { id: 'credentials', label: 'Credentials & Certifications', completed: isSectionCompleted('credentials') },
        ];

        const additionalDetails = [
            { id: 'languages', label: 'Languages', completed: isSectionCompleted('languages') },
            { id: 'interests-hobbies', label: 'Interests & Hobbies', completed: isSectionCompleted('interests-hobbies') },
            { id: 'cultural-background', label: 'Cultural Background', completed: isSectionCompleted('cultural-background') },
            { id: 'preferences', label: 'My Preferences', completed: isSectionCompleted('preferences') },
            { id: 'bank-account', label: 'Bank Account', completed: isSectionCompleted('bank-account') },
            ...(!isProvider ? [{ id: 'immunisation', label: 'Immunisation', completed: isSectionCompleted('immunisation') }] : []),
        ];

        return {
            personalDetails,
            jobDetails,
            professionalDetails,
            additionalDetails,
        };
    }, [isProvider, isSectionCompleted]);

    const handlePersonalDetailsSave = useCallback((data: PersonalDetailsData, navigate = true) => {
        setAllProfileData(prev => {
            if (JSON.stringify(prev.personalDetails) === JSON.stringify(data)) return prev;
            return { ...prev, personalDetails: data };
        });
        if (navigate) handleNextSection();
    }, [handleNextSection]);

    const handleProfessionalDetailsSave = useCallback((data: ProfessionalDetailsData, navigate = true) => {
        setAllProfileData(prev => {
            if (JSON.stringify(prev.professionalDetails) === JSON.stringify(data)) return prev;
            return { ...prev, professionalDetails: data };
        });
        if (navigate) handleNextSection();
    }, [handleNextSection]);

    const handleJobDetailsSave = useCallback((data: JobDetailsData, navigate = true) => {
        setAllProfileData(prev => {
            if (JSON.stringify(prev.jobDetails) === JSON.stringify(data)) return prev;
            return { ...prev, jobDetails: data };
        });
        if (navigate) handleNextSection();
    }, [handleNextSection]);

    const handleAdditionalDetailsSave = useCallback((data: AdditionalDetailsData, navigate = true) => {
        setAllProfileData(prev => {
            if (JSON.stringify(prev.additionalDetails) === JSON.stringify(data)) return prev;
            return { ...prev, additionalDetails: data };
        });
        if (navigate) handleNextSection();
    }, [handleNextSection]);

    const handleProfileImageSave = useCallback((imageData: { base64: string; binary: Blob | null }, navigate = true) => {
        setAllProfileData(prev => {
            if (JSON.stringify(prev.profileImage) === JSON.stringify(imageData)) return prev;
            return { ...prev, profileImage: imageData };
        });
        if (navigate) handleNextSection();
    }, [handleNextSection]);

    const handleSubmitAll = async () => {
        try {
            const apiData = transformToAPISchema(allProfileData);

            const formData = new FormData();

            // Append binary avatar if exists
            if (allProfileData.profileImage?.binary) {
                console.log('Appending binary avatar to FormData');
                formData.append('avatar', allProfileData.profileImage.binary, 'profile-image.png');
            }

            // Recursive function to append JSON data as FormData fields
            const appendToFormData = (data: any, rootKey: string) => {
                if (data === null || data === undefined) return;

                if (data instanceof File || data instanceof Blob) {
                    formData.append(rootKey, data);
                    return;
                }

                if (Array.isArray(data)) {
                    data.forEach((item, index) => {
                        appendToFormData(item, `${rootKey}[${index}]`);
                    });
                    return;
                }

                if (typeof data === 'object' && !(data instanceof Date)) {
                    Object.keys(data).forEach(key => {
                        const value = data[key];
                        const newKey = rootKey ? `${rootKey}[${key}]` : key;
                        appendToFormData(value, newKey);
                    });
                    return;
                }

                formData.append(rootKey, String(data));
            };

            // Append all fields from apiData
            console.log('API Payload (Pre-FormData):', JSON.stringify(apiData, null, 2));

            Object.keys(apiData).forEach(key => {
                appendToFormData((apiData as any)[key], key);
            });

            console.log('Final FormData Contents:');
            (formData as any).forEach((value: any, key: string) => {
                console.log(`${key}:`, value);
            });

            console.log('Submitting FormData payload...');
            // Cast formData to any because the thunk expects Partial<WorkerProfile> but we modified it to accept FormData too
            // TypeScript might not have picked up the thunk type change in this file's context yet
            await dispatch(updateWorkerProfile(formData as any)).unwrap();
        } catch (error: any) {
            console.error('Failed to submit profile:', error);
            toast.error(error?.message || 'Failed to update profile');
        }
    };

    const renderSection = () => {
        switch (currentSection) {
            // Personal Details sections
            case 'personal-info':
            case 'bio':
            case 'contact':
                return <PersonalDetails onSave={handlePersonalDetailsSave} currentView={currentSection} initialData={allProfileData.personalDetails} isProvider={isProvider} />;

            case 'photo':
                return <ProfileImageEditor onSave={handleProfileImageSave} initialData={allProfileData.profileImage} />;

            // Job Details sections
            case 'preferred-hours':
            case 'indicative-rates':
            case 'services':
                return <JobDetails onSave={handleJobDetailsSave} currentView={currentSection} initialData={allProfileData.jobDetails} />;

            // Professional Details sections
            case 'experience':
            case 'work-history':
            case 'education-training':
            case 'credentials':
                return <ProfessionalDetails onSave={handleProfessionalDetailsSave} currentView={currentSection} initialData={allProfileData.professionalDetails} isProvider={isProvider} />;

            // Additional Details sections
            case 'languages':
            case 'interests-hobbies':
            case 'cultural-background':
            case 'preferences':
            case 'bank-account':
            case 'immunisation':
                return <AdditionalDetails onSave={handleAdditionalDetailsSave} currentView={currentSection} initialData={allProfileData.additionalDetails} isProvider={isProvider} />;

            default:
                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="md:text-xl text-lg lg:text-2xl font-bold mb-2">Section Coming Soon</h2>
                            <p className="text-muted-foreground lg:text-base md:text-[15px] text-sm">This section is being developed</p>
                        </div>
                    </div>
                );
        }
    };

    const totalSections = Object.values(sections).flat().length;
    const completedSections = Object.values(sections).flat().filter(s => s.completed).length;
    const completionPercentage = Math.round((completedSections / totalSections) * 100);

    return (
        <div className="min-h-screen ">
            <div className="container mx-auto">
                {/* Header */}
                <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-base md:text-lg lg:text-xl font-bold mb-2">My Profile</h1>
                        <p className="text-xs md:text-sm lg:text-base text-muted-foreground">
                            Complete your profile to attract more clients
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <Link href="/worker/view-profile" className="w-full sm:w-auto">
                            <Button variant="outline" className="w-full sm:w-auto">
                                <Eye className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline lg:text-base md:text-[15px] text-sm">Preview Profile</span>
                                <span className="sm:hidden lg:text-base md:text-[15px] text-sm">Preview</span>
                            </Button>
                        </Link>
                        <Button
                            onClick={handleSubmitAll}
                            className="w-full sm:w-auto"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="hidden sm:inline lg:text-base md:text-[15px] text-sm">Submitting...</span>
                                    <span className="sm:hidden lg:text-base md:text-[15px] text-sm">...</span>
                                </>
                            ) : (
                                <>
                                    <span className="hidden sm:inline lg:text-base md:text-[15px] text-sm">Submit All Data</span>
                                    <span className="sm:hidden lg:text-base md:text-[15px] text-sm">Submit</span>
                                </>
                            )}
                        </Button>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Left Sidebar - Navigation (Desktop only) */}
                    <div className="hidden lg:block lg:col-span-1 ">
                        <div className="sticky shadow-none border-none  top-6 ">
                            <div className=" space-y-2">
                                {/* Personal Details */}
                                <div>
                                    <Card className=''>
                                        <h3 className="font-semibold text-sm px-3 mb-2 text-muted-foreground uppercase tracking-wider">Personal Details</h3>
                                        <div className="space-y-0.5">
                                            {sections.personalDetails.map((section) => (
                                                <button
                                                    key={section.id}
                                                    onClick={() => setCurrentSection(section.id)}
                                                    className={`
                                                    w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors
                                                    ${currentSection === section.id
                                                            ? ' text-[#8ac6dd]  font-medium '
                                                            : ''
                                                        }
                                                `}
                                                >
                                                    {section.completed ? (
                                                        <CheckCircle className={`h-4 w-4 ${currentSection === section.id ? 'text-[#8ac6dd]' : 'text-[#8ac6dd]'}`} />
                                                    ) : (
                                                        <Circle className={`h-4 w-4 ${currentSection === section.id ? 'text-[#8ac6dd]' : 'text-gray-400'}`} />
                                                    )}
                                                    <span className="flex-1 text-left">{section.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </Card>
                                </div>

                                {/* Job Details */}
                                <Card>
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
                                                            ? ' text-[#8ac6dd] bg-[#8ac6dd]/5 '
                                                            : ''
                                                        }
                                                `}
                                                >
                                                    {section.completed ? (
                                                        <CheckCircle className={`h-4 w-4 ${currentSection === section.id ? 'text-[#8ac6dd]' : 'text-[#8ac6dd]'}`} />
                                                    ) : (
                                                        <Circle className={`h-4 w-4 ${currentSection === section.id ? 'text-[#8ac6dd]' : 'text-gray-400'}`} />
                                                    )}
                                                    <span className="flex-1 text-left">{section.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </Card>

                                {/* Professional Details */}
                                <Card>
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
                                                            ? ' text-[#8ac6dd] font-medium '
                                                            : ''
                                                        }
                                                `}
                                                >
                                                    {section.completed ? (
                                                        <CheckCircle className={`h-4 w-4 ${currentSection === section.id ? 'text-[#8ac6dd]' : 'text-[#8ac6dd]'}`} />
                                                    ) : (
                                                        <Circle className={`h-4 w-4 ${currentSection === section.id ? 'text-[#8ac6dd]' : 'text-gray-400'}`} />
                                                    )}
                                                    <span className="flex-1 text-left">{section.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </Card>

                                {/* Additional Details */}
                                <Card>
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
                                                            ? ' text-[#8ac6dd font-medium'
                                                            : ''
                                                        }
                                                `}
                                                >
                                                    {section.completed ? (
                                                        <CheckCircle className={`h-4 w-4 ${currentSection === section.id ? 'text-[#8ac6dd]' : ' text-[#8ac6dd]'}`} />
                                                    ) : (
                                                        <Circle className={`h-4 w-4 ${currentSection === section.id ? 'text-[#8ac6dd]' : 'text-gray-400'}`} />
                                                    )}
                                                    <span className="flex-1 text-left">{section.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </div>



                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <Card>
                            {/* Horizontal Scrollable Navigation (Mobile/Tablet only) */}
                            <div className="lg:hidden border-b sticky top-0 bg-white z-20">
                                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800" style={{ maxHeight: '4rem' }}>
                                    <div className="flex gap-1 p-2 min-w-max items-center">
                                        {Object.values(sections).flat().map((section) => (
                                            <button
                                                key={section.id}
                                                onClick={() => setCurrentSection(section.id)}
                                                className={`
                                                    flex items-center gap-2 px-4 py-2 rounded-md md:text-[13px] text-xs lg:text-sm whitespace-nowrap transition-colors
                                                    ${currentSection === section.id
                                                        ? ' bg-[#8ac6dd] text-white shadow-sm border border-[#8ac6dd]'
                                                        : 'bg-white border border-[#8ac6dd]  hover:bg-gray-100 '
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
                            <CardContent className="pt-2 md:pt-4 lg:pt-6 px-3 sm:px-6">
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
