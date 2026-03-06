import { WorkerProfileSchema } from './workerProfileSchema';
export const sampleWorkerProfile: WorkerProfileSchema = {
    gender: "male",
    services: ["Disability Support", "Aged Care"],
    rates: [
        { name: "Hourly Rate", rate: 50 },
        { name: "Overnight Rate", rate: 80 }
    ],
    freeMeetAndGreet: true,
    availability: {
        available: true,
        monday: {
            available: true,
            times: [{ startTime: "09:00", endTime: "17:00" }]
        },
        tuesday: {
            available: false,
            times: []
        },
        wednesday: {
            available: true,
            times: [{ startTime: "10:00", endTime: "16:00" }]
        },
        thursday: {
            available: false,
            times: []
        },
        friday: {
            available: true,
            times: [{ startTime: "09:00", endTime: "15:00" }]
        },
        saturday: {
            available: false,
            times: []
        },
        sunday: {
            available: false,
            times: []
        },
        desiredHours: 20,
        hasOvernightAvailability: false
    },
    locations: [
        {
            id: "loc1",
            name: "Sydney Home",
            postalCode: "2000",
            state: "NSW",
            suburb: "Sydney"
        }
    ],
    experienceSummary: {
        disability: {
            description: "Worked with adults with disabilities",
            experience: ["5 years"],
            knowledge: ["CPR"]
        },
        agedCare: {
            description: "Aged care experience",
            experience: ["2 years"],
            knowledge: ["Medication Management"]
        }
    },
    bankDetails: {
        accountName: "John Doe",
        bankName: "Commonwealth Bank",
        bsb: "062-000",
        accountNumber: "12345678",
        bankResponsibility: true
    },
    workHistory: [
        {
            organisation: "Sunrise Care",
            jobTitle: "Support Worker",
            startDate: "2020-01-01",
            currentlyWorkingHere: true
        }
    ],
    educationAndTraining: [
        {
            institution: "TAFE NSW",
            course: "Certificate III in Individual Support",
            startDate: "2018-02-01",
            currentlyStudyingHere: false,
            endDate: "2019-12-01"
        }
    ],
    ndisWorkerScreening: {
        legal_first_name: "John",
        legal_middle_name: "M",
        legal_last_name: "Doe",
        date_of_birth: "1990-05-15",
        screening_number: "NDIS123456",
        expiry_date: "2030-05-15",
        status: "active"
    },
    lgbtqiaPlusFriendly: true,
    immunisation: {
        hasSeasonalFluShot: true,
        covidVaccineStatus: "fullyVaccinated",
        statusConfirmed: true
    },
    languages: {
        firstLanguages: ["English"],
        secondLanguages: ["French"]
    },
    culturalBackground: ["European"],
    religion: ["None"],
    interests: ["Reading", "Music", "Hiking"],
    aboutMe: {
        nonSmoker: true,
        petFriendly: true,
        personality: "outgoing"
    },
    preferences: ["Morning shifts", "Weekend availability"],
    personalDetails: {
        bio: "Passionate support worker with 5+ years of experience.",
        avatar: {
            url: "https://example.com/avatar.jpg",
            publicId: "avatar123"
        },
        additionalTraining: {
            cpr: {
                expiryDate: "2025-12-01",
                file: {
                    url: "https://example.com/cpr.pdf",
                    publicId: "cpr123"
                },
                isVerified: false
            },
            driverLicense: {
                expiryDate: "2027-06-01",
                file: {
                    url: "https://example.com/license.pdf",
                    publicId: "license123"
                },
                isVerified: false
            },
            firstAid: {
                expiryDate: "2026-03-01",
                file: {
                    url: "https://example.com/firstAid.pdf",
                    publicId: "firstAid123"
                },
                isVerified: false
            }
        },
        wwcc: {
            wwccNumber: "WWCC123456",
            expiryDate: "2028-01-01",
            file: {
                url: "https://example.com/wwcc.pdf",
                publicId: "wwcc123"
            },
            isVerified: false
        }
    },
    approved: false,
    hasActiveAgreement: false
};
