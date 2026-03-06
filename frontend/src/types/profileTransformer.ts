import { WorkerProfileSchema } from './workerProfileSchema';
import {
    PersonalDetailsData,
    ProfessionalDetailsData,
    JobDetailsData,
    AdditionalDetailsData,
    ProfileImageData
} from './profile';

export interface UIProfileData {
    personalDetails?: PersonalDetailsData;
    professionalDetails?: ProfessionalDetailsData;
    jobDetails?: JobDetailsData;
    additionalDetails?: AdditionalDetailsData;
    profileImage?: ProfileImageData;
}

export function transformToAPISchema(uiData: UIProfileData): Partial<WorkerProfileSchema> {
    const apiData: Partial<WorkerProfileSchema> = {};

    // 1. Personal Details & Gender
    if (uiData.personalDetails) {
        if (uiData.personalDetails.personalInfo?.gender) {
            apiData.gender = uiData.personalDetails.personalInfo.gender;
        }

        apiData.personalDetails = {
            bio: uiData.personalDetails.bio || '',
            avatar: {
                url: uiData.profileImage?.base64 || '',
                publicId: 'avatar_' + Date.now()
            },
            additionalTraining: {
                cpr: {
                    expiryDate: uiData.professionalDetails?.additionalTraining?.cpr?.expiryDate || '',
                    file: { url: '', publicId: '' },
                    isVerified: false
                },
                driverLicense: {
                    expiryDate: uiData.professionalDetails?.additionalTraining?.driverLicense?.expiryDate || '',
                    file: { url: '', publicId: '' },
                    isVerified: false
                },
                firstAid: {
                    expiryDate: uiData.professionalDetails?.additionalTraining?.firstAid?.expiryDate || '',
                    file: { url: '', publicId: '' },
                    isVerified: false
                }
            },
            wwcc: {
                wwccNumber: uiData.professionalDetails?.wwcc?.wwccNumber || '',
                expiryDate: uiData.professionalDetails?.wwcc?.expiryDate || '',
                file: { url: '', publicId: '' },
                isVerified: false
            }
        };

        // Map locations from contact info
        if (uiData.personalDetails.contactInfo) {
            apiData.locations = [{
                id: 'loc1',
                name: 'Primary Location',
                postalCode: uiData.personalDetails.contactInfo.postcode || '',
                state: uiData.personalDetails.contactInfo.state || '',
                suburb: uiData.personalDetails.contactInfo.suburb || ''
            }];
        }
    }

    // 2. Job Details (Services, Rates, Availability)
    if (uiData.jobDetails) {
        apiData.services = uiData.jobDetails.selectedServices || [];
        apiData.freeMeetAndGreet = uiData.jobDetails.freeMeetAndGreet;

        if (uiData.jobDetails.rates) {
            apiData.rates = [
                { name: 'Hourly Rate', rate: uiData.jobDetails.rates.standard || 0 },
                { name: 'Weekend Rate', rate: uiData.jobDetails.rates.weekend || 0 },
                { name: 'Evening Rate', rate: uiData.jobDetails.rates.evening || 0 },
                { name: 'Overnight Rate', rate: uiData.jobDetails.rates.overnight || 0 }
            ];
        }

        if (uiData.jobDetails.preferredHours) {
            const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
            const availability: any = {
                available: true,
                desiredHours: 20,
                hasOvernightAvailability: false
            };

            daysOfWeek.forEach(day => {
                const uiDayKey = day.charAt(0).toUpperCase() + day.slice(1);
                const dayData = uiData.jobDetails?.preferredHours?.[uiDayKey];

                if (dayData && dayData.enabled && dayData.slots?.length > 0) {
                    availability[day] = {
                        available: true,
                        times: dayData.slots.map((slot: string) => {
                            const [start, end] = slot.split('-');
                            return {
                                startTime: convertTo24Hour(start),
                                endTime: convertTo24Hour(end)
                            };
                        })
                    };
                } else {
                    availability[day] = { available: false, times: [] };
                }
            });
            apiData.availability = availability;
        }
    }

    // 3. Professional Details (Work History, Education, NDIS)
    if (uiData.professionalDetails) {
        if (uiData.professionalDetails.workHistory) {
            apiData.workHistory = uiData.professionalDetails.workHistory.map(work => ({
                organisation: work.organisation || '',
                jobTitle: work.jobTitle || '',
                startDate: work.startDate || '',
                currentlyWorkingHere: !!work.currentlyWorkingHere,
                endDate: work.currentlyWorkingHere ? undefined : work.endDate
            }));
        }

        if (uiData.professionalDetails.education) {
            apiData.educationAndTraining = uiData.professionalDetails.education.map(edu => ({
                institution: edu.institution || '',
                course: edu.course || '',
                startDate: edu.startDate || '',
                currentlyStudyingHere: !!edu.currentlyStudyingHere,
                endDate: edu.currentlyStudyingHere ? undefined : edu.endDate
            }));
        }

        if (uiData.professionalDetails.ndisWorkerScreening) {
            const ndis = uiData.professionalDetails.ndisWorkerScreening;
            apiData.ndisWorkerScreening = {
                legal_first_name: ndis.legal_first_name || uiData.personalDetails?.personalInfo?.firstName || '',
                legal_middle_name: '',
                legal_last_name: ndis.legal_last_name || uiData.personalDetails?.personalInfo?.lastName || '',
                date_of_birth: ndis.date_of_birth || '',
                screening_number: ndis.screening_number || '',
                expiry_date: ndis.expiry_date || '',
                status: 'active'
            };
        }

        if (uiData.professionalDetails.experience) {
            const exp = uiData.professionalDetails.experience;
            apiData.experienceSummary = {
                disability: {
                    description: exp.specializations || '',
                    experience: [exp.years + ' years'],
                    knowledge: exp.specializations?.split(',').map(s => s.trim()).filter(Boolean) || []
                },
                agedCare: {
                    description: '',
                    experience: [],
                    knowledge: []
                }
            };
        }
    }

    // 4. Additional Details (Languages, Interests, Cultural, etc.)
    if (uiData.additionalDetails) {
        const add = uiData.additionalDetails;

        apiData.languages = {
            firstLanguages: add.languages?.firstLanguages || [],
            secondLanguages: add.languages?.secondLanguages || []
        };

        apiData.interests = add.selectedInterests || [];
        apiData.culturalBackground = add.culturalInfo?.background || [];
        apiData.religion = add.culturalInfo?.religion || [];

        apiData.aboutMe = {
            nonSmoker: add.culturalInfo?.smokingPolicy === 'non-smoker',
            petFriendly: add.culturalInfo?.petFriendly === 'yes',
            personality: add.personality || 'outgoing'
        };

        if (add.preferences) {
            apiData.preferences = [
                add.preferences.preferredClientAge,
                add.preferences.preferredGender
            ].filter(Boolean);
        }

        if (add.bankDetails) {
            apiData.bankDetails = {
                accountName: add.bankDetails.accountName || '',
                bankName: 'Commonwealth Bank',
                bsb: add.bankDetails.bsb || '',
                accountNumber: add.bankDetails.accountNumber || '',
                bankResponsibility: true
            };
        }

        apiData.lgbtqiaPlusFriendly = !!add.lgbtqiaPlusFriendly;

        if (add.immunisation) {
            apiData.immunisation = {
                hasSeasonalFluShot: !!add.immunisation.hasSeasonalFluShot,
                covidVaccineStatus: add.immunisation.covidVaccineStatus || 'notVaccinated',
                statusConfirmed: !!add.immunisation.statusConfirmed
            };
        }
    }

    // 5. System Defaults
    if (!apiData.hasOwnProperty('approved')) apiData.approved = false;
    if (!apiData.hasOwnProperty('hasActiveAgreement')) apiData.hasActiveAgreement = false;

    return apiData;
}

/**
 * Helper function to convert time slot to 24-hour format
 */
function convertTo24Hour(time: string): string {
    // Example: "6am-11am" -> "09:00"
    const match = time.match(/(\d+)(am|pm)/i);
    if (!match) return '09:00';

    let hour = parseInt(match[1]);
    const meridiem = match[2].toLowerCase();

    if (meridiem === 'pm' && hour !== 12) hour += 12;
    if (meridiem === 'am' && hour === 12) hour = 0;

    return `${hour.toString().padStart(2, '0')}:00`;
}
