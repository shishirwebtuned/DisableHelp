/**
 * Complete Profile Data Type Definitions
 * 
 * This file contains all the TypeScript interfaces for the worker profile
 * These types ensure type safety across all components
 */

// ==================== PERSONAL DETAILS ====================
export interface PersonalDetailsData {
  personalInfo: {
    firstName: string;
    lastName: string;
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

// ==================== PROFESSIONAL DETAILS ====================
// ==================== PROFESSIONAL DETAILS ====================
export interface ProfessionalDetailsData {
  experience: {
    years: string;
    totalHours: string;
    specializations: string;
  };
  workHistory: Array<{
    id: number;
    jobTitle: string;
    organisation: string;
    startDate: string;
    endDate?: string;
    currentlyWorkingHere: boolean;
    desc?: string; // Optional since component doesn't seem to have a field for it yet in the state shown
  }>;
  education: Array<{
    id: number;
    course: string;
    institution: string;
    startDate: string;
    endDate?: string;
    currentlyStudyingHere: boolean;
  }>;
  ndisWorkerScreening: {
    screening_number: string;
    expiry_date: string;
    legal_first_name: string;
    legal_last_name: string;
    date_of_birth: string;
  };
  wwcc: {
    wwccNumber: string;
    expiryDate: string;
  };
  additionalTraining: {
    cpr: { expiryDate: string; };
    firstAid: { expiryDate: string; };
    driverLicense: { expiryDate: string; };
  };
}

// ==================== JOB DETAILS ====================
export interface JobDetailsData {
  preferredHours: {
    [key: string]: {
      enabled: boolean;
      slots: string[];
    };
  };
  rates: {
    standard: number;
    weekend: number;
    evening: number;
    overnight: number;
  };
  selectedServices: string[];
  freeMeetAndGreet: boolean;
}

// ==================== ADDITIONAL DETAILS ====================
export interface AdditionalDetailsData {
  languages: {
    firstLanguages: string[];
    secondLanguages: string[];
  };
  selectedInterests: string[];
  culturalInfo: {
    background: string[]; // Changed to array
    religion: string[]; // Changed to array
    smokingPolicy: string;
    petFriendly: string;
  };
  preferences: {
    preferredClientAge: string;
    preferredGender: string;
    willingToTravel: string;
    maxTravelDistance: string;
  };
  bankDetails: {
    accountName: string;
    bsb: string;
    accountNumber: string;
  };
  immunisation: {
    hasSeasonalFluShot: boolean;
    covidVaccineStatus: string;
    statusConfirmed: boolean;
  };
  lgbtqiaPlusFriendly: boolean;
  personality: string;
}

// ==================== PROFILE IMAGE ====================
export interface ProfileImageData {
  base64: string;
  binary: Blob | null;
}

// ==================== COMPLETE PROFILE ====================
export interface CompleteProfileData {
  personalDetails?: PersonalDetailsData;
  professionalDetails?: ProfessionalDetailsData;
  jobDetails?: JobDetailsData;
  additionalDetails?: AdditionalDetailsData;
  profileImage?: ProfileImageData;
}

// ==================== EXAMPLE DATA ====================
export const exampleCompleteProfile: CompleteProfileData = {
  personalDetails: {
    personalInfo: {
      firstName: "Sarah",
      lastName: "Johnson",
      gender: "female"
    },
    contactInfo: {
      email: "sarah.johnson@example.com",
      phone: "+61 411 222 333",
      street: "123 Main Street",
      suburb: "Sydney",
      state: "NSW",
      postcode: "2000"
    },
    bio: "Experienced disability support worker with 8 years of experience..."
  },
  professionalDetails: {
    experience: {
      years: "8",
      totalHours: "5200",
      specializations: "Personal Care, Community Support, Transport"
    },
    workHistory: [
      {
        id: 1,
        jobTitle: "Support Worker",
        organisation: "Independent Contractor",
        startDate: "2018-01-01",
        currentlyWorkingHere: true,
        desc: "Providing personalized support services to NDIS participants"
      }
    ],
    education: [
      {
        id: 1,
        course: "Certificate IV in Disability",
        institution: "TAFE NSW",
        startDate: "2018-01-01",
        endDate: "2018-12-31",
        currentlyStudyingHere: false
      }
    ],
    ndisWorkerScreening: {
      screening_number: "NSW12345",
      expiry_date: "2027-06-15",
      legal_first_name: "Sarah",
      legal_last_name: "Johnson",
      date_of_birth: "1980-01-01"
    },
    wwcc: {
      wwccNumber: "WWC123456",
      expiryDate: "2025-01-01"
    },
    additionalTraining: {
      cpr: { expiryDate: "2024-01-01" },
      firstAid: { expiryDate: "2024-01-01" },
      driverLicense: { expiryDate: "2026-01-01" }
    }
  },
  jobDetails: {
    preferredHours: {
      Monday: { enabled: true, slots: ["6am-11am", "11am-2pm"] },
      Tuesday: { enabled: true, slots: ["11am-2pm", "2pm-5pm"] }
      // ... other days
    },
    rates: {
      standard: 45,
      weekend: 55,
      evening: 50,
      overnight: 60
    },
    selectedServices: [
      "Personal Care",
      "Community Access",
      "Transport",
      "Household Tasks"
    ],
    freeMeetAndGreet: true
  },
  additionalDetails: {
    languages: {
      firstLanguages: ["English"],
      secondLanguages: ["Spanish"]
    },
    selectedInterests: ["cooking", "movies", "pets"],
    culturalInfo: {
      background: ["Australian"],
      religion: ["No preference"],
      smokingPolicy: "non-smoker",
      petFriendly: "yes"
    },
    preferences: {
      preferredClientAge: "No preference",
      preferredGender: "No preference",
      willingToTravel: "yes",
      maxTravelDistance: "20"
    },
    bankDetails: {
      accountName: "Sarah Johnson",
      bsb: "123-456",
      accountNumber: "12345678"
    },
    immunisation: {
      hasSeasonalFluShot: true,
      covidVaccineStatus: "fullyVaccinated",
      statusConfirmed: true
    },
    lgbtqiaPlusFriendly: true,
    personality: "outgoing"
  },
  profileImage: {
    base64: "data:image/png;base64,iVBORw0KGgo...",
    binary: null // Blob object in runtime
  }
};

// ==================== API PAYLOAD HELPERS ====================
/**
 * Converts profile data to FormData for API submission
 */
export function profileToFormData(profile: CompleteProfileData): FormData {
  const formData = new FormData();

  // Add profile image as binary if available
  if (profile.profileImage?.binary) {
    formData.append('profileImage', profile.profileImage.binary, 'profile.png');
  }

  // Add all other data as JSON strings
  if (profile.personalDetails) {
    formData.append('personalDetails', JSON.stringify(profile.personalDetails));
  }
  if (profile.professionalDetails) {
    formData.append('professionalDetails', JSON.stringify(profile.professionalDetails));
  }
  if (profile.jobDetails) {
    formData.append('jobDetails', JSON.stringify(profile.jobDetails));
  }
  if (profile.additionalDetails) {
    formData.append('additionalDetails', JSON.stringify(profile.additionalDetails));
  }

  return formData;
}

/**
 * Converts profile data to JSON (excludes binary image)
 */
export function profileToJSON(profile: CompleteProfileData): string {
  const jsonSafe = {
    ...profile,
    profileImage: profile.profileImage ? {
      base64: profile.profileImage.base64,
      // Binary excluded for JSON serialization
    } : undefined
  };
  return JSON.stringify(jsonSafe, null, 2);
}
