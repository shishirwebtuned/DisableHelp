'use client';

import { useState } from 'react';
import { Star, ThumbsUp, MessageSquare, Award, TrendingUp, Edit, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppSelector } from '@/hooks/redux';

export default function WorkerReviewsPage() {
    const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
    const [selectedRating, setSelectedRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);

    // Get data from Redux store
    const { 
        reviewsReceived, 
        reviewsGiven, 
        ratingBreakdown, 
        overallRating, 
        totalReviews 
    } = useAppSelector((state) => state.reviews);

    const achievements = [
        { icon: Award, label: 'Top Rated', description: 'Top 10% of workers' },
        { icon: ThumbsUp, label: '100% Positive', description: 'Last 30 days' },
        { icon: TrendingUp, label: 'Rising Star', description: 'Trending upward' },
        { icon: MessageSquare, label: 'Great Feedback', description: '40+ reviews' },
    ];

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Reviews & Ratings</h1>
                    <p className="text-muted-foreground">Client feedback and your client reviews</p>
                </div>
            </div>

            {/* Main Tabs - Reviews Received vs Reviews Given */}
            <Tabs defaultValue="received" className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="received">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Reviews I Received ({totalReviews})
                    </TabsTrigger>
                    <TabsTrigger value="given">
                        <Users className="h-4 w-4 mr-2" />
                        Reviews I Gave ({reviewsGiven.length})
                    </TabsTrigger>
                </TabsList>

                {/* REVIEWS RECEIVED FROM CLIENTS */}
                <TabsContent value="received" className="space-y-6 mt-6">
                    {/* Overall Rating Summary */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card className="md:col-span-1">
                            <CardHeader>
                                <CardTitle>Overall Rating</CardTitle>
                                <CardDescription>Based on {totalReviews} reviews</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4">
                                    <div className="text-5xl font-bold">{overallRating}</div>
                                    <div>
                                        <div className="flex gap-1 mb-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    className={`h-5 w-5 ${
                                                        star <= Math.round(overallRating)
                                                            ? 'fill-yellow-400 text-yellow-400'
                                                            : 'text-gray-300'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-sm text-muted-foreground">Excellent</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle>Rating Distribution</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {ratingBreakdown.map((item) => (
                                    <div key={item.stars} className="flex items-center gap-4">
                                        <div className="flex items-center gap-1 w-16">
                                            <span className="text-sm">{item.stars}</span>
                                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                        </div>
                                        <Progress value={item.percentage} className="flex-1" />
                                        <span className="text-sm text-muted-foreground w-12 text-right">
                                            {item.count}
                                        </span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Achievements */}
                    <div className="grid gap-4 md:grid-cols-4">
                        {achievements.map((achievement, index) => (
                            <Card key={index}>
                                <CardContent className="pt-6">
                                    <div className="flex flex-col items-center text-center">
                                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                                            <achievement.icon className="h-6 w-6 text-primary" />
                                        </div>
                                        <h3 className="font-semibold mb-1">{achievement.label}</h3>
                                        <p className="text-xs text-muted-foreground">{achievement.description}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Reviews from Clients */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Client Reviews</CardTitle>
                            <CardDescription>Feedback from clients you've worked with</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="all">
                                <TabsList>
                                    <TabsTrigger value="all">All Reviews ({totalReviews})</TabsTrigger>
                                    <TabsTrigger value="recent">Recent (4)</TabsTrigger>
                                    <TabsTrigger value="5-star">5 Stars (28)</TabsTrigger>
                                </TabsList>
                                <TabsContent value="all" className="space-y-6 mt-6">
                                    {reviewsReceived.map((review) => (
                                        <div key={review.id} className="border-b pb-6 last:border-0">
                                            <div className="flex items-start gap-4">
                                                <Avatar>
                                                    <AvatarImage src={review.reviewerAvatar} />
                                                    <AvatarFallback>
                                                        {review.reviewerName
                                                            .split(' ')
                                                            .map((n: string) => n[0])
                                                            .join('')}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div>
                                                            <h4 className="font-semibold">{review.reviewerName}</h4>
                                                            <div className="flex gap-1 my-1">
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
                                                    <p className="text-sm mb-3">{review.comment}</p>
                                                    <div className="flex gap-2">
                                                        {review.tags.map((tag) => (
                                                            <Badge key={tag} variant="secondary">
                                                                {tag}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </TabsContent>
                                <TabsContent value="recent">
                                    <p className="text-sm text-muted-foreground py-4">Recent reviews appear here</p>
                                </TabsContent>
                                <TabsContent value="5-star">
                                    <p className="text-sm text-muted-foreground py-4">5-star reviews appear here</p>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* REVIEWS GIVEN TO CLIENTS */}
                <TabsContent value="given" className="space-y-6 mt-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>My Client Reviews</CardTitle>
                                    <CardDescription>Reviews you've given to clients you worked with</CardDescription>
                                </div>
                                <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Write Review
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Write a Client Review</DialogTitle>
                                            <DialogDescription>Share your experience working with this client</DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <Label>Select Client</Label>
                                                <Select>
                                                    <SelectTrigger className='w-full'>
                                                        <SelectValue placeholder="Choose a client" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="john">John Client</SelectItem>
                                                        <SelectItem value="emily">Emily Anderson</SelectItem>
                                                        <SelectItem value="sarah">Sarah Mitchell</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Rating</Label>
                                                <div className="flex gap-2">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star
                                                            key={star}
                                                            className={`h-8 w-8 cursor-pointer transition-colors ${
                                                                star <= (hoveredRating || selectedRating)
                                                                    ? 'fill-yellow-400 text-yellow-400'
                                                                    : 'text-gray-300 hover:text-yellow-200'
                                                            }`}
                                                            onMouseEnter={() => setHoveredRating(star)}
                                                            onMouseLeave={() => setHoveredRating(0)}
                                                            onClick={() => setSelectedRating(star)}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Your Review</Label>
                                                <Textarea
                                                    placeholder="Share your experience working with this client..."
                                                    rows={4}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Tags (Optional)</Label>
                                                <div className="flex flex-wrap gap-2">
                                                    {['Respectful', 'Clear Communication', 'Organized', 'Accommodating', 'Understanding', 'Pleasant'].map((tag) => (
                                                        <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-primary/10">
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
                                                Cancel
                                            </Button>
                                            <Button onClick={() => setIsReviewDialogOpen(false)}>
                                                Submit Review
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {reviewsGiven.length > 0 ? (
                                    reviewsGiven.map((review) => (
                                        <div key={review.id} className="border-b pb-6 last:border-0">
                                            <div className="flex items-start gap-4">
                                                <Avatar>
                                                    <AvatarImage src={review.reviewedName} />
                                                    <AvatarFallback>
                                                        {review.reviewedName
                                                            .split(' ')
                                                            .map((n: string) => n[0])
                                                            .join('')}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div>
                                                            <h4 className="font-semibold">{review.reviewedName}</h4>
                                                            <div className="flex gap-1 my-1">
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
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm text-muted-foreground">
                                                                {new Date(review.date).toLocaleDateString()}
                                                            </span>
                                                            <Button variant="ghost" size="sm">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm mb-3">{review.comment}</p>
                                                    <div className="flex gap-2">
                                                        {review.tags.map((tag) => (
                                                            <Badge key={tag} variant="secondary">
                                                                {tag}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12">
                                        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            You haven't reviewed any clients yet. Share your experience!
                                        </p>
                                        <Button onClick={() => setIsReviewDialogOpen(true)}>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Write Your First Review
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
