'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Star,
    ThumbsUp,
    MessageSquare,
    Calendar,
    User,
    Clock,
    Award,
    TrendingUp,
    Eye,
} from 'lucide-react';
import { useAppSelector } from '@/hooks/redux';

export default function ClientReviewsPage() {
    const [activeTab, setActiveTab] = useState('my-workers');
    const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);
    const [selectedRating, setSelectedRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [selectedWorker, setSelectedWorker] = useState<any>(null);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    // Get reviews from Redux store
    const { reviewsGiven, reviewsReceived } = useAppSelector((state) => state.reviews);

    // Available tags for worker reviews
    const availableTags = [
        'Punctual',
        'Professional',
        'Caring',
        'Reliable',
        'Great Communication',
        'Patient',
        'Helpful',
        'Kind',
        'Skilled',
        'Respectful',
        'Organized',
        'Friendly',
        'Experienced',
        'Trustworthy',
    ];

    const toggleTag = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    };

    // Mock data for workers the client has worked with
    const myWorkers = [
        {
            id: 1,
            name: 'Sarah Johnson',
            avatar: 'https://ui.shadcn.com/avatars/01.png',
            rating: 4.9,
            totalReviews: 156,
            totalHours: 240,
            lastSession: '2026-01-25',
            myReview: {
                rating: 5,
                date: '2026-01-20',
                comment: 'Sarah is exceptional! Professional, caring, and always goes above and beyond. Highly recommend.',
                tags: ['Professional', 'Caring', 'Punctual', 'Skilled'],
            },
        },
        {
            id: 2,
            name: 'Michael Chen',
            avatar: 'https://ui.shadcn.com/avatars/02.png',
            rating: 4.7,
            totalReviews: 89,
            totalHours: 180,
            lastSession: '2026-01-22',
            myReview: null, // Not reviewed yet
        },
        {
            id: 3,
            name: 'Emma Wilson',
            avatar: 'https://ui.shadcn.com/avatars/03.png',
            rating: 4.8,
            totalReviews: 112,
            totalHours: 120,
            lastSession: '2026-01-20',
            myReview: {
                rating: 4,
                date: '2026-01-18',
                comment: 'Very good support worker. Always on time and helpful.',
                tags: ['Helpful', 'Punctual', 'Reliable'],
            },
        },
    ];

    // Mock data for all available workers
    const allWorkers = [
        {
            id: 4,
            name: 'David Brown',
            avatar: 'https://ui.shadcn.com/avatars/04.png',
            rating: 4.9,
            totalReviews: 203,
            hourlyRate: 45,
            experience: '8 years',
            location: 'Sydney, NSW',
            services: ['Personal Care', 'Community Access', 'Transport'],
        },
        {
            id: 5,
            name: 'Lisa Anderson',
            avatar: 'https://ui.shadcn.com/avatars/05.png',
            rating: 4.6,
            totalReviews: 78,
            hourlyRate: 42,
            experience: '5 years',
            location: 'Sydney, NSW',
            services: ['Household Tasks', 'Social Support', 'Meal Prep'],
        },
    ];

    const handleWriteReview = (worker: any) => {
        setSelectedWorker(worker);
        setIsWriteReviewOpen(true);
    };

    const handleSubmitReview = () => {
        // Submit review logic here
        console.log('Submitting review for:', selectedWorker, 'Rating:', selectedRating, 'Tags:', selectedTags);
        // TODO: Dispatch Redux action to create review
        setIsWriteReviewOpen(false);
        setSelectedRating(0);
        setSelectedWorker(null);
        setSelectedTags([]);
    };

    return (
        <div className=" space-y-2">
            {/* Header */}
            <div>
                <h1 className="text-xl font-bold mb-2">Reviews & Ratings</h1>
                <p className="text-muted-foreground">
                    Review your support workers and browse available workers
                </p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Reviews Written</p>
                                <p className="text-2xl font-bold">2</p>
                            </div>
                            <MessageSquare className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Active Workers</p>
                                <p className="text-2xl font-bold">3</p>
                            </div>
                            <User className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Hours</p>
                                <p className="text-2xl font-bold">540</p>
                            </div>
                            <Clock className="h-8 w-8 text-purple-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Pending Reviews</p>
                                <p className="text-2xl font-bold">1</p>
                            </div>
                            <Award className="h-8 w-8 text-orange-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full md:w-auto grid-cols-2 mb-6">
                    <TabsTrigger value="my-workers">My Support Workers</TabsTrigger>
                    <TabsTrigger value="browse-workers">Browse All Workers</TabsTrigger>
                </TabsList>

                {/* My Workers Tab */}
                <TabsContent value="my-workers" className="space-y-4">
                    {myWorkers.map((worker) => (
                        <Card key={worker.id}>
                            <CardContent className="pt-6">
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="flex items-start gap-4 flex-1">
                                        <Avatar className="h-16 w-16">
                                            <AvatarImage src={worker.avatar} />
                                            <AvatarFallback>{worker.name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="text-xl font-semibold">{worker.name}</h3>
                                                        <Badge className="bg-green-500">Verified</Badge>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <div className="flex items-center gap-1">
                                                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                            <span className="font-semibold">{worker.rating}</span>
                                                            <span className="text-sm text-muted-foreground">
                                                                ({worker.totalReviews} reviews)
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Total Hours</p>
                                                    <p className="font-semibold">{worker.totalHours} hours</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Last Session</p>
                                                    <p className="font-semibold">
                                                        {new Date(worker.lastSession).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Status</p>
                                                    <Badge variant="outline" className="bg-green-50 text-green-700">
                                                        Active
                                                    </Badge>
                                                </div>
                                            </div>

                                            {/* Existing Review */}
                                            {worker.myReview ? (
                                                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-medium">Your Review</span>
                                                            <div className="flex gap-0.5">
                                                                {[1, 2, 3, 4, 5].map((star) => (
                                                                    <Star
                                                                        key={star}
                                                                        className={`h-4 w-4 ${
                                                                            star <= worker.myReview.rating
                                                                                ? 'fill-yellow-400 text-yellow-400'
                                                                                : 'text-gray-300'
                                                                        }`}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <span className="text-xs text-muted-foreground">
                                                            {new Date(worker.myReview.date).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm mb-3">{worker.myReview.comment}</p>
                                                    {worker.myReview.tags && worker.myReview.tags.length > 0 && (
                                                        <div className="flex flex-wrap gap-2 mb-3">
                                                            {worker.myReview.tags.map((tag: string) => (
                                                                <Badge key={tag} variant="secondary" className="text-xs">
                                                                    {tag}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="mt-2"
                                                        onClick={() => handleWriteReview(worker)}
                                                    >
                                                        Edit Review
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <Button onClick={() => handleWriteReview(worker)}>
                                                        <Star className="h-4 w-4 mr-2" />
                                                        Write Review
                                                    </Button>
                                                    <Button variant="outline">
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        View Profile
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>

                {/* Browse Workers Tab */}
                <TabsContent value="browse-workers" className="space-y-4">
                    <Card className="mb-4">
                        <CardHeader>
                            <CardTitle className="text-lg">Browse Support Workers</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                View profiles and reviews of available support workers in your area
                            </p>
                        </CardHeader>
                    </Card>

                    {allWorkers.map((worker) => (
                        <Card key={worker.id}>
                            <CardContent className="pt-6">
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="flex items-start gap-4 flex-1">
                                        <Avatar className="h-16 w-16">
                                            <AvatarImage src={worker.avatar} />
                                            <AvatarFallback>{worker.name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="text-xl font-semibold">{worker.name}</h3>
                                                        <Badge className="bg-green-500">Verified</Badge>
                                                        <Badge variant="secondary">Available</Badge>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <div className="flex items-center gap-1">
                                                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                            <span className="font-semibold">{worker.rating}</span>
                                                            <span className="text-sm text-muted-foreground">
                                                                ({worker.totalReviews} reviews)
                                                            </span>
                                                        </div>
                                                        <Badge variant="secondary">{worker.experience}</Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mt-1">{worker.location}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-bold text-green-600">${worker.hourlyRate}</p>
                                                    <p className="text-xs text-muted-foreground">per hour</p>
                                                </div>
                                            </div>

                                            <div className="mb-4">
                                                <p className="text-sm text-muted-foreground mb-2">Services:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {worker.services.map((service, idx) => (
                                                        <Badge key={idx} variant="outline" className="bg-blue-50 dark:bg-blue-950/20">
                                                            {service}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <Button>
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    View Full Profile
                                                </Button>
                                                <Button variant="outline">
                                                    <MessageSquare className="h-4 w-4 mr-2" />
                                                    Send Message
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>
            </Tabs>

            {/* Write Review Dialog */}
            <Dialog open={isWriteReviewOpen} onOpenChange={setIsWriteReviewOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Write a Review</DialogTitle>
                        <DialogDescription>
                            Share your experience with {selectedWorker?.name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label className="mb-2">Rating</Label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onMouseEnter={() => setHoveredRating(star)}
                                        onMouseLeave={() => setHoveredRating(0)}
                                        onClick={() => setSelectedRating(star)}
                                    >
                                        <Star
                                            className={`h-8 w-8 transition-colors cursor-pointer ${
                                                star <= (hoveredRating || selectedRating)
                                                    ? 'fill-yellow-400 text-yellow-400'
                                                    : 'text-gray-300 hover:text-yellow-200'
                                            }`}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <Label className="mb-2">Your Review</Label>
                            <Textarea
                                placeholder="Share details about your experience..."
                                rows={5}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Tags (Optional)</Label>
                            <p className="text-xs text-muted-foreground mb-2">
                                Select tags that describe your experience
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {availableTags.map((tag) => (
                                    <Badge
                                        key={tag}
                                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                                        className="cursor-pointer hover:bg-primary/10 transition-colors"
                                        onClick={() => toggleTag(tag)}
                                    >
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsWriteReviewOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmitReview} disabled={selectedRating === 0}>
                            Submit Review
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
