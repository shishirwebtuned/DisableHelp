// User & Auth Types
export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'worker' | 'client';
    avatar?: string;
    isVerified: boolean;
    status: 'active' | 'pending' | 'suspended';
}

// Profile Types
export interface WorkerProfile {
    id: string;
    userId: string;
    personalInfo: {
        firstName: string;
        lastName: string;
        phone: string;
        dateOfBirth: string;
        gender?: string;
    };
    location: {
        address: string;
        suburb: string;
        state: string;
        postcode: string;
    };
    availability: {
        monday?: TimeSlot[];
        tuesday?: TimeSlot[];
        wednesday?: TimeSlot[];
        thursday?: TimeSlot[];
        friday?: TimeSlot[];
        saturday?: TimeSlot[];
        sunday?: TimeSlot[];
    };
    hourlyRate: number;
    bankDetails?: {
        accountName: string;
        bsb: string;
        accountNumber: string;
    };
    workHistory: WorkExperience[];
    credentials: Credential[];
    languages: string[];
    preferences: string[];
    photoUrl?: string;
    completeness: number;
}

export interface TimeSlot {
    start: string;
    end: string;
}

export interface WorkExperience {
    id: string;
    title: string;
    organization: string;
    startDate: string;
    endDate?: string;
    description: string;
}

export interface Credential {
    id: string;
    type: 'NDIS' | 'WWCC' | 'CPR' | 'FirstAid' | 'Immunisation' | 'Other';
    number: string;
    issueDate: string;
    expiryDate: string;
    status: 'valid' | 'expired' | 'pending';
    documentUrl?: string;
}

export interface ClientProfile {
    id: string;
    userId: string;
    condition: string;
    preferences: string[];
    location: {
        address: string;
        suburb: string;
        state: string;
        postcode: string;
    };
    preferredWorkerType: string[];
    emergencyContact: {
        name: string;
        relationship: string;
        phone: string;
    };
}

// Job Types
export interface Job {
    id: string;
    title: string;
    clientId: string;
    clientName: string;
    description: string;
    location: string;
    rate: number;
    tags: string[];
    status: 'draft' | 'published' | 'closed';
    requirements: string[];
    startDate: string;
    endDate?: string;
    hoursPerWeek: number;
    createdAt: string;
    updatedAt: string;
}

export interface Application {
    id: string;
    jobId: string;
    workerId: string;
    workerName: string;
    status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
    coverLetter: string;
    appliedAt: string;
    respondedAt?: string;
}

// Agreement Types
export interface Agreement {
    id: string;
    workerId: string;
    workerName: string;
    clientId: string;
    clientName: string;
    status: 'pending' | 'active' | 'terminated';
    startDate: string;
    endDate?: string;
    terminationReason?: string;
    termsAccepted: boolean;
    termsAcceptedAt?: string;
    createdAt: string;
}

// Invoice Types
export interface Invoice {
    id: string;
    agreementId: string;
    workerId: string;
    workerName: string;
    clientId: string;
    clientName: string;
    periodStart: string;
    periodEnd: string;
    hours: number;
    rate: number;
    totalAmount: number;
    frequency: 'weekly' | 'fortnightly' | 'monthly';
    status: 'submitted' | 'approved' | 'rejected' | 'paid';
    notes?: string;
    attachmentUrl?: string;
    adminNotes?: string;
    submittedAt: string;
    processedAt?: string;
}

// Session Types
export interface Session {
    id: string;
    clientId: string;
    workerId?: string;
    workerName?: string;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    status: 'scheduled' | 'completed' | 'cancelled';
    notes?: string;
}

// Message Types
export interface Conversation {
    id: string;
    participants: string[]; // user IDs
    participantNames: string[];
    lastMessage: Message;
    unreadCount: number;
    updatedAt: string;
}

export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    senderName: string;
    content: string;
    timestamp: string;
    read: boolean;
    readByAdmin?: boolean;
}

// Settings Types
export interface NotificationSettings {
    emailNotifications: boolean;
    smsNotifications: boolean;
    jobAlerts: boolean;
    messageAlerts: boolean;
    invoiceAlerts: boolean;
}

export interface EmergencyContact {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
}

// Review Types
export interface Review {
    id: string;
    reviewerId: string;
    reviewerName: string;
    reviewerAvatar?: string;
    reviewedId: string;
    reviewedName: string;
    rating: number;
    comment: string;
    tags: string[];
    date: string;
    type: 'received' | 'given'; // received = reviews you got, given = reviews you gave
}

export interface RatingBreakdown {
    stars: number;
    count: number;
    percentage: number;
}

export interface Achievement {
    icon: string;
    label: string;
    description: string;
}
