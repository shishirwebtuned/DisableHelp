import { Document, Types } from "mongoose";

export type UserRole = "admin" | "client" | "worker";
export type Gender = "male" | "female" | "other";
export type VerificationStatus =
  | "pending"
  | "verified"
  | "rejected"
  | "expired";
export type UserStatus = "pending" | "verified";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phoneNumber?: string;
  addressLine1?: string;
  addressLine2?: {
    suburb?: string;
    state?: string;
    postalCode?: string;
  };

  // Worker/Client profile
  workLocation?: string[];
  experience?: number;
  passingRate?: number; // added
  dateOfBirth?: Date;
  gender?: Gender;
  licenseNumber?: string;

  // Credentials & verification
  credentials?: {
    ndisScreening?: boolean;
    wwcc?: boolean;
    driversLicense?: boolean;
    firstAid?: boolean;
    immunisation?: boolean;
  };

  verificationStatus?: {
    ndisScreening?: VerificationStatus;
    wwcc?: VerificationStatus;
    driversLicense?: VerificationStatus;
    firstAid?: VerificationStatus;
    immunisation?: VerificationStatus;
  };

  // Preferences
  preferences?: {
    preferredHours?: string;
    hourlyRate?: number; // moved inside preferences
    languages?: string[];
    culturalBackground?: string;
    religion?: string;
    interests?: string[];
    preferredWorkerType?: string;
    location?: string;
  };

  image?: {
    url?: string;
    public_id?: string;
  };

  status: UserStatus;
  otp: string | null;
  otpExpiry: Date | null;

  bookings: Types.ObjectId[];
  jobsPosted?: Types.ObjectId[];
  agreements?: Types.ObjectId[];
  invoices?: Types.ObjectId[];

  createdAt?: Date;
  updatedAt?: Date;
}

export interface IBooking extends Document {
  vehicle: Types.ObjectId;

  // Customer info
  name: string;
  email: string;
  phone: string;
  message?: string;

  // Pickup & dropoff details
  pickupLocation: string;
  pickupDate: Date;
  pickupTime: string;

  dropoffLocation: string;
  dropoffDate: Date;
  dropoffTime: string;

  // Booking status
  status: "pending" | "confirmed" | "cancelled" | "completed";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";

  createdAt: Date;
  updatedAt: Date;
}
