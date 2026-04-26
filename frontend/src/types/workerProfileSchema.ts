/**
 * Worker Profile Schema Type Definitions
 * Matches the API schema provided for /profile/worker endpoint
 */

export interface WorkerProfileSchema {
  gender: string;
  services: string[];
  rates: Array<{
    name: string;
    rate: number;
  }>;
  freeMeetAndGreet: boolean;
  availability: {
    available: boolean;
    monday: {
      available: boolean;
      times: Array<{ startTime: string; endTime: string }>;
    };
    tuesday: {
      available: boolean;
      times: Array<{ startTime: string; endTime: string }>;
    };
    wednesday: {
      available: boolean;
      times: Array<{ startTime: string; endTime: string }>;
    };
    thursday: {
      available: boolean;
      times: Array<{ startTime: string; endTime: string }>;
    };
    friday: {
      available: boolean;
      times: Array<{ startTime: string; endTime: string }>;
    };
    saturday: {
      available: boolean;
      times: Array<{ startTime: string; endTime: string }>;
    };
    sunday: {
      available: boolean;
      times: Array<{ startTime: string; endTime: string }>;
    };
    desiredHours: number;
    hasOvernightAvailability: boolean;
  };
  locations: Array<{
    id: string;
    name: string;
    postalCode: string;
    state: string;
    suburb: string;
  }>;
  experienceSummary: {
    disability: {
      description: string;
      experience: string[];
      knowledge: string[];
    };
    agedCare: {
      description: string;
      experience: string[];
      knowledge: string[];
    };
  };
  bankDetails: {
    accountName: string;
    bankName: string;
    bsb: string;
    accountNumber: string;
    bankResponsibility: boolean;
  };
  workHistory: Array<{
    organisation: string;
    jobTitle: string;
    startDate: string;
    currentlyWorkingHere: boolean;
    endDate?: string;
  }>;
  educationAndTraining: Array<{
    institution: string;
    course: string;
    startDate: string;
    currentlyStudyingHere: boolean;
    endDate?: string;
  }>;
  ndisWorkerScreening: {
    legal_first_name: string;
    legal_middle_name: string;
    legal_last_name: string;
    date_of_birth: string;
    screening_number: string;
    expiry_date: string;
    status: string;
  };
  lgbtqiaPlusFriendly: boolean;
  immunisation: {
    hasSeasonalFluShot: boolean;
    covidVaccineStatus: string;
    statusConfirmed: boolean;
  };
  languages: {
    firstLanguages: string[];
    secondLanguages: string[];
  };
  abnNumber?: string;
  culturalBackground: string[];
  religion: string[];
  interests: string[];
  aboutMe: {
    nonSmoker: boolean;
    petFriendly: boolean;
    personality: string;
  };
  preferences: string[];
  personalDetails: {
    bio: string;
    avatar: {
      url: string;
      publicId: string;
    };
    additionalTraining: {
      cpr: {
        expiryDate: string;
        file: {
          url: string;
          publicId: string;
        };
        isVerified: boolean;
      };
      driverLicense: {
        expiryDate: string;
        file: {
          url: string;
          publicId: string;
        };
        isVerified: boolean;
      };
      firstAid: {
        expiryDate: string;
        file: {
          url: string;
          publicId: string;
        };
        isVerified: boolean;
      };
    };
    wwcc: {
      wwccNumber: string;
      expiryDate: string;
      file: {
        url: string;
        publicId: string;
      };
      isVerified: boolean;
    };
  };
  approved: boolean;
  hasActiveAgreement: boolean;
}
