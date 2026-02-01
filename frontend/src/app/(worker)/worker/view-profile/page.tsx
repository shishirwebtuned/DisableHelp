'use client';

import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    Star,
    MapPin,
    Clock,
    Shield,
    CheckCircle,
    Heart,
    Briefcase,
    Award,
    Languages,
    Globe,
    Book,
    Camera,
    Music,
    Utensils,
    Film,
    PawPrint,
    Trophy,
    Plane,
    GraduationCap,
    ArrowLeft,
} from 'lucide-react';

// Public Profile View Page - Can be viewed by clients, admin, or public
export default function PublicProfilePage() {
    const params = useParams();
    const router = useRouter();
    const userId = params.id;

    // Mock data - would come from API based on userId
    const workerProfile = {
        id: userId,
        role: 'worker', // or 'client'
        firstName: 'Sarah',
        lastName: 'Worker',
        profileImage: 'https://ui.shadcn.com/avatars/01.png',
        rating: 4.9,
        reviewsCount: 156,
        verified: true,
        bio: 'Experienced disability support worker with 8 years of experience. Passionate about helping people live their best lives with compassion and professionalism.',
        location: 'Sydney, NSW 2000',
        hourlyRate: 45,
        responseTime: '2 hours',
        availability: 'Weekdays & Weekends',
        
        // Contact (only shown to connected users)
        phone: '+61 411 222 333',
        email: 'sarah.worker@example.com',
        
        // Experience
        experience: '8 years',
        totalHours: 5200,
        activeClients: 12,
        
        // Credentials
        credentials: [
            { name: 'NDIS Worker Screening', verified: true, expiry: '2027-06-15' },
            { name: 'Working with Children Check', verified: true, expiry: '2029-03-20' },
            { name: 'First Aid Certificate', verified: true, expiry: '2027-01-10' },
            { name: 'CPR Certification', verified: true, expiry: '2026-12-15' },
        ],
        
        // Education
        education: [
            { title: 'Certificate IV in Disability', institution: 'TAFE NSW', year: '2018' },
            { title: 'Certificate III in Individual Support', institution: 'TAFE NSW', year: '2016' },
        ],
        
        // Work History
        workHistory: [
            {
                position: 'Support Worker',
                organization: 'Independent Contractor',
                duration: '2018 - Present',
                description: 'Providing personalized support services to NDIS participants',
            },
            {
                position: 'Care Assistant',
                organization: 'Care Connect NSW',
                duration: '2016 - 2018',
                description: 'Assisted elderly and disabled clients with daily living activities',
            },
        ],
        
        // Languages
        languages: ['English (Native)', 'Spanish (Conversational)', 'Auslan (Basic)'],
        
        // Interests & Hobbies
        interests: [
            { name: 'Cooking', icon: Utensils, selected: true },
            { name: 'Movies', icon: Film, selected: true },
            { name: 'Pets', icon: PawPrint, selected: true },
            { name: 'Sports', icon: Trophy, selected: true },
            { name: 'Gardening', icon: Heart, selected: true },
            { name: 'Music', icon: Music, selected: true },
            { name: 'Photography/Art', icon: Camera, selected: true },
            { name: 'Travel', icon: Plane, selected: true },
            { name: 'Reading', icon: Book, selected: true },
        ],
        
        // Services Offered
        services: [
            'Personal Care',
            'Community Access',
            'Transport',
            'Household Tasks',
            'Social Support',
            'Meal Preparation',
        ],
        
        // Cultural Background
        culturalBackground: 'Australian',
        religion: 'No preference',
        
        // Preferences
        preferences: {
            preferredGender: 'No preference',
            smokingPolicy: 'Non-smoker',
            petFriendly: true,
            mobilityAccess: true,
        },
        
        // Reviews
        recentReviews: [
            {
                id: 1,
                clientName: 'John C.',
                rating: 5,
                date: '2026-01-20',
                comment: 'Sarah is exceptional! Professional, caring, and always goes above and beyond.',
            },
            {
                id: 2,
                clientName: 'Emily A.',
                rating: 5,
                date: '2026-01-15',
                comment: 'Highly recommend Sarah. Great communication and very reliable.',
            },
            {
                id: 3,
                clientName: 'Michael B.',
                rating: 4,
                date: '2026-01-10',
                comment: 'Very good support worker. Always on time and helpful.',
            },
        ],
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <div className="container mx-auto px-6 md:px-8 lg:px-12 py-12">
                    {/* Back Button */}
                    <Button
                        variant="ghost"
                        className="text-white hover:bg-white/20 mb-6"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    
                    <div className="flex flex-col md:flex-row items-start gap-6">
                        <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
                            <AvatarImage src={workerProfile.profileImage} />
                            <AvatarFallback className="text-3xl bg-white text-blue-600">
                                {workerProfile.firstName[0]}{workerProfile.lastName[0]}
                            </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h1 className="text-4xl font-bold mb-2">
                                        {workerProfile.firstName} {workerProfile.lastName}
                                    </h1>
                                    <p className="text-blue-100 mb-3">{workerProfile.bio}</p>
                                    <div className="flex flex-wrap items-center gap-3 mb-3">
                                        <div className="flex items-center gap-1">
                                            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                            <span className="font-semibold">{workerProfile.rating}</span>
                                            <span className="text-blue-100">({workerProfile.reviewsCount} reviews)</span>
                                        </div>
                                        {workerProfile.verified && (
                                            <Badge className="bg-green-500 hover:bg-green-600">
                                                <Shield className="h-3 w-3 mr-1" />
                                                Verified
                                            </Badge>
                                        )}
                                        <Badge variant="secondary" className="bg-white/20 hover:bg-white/30">
                                            <Briefcase className="h-3 w-3 mr-1" />
                                            {workerProfile.experience} Experience
                                        </Badge>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-blue-100">
                                        <span className="flex items-center gap-1">
                                            <MapPin className="h-4 w-4" />
                                            {workerProfile.location}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            Responds in {workerProfile.responseTime}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* <div className="flex flex-col gap-2">
                            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                                <MessageSquare className="h-5 w-5 mr-2" />
                                Send Message
                            </Button>
                            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20">
                                <Calendar className="h-5 w-5 mr-2" />
                                Book Session
                            </Button>
                        </div> */}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-6 md:px-8 lg:px-12 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Sidebar - Quick Info */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Rate & Availability */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Rate & Availability</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Hourly Rate</span>
                                    <span className="text-2xl font-bold text-green-600">
                                        ${workerProfile.hourlyRate}
                                    </span>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Availability</span>
                                    <Badge variant="outline">{workerProfile.availability}</Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Statistics</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Total Hours</span>
                                    <span className="font-semibold">{workerProfile.totalHours.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Active Clients</span>
                                    <span className="font-semibold">{workerProfile.activeClients}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Response Time</span>
                                    <span className="font-semibold">{workerProfile.responseTime}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Credentials */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Award className="h-5 w-5" />
                                    Credentials
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {workerProfile.credentials.map((cred, index) => (
                                    <div key={index} className="flex items-start gap-2">
                                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">{cred.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Valid until {new Date(cred.expiry).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Languages */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Languages className="h-5 w-5" />
                                    Languages
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {workerProfile.languages.map((lang, index) => (
                                        <Badge key={index} variant="secondary">{lang}</Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Services Offered */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Services Offered</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {workerProfile.services.map((service, index) => (
                                        <Badge key={index} variant="outline" className="text-sm py-1 px-3">
                                            {service}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Interests & Hobbies */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Interests & Hobbies</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Shared interests help build meaningful connections with clients
                                </p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {workerProfile.interests.map((interest, index) => (
                                        <div
                                            key={index}
                                            className="flex flex-col items-center p-4 rounded-lg border bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800"
                                        >
                                            <interest.icon className="h-8 w-8 mb-2 text-blue-600" />
                                            <span className="text-xs font-medium text-center">{interest.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Education & Training */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <GraduationCap className="h-5 w-5" />
                                    Education & Training
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {workerProfile.education.map((edu, index) => (
                                    <div key={index}>
                                        <h4 className="font-semibold">{edu.title}</h4>
                                        <p className="text-sm text-muted-foreground">{edu.institution}</p>
                                        <p className="text-xs text-muted-foreground">{edu.year}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Work History */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Briefcase className="h-5 w-5" />
                                    Work History
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {workerProfile.workHistory.map((work, index) => (
                                    <div key={index}>
                                        <h4 className="font-semibold">{work.position}</h4>
                                        <p className="text-sm text-muted-foreground">{work.organization}</p>
                                        <p className="text-xs text-muted-foreground mb-2">{work.duration}</p>
                                        <p className="text-sm">{work.description}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Cultural & Personal */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Globe className="h-5 w-5" />
                                    Cultural Background & Preferences
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <Label className="text-muted-foreground">Cultural Background</Label>
                                    <p className="font-medium">{workerProfile.culturalBackground}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Religion</Label>
                                    <p className="font-medium">{workerProfile.religion}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Smoking Policy</Label>
                                    <p className="font-medium">{workerProfile.preferences.smokingPolicy}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Pet Friendly</Label>
                                    <p className="font-medium">{workerProfile.preferences.petFriendly ? 'Yes' : 'No'}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Reviews */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>Client Reviews</span>
                                    <Badge variant="secondary">{workerProfile.reviewsCount} reviews</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {workerProfile.recentReviews.map((review) => (
                                    <div key={review.id} className="border-b pb-4 last:border-0">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <p className="font-semibold">{review.clientName}</p>
                                                <div className="flex gap-0.5 my-1">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star
                                                            key={star}
                                                            className={`h-4 w-4 ${
                                                                star <= review.rating
                                                                    ? 'fill-yellow-400 text-yellow-400'
                                                                    : 'text-gray-300'
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <span className="text-sm text-muted-foreground">
                                                {new Date(review.date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm">{review.comment}</p>
                                    </div>
                                ))}
                                <Button variant="outline" className="w-full">View All Reviews</Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Label({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <label className={`text-sm font-medium ${className}`}>{children}</label>;
}
