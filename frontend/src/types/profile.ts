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

// ==================== PROFESSIONAL DETAILS ====================
export interface ProfessionalDetailsData {
  experience: {
    years: string;
    totalHours: string;
    specializations: string;
  };
  workHistory: Array<{
    id: number;
    position: string;
    org: string;
    duration: string;
    desc: string;
  }>;
  education: Array<{
    id: number;
    title: string;
    institution: string;
    year: string;
  }>;
  credentials: Array<{
    id: number;
    name: string;
    number: string;
    expiry: string;
  }>;
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
}

// ==================== ADDITIONAL DETAILS ====================
export interface AdditionalDetailsData {
  languages: string[];
  selectedInterests: string[];
  culturalInfo: {
    background: string;
    religion: string;
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
      dateOfBirth: "1995-03-15",
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
        position: "Support Worker",
        org: "Independent Contractor",
        duration: "2018 - Present",
        desc: "Providing personalized support services to NDIS participants"
      }
    ],
    education: [
      {
        id: 1,
        title: "Certificate IV in Disability",
        institution: "TAFE NSW",
        year: "2018"
      }
    ],
    credentials: [
      {
        id: 1,
        name: "NDIS Worker Screening",
        number: "NSW12345",
        expiry: "2027-06-15"
      }
    ]
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
    ]
  },
  additionalDetails: {
    languages: ["English (Native)", "Spanish (Conversational)"],
    selectedInterests: ["cooking", "movies", "pets"],
    culturalInfo: {
      background: "Australian",
      religion: "No preference",
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
    }
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
