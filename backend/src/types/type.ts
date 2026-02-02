import mongoose, { Document, Types } from "mongoose";
import type { dailyAvailabilitySchema } from "../models/workerProfile.model.js";

export type UserRole = "admin" | "client" | "worker";
export type Gender = "male" | "female" | "other";
export type VerificationStatus =
  | "pending"
  | "verified"
  | "rejected"
  | "expired";
export type UserStatus = "pending" | "verified";

export interface IUser extends Document {
  email: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address?: {
    line1?: string;
    line2?: string;
    state?: string;
    postalCode?: string;
  };

  notificationSettings: {
    receiveSms: boolean;
    receiveEmails: boolean;
  };
  phoneVerified: boolean;
  consentToCollectSensitiveInformation: boolean;

  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };

  approved: boolean;
  otp: string | null;
  otpExpiry: Date | null;

  timezone: string;

  createdAt?: Date;
  updatedAt?: Date;
}

type Rate = {
  name: string;
  rate: number;
};
export interface IWorkerProfile {
  user: mongoose.Types.ObjectId;
  gender?: Gender;

  services: string[];
  rates: Rate[];

  freeMeetAndGreet: boolean;

  availability: {
    available: boolean;
    monday: typeof dailyAvailabilitySchema;
    tuesday: typeof dailyAvailabilitySchema;
    wednesday: typeof dailyAvailabilitySchema;
    thursday: typeof dailyAvailabilitySchema;
    friday: typeof dailyAvailabilitySchema;
    saturday: typeof dailyAvailabilitySchema;
    sunday: typeof dailyAvailabilitySchema;
    desiredHours?: number;
    hasOvernightAvailability?: boolean;
    availabilityUpdatedAt?: Date;
  };
  locations: {
    id: string;
    name: string;
    postalCode: string;
    state: string;
    suburb: string;
  }[];

  experienceSummary?: {
    disability?: { years: number; description?: string };
    agedCare?: { years: number; description?: string };
    mentalHealth?: { years: number; description?: string };
    chronicMedicalCondition?: { years: number; description?: string };
  };

  bankDetails?: {
    accountName: string;
    bankName: string;
    bsb: string;
    accountNumber: string;
    bankResponsibility: boolean;
  };

  workHistory?: {
    organisation: string;
    jobTitle: string;
    startDate: Date;
    currentlyWorkingHere: boolean;
    endDate?: Date;
  }[];

  educationAndTraining?: {
    institution: string;
    course: string;
    startDate: Date;
    currentlyStudyingHere: boolean;
    endDate?: Date;
  }[];

  ndisWorkerScreening?: {
    legal_first_name: string;
    legal_middle_name: string;
    legal_last_name: string;
    date_of_birth: Date;
    screening_number: string;
    expiry_date: Date;
    status: string;
  };

  lgbtqiaPlusFriendly: boolean;

  immunisation?: {
    hasSeasonalFluShot: boolean;
    covidVaccineStatus: "fullyVaccinated" | "medicalCondition" | "remoteWorker";
    statusConfirmed?: boolean;
  };

  languages: {
    firstLanguages: string[];
    secondLanguages: string[];
  };

  culturalBackground?: string[];
  religion?: string[];

  interests?: string[];

  aboutMe?: {
    nonSmoker: boolean;
    petFriendly: boolean;
    personality?: "outgoing" | "relaxed";
  };

  preferences?: string[];

  personalDetails?: {
    avatar?: {
      url: string;
      publicId: string;
    };
    bio?: string;
    additionalTraining?: {
      cpr?: {
        expiryDate: Date;
        file?: {
          url: string;
          publicId: string;
        };
        isVerified: boolean;
      };
      driverLicense?: {
        expiryDate: Date;
        file?: {
          url: string;
          publicId: string;
        };
        isVerified: boolean;
      };
      firstAid?: {
        expiryDate: Date;
        file?: {
          url: string;
          publicId: string;
        };
        isVerified: boolean;
      };
    };
    wwcc?: {
      wwccNumber: string;
      expiryDate: Date;
      file?: {
        url: string;
        publicId: string;
      };
      isVerified: boolean;
    };
  };

  approved: boolean;
  hasActiveAgreement: boolean;
}
