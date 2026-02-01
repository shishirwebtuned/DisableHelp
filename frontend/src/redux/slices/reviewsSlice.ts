import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/axios';
import { Review, RatingBreakdown } from '@/types';

interface ReviewsState {
    reviewsReceived: Review[];
    reviewsGiven: Review[];
    ratingBreakdown: RatingBreakdown[];
    overallRating: number;
    totalReviews: number;
    loading: boolean;
    error: string | null;
}

const initialState: ReviewsState = {
    reviewsReceived: [
        {
            id: '1',
            reviewerId: 'c1',
            reviewerName: 'John Client',
            reviewerAvatar: 'https://ui.shadcn.com/avatars/01.png',
            reviewedId: 'w1',
            reviewedName: 'Sarah Worker',
            rating: 5,
            date: '2026-01-15',
            comment: 'Sarah is an exceptional support worker. Professional, caring, and always goes above and beyond. Highly recommend!',
            tags: ['Punctual', 'Professional', 'Caring'],
            type: 'received',
        },
        {
            id: '2',
            reviewerId: 'c2',
            reviewerName: 'Emily Anderson',
            reviewerAvatar: 'https://ui.shadcn.com/avatars/02.png',
            reviewedId: 'w1',
            reviewedName: 'Sarah Worker',
            rating: 5,
            date: '2026-01-10',
            comment: 'Outstanding service! Great communication and very reliable. Made my daily activities so much easier.',
            tags: ['Reliable', 'Great Communication', 'Patient'],
            type: 'received',
        },
        {
            id: '3',
            reviewerId: 'c3',
            reviewerName: 'Michael Brown',
            reviewerAvatar: 'https://ui.shadcn.com/avatars/03.png',
            reviewedId: 'w1',
            reviewedName: 'Sarah Worker',
            rating: 4,
            date: '2026-01-05',
            comment: 'Very good worker. Always on time and helpful. Would work with again.',
            tags: ['Helpful', 'On Time'],
            type: 'received',
        },
        {
            id: '4',
            reviewerId: 'c4',
            reviewerName: 'Sarah Mitchell',
            reviewerAvatar: 'https://ui.shadcn.com/avatars/04.png',
            reviewedId: 'w1',
            reviewedName: 'Sarah Worker',
            rating: 5,
            date: '2025-12-28',
            comment: 'Absolutely wonderful! My mother feels so comfortable with Sarah. She\'s kind, patient, and skilled.',
            tags: ['Kind', 'Patient', 'Skilled'],
            type: 'received',
        },
    ],
    reviewsGiven: [
        {
            id: '5',
            reviewerId: 'w1',
            reviewerName: 'Sarah Worker',
            reviewerAvatar: 'https://ui.shadcn.com/avatars/05.png',
            reviewedId: 'c1',
            reviewedName: 'John Client',
            rating: 5,
            date: '2026-01-15',
            comment: 'Great client to work with. Clear communication and respectful. Home environment is well-organized.',
            tags: ['Respectful', 'Clear Communication', 'Organized'],
            type: 'given',
        },
        {
            id: '6',
            reviewerId: 'w1',
            reviewerName: 'Sarah Worker',
            reviewerAvatar: 'https://ui.shadcn.com/avatars/05.png',
            reviewedId: 'c2',
            reviewedName: 'Emily Anderson',
            rating: 5,
            date: '2026-01-10',
            comment: 'Very accommodating and understanding. Makes the work environment comfortable and pleasant.',
            tags: ['Accommodating', 'Understanding', 'Pleasant'],
            type: 'given',
        },
    ],
    ratingBreakdown: [
        { stars: 5, count: 28, percentage: 67 },
        { stars: 4, count: 10, percentage: 24 },
        { stars: 3, count: 3, percentage: 7 },
        { stars: 2, count: 1, percentage: 2 },
        { stars: 1, count: 0, percentage: 0 },
    ],
    overallRating: 4.8,
    totalReviews: 42,
    loading: false,
    error: null,
};

// Async thunks for API calls
export const fetchReviewsReceived = createAsyncThunk(
    'reviews/fetchReviewsReceived',
    async (workerId: string) => {
        const response = await api.get(`/reviews/received/${workerId}`);
        return response.data;
    }
);

export const fetchReviewsGiven = createAsyncThunk(
    'reviews/fetchReviewsGiven',
    async (workerId: string) => {
        const response = await api.get(`/reviews/given/${workerId}`);
        return response.data;
    }
);

export const createReview = createAsyncThunk(
    'reviews/createReview',
    async (reviewData: Omit<Review, 'id' | 'date'>) => {
        const response = await api.post('/reviews', reviewData);
        return response.data;
    }
);

export const updateReview = createAsyncThunk(
    'reviews/updateReview',
    async ({ id, ...reviewData }: Partial<Review> & { id: string }) => {
        const response = await api.put(`/reviews/${id}`, reviewData);
        return response.data;
    }
);

export const deleteReview = createAsyncThunk(
    'reviews/deleteReview',
    async (reviewId: string) => {
        await api.delete(`/reviews/${reviewId}`);
        return reviewId;
    }
);

export const fetchRatingStats = createAsyncThunk(
    'reviews/fetchRatingStats',
    async (workerId: string) => {
        const response = await api.get(`/reviews/stats/${workerId}`);
        return response.data;
    }
);

const reviewsSlice = createSlice({
    name: 'reviews',
    initialState,
    reducers: {
        addReviewReceived: (state, action: PayloadAction<Review>) => {
            state.reviewsReceived.unshift(action.payload);
            state.totalReviews += 1;
        },
        addReviewGiven: (state, action: PayloadAction<Review>) => {
            state.reviewsGiven.unshift(action.payload);
        },
        updateReviewReceived: (state, action: PayloadAction<Review>) => {
            const index = state.reviewsReceived.findIndex(r => r.id === action.payload.id);
            if (index !== -1) {
                state.reviewsReceived[index] = action.payload;
            }
        },
        updateReviewGiven: (state, action: PayloadAction<Review>) => {
            const index = state.reviewsGiven.findIndex(r => r.id === action.payload.id);
            if (index !== -1) {
                state.reviewsGiven[index] = action.payload;
            }
        },
        removeReviewReceived: (state, action: PayloadAction<string>) => {
            state.reviewsReceived = state.reviewsReceived.filter(r => r.id !== action.payload);
            state.totalReviews -= 1;
        },
        removeReviewGiven: (state, action: PayloadAction<string>) => {
            state.reviewsGiven = state.reviewsGiven.filter(r => r.id !== action.payload);
        },
        setOverallRating: (state, action: PayloadAction<number>) => {
            state.overallRating = action.payload;
        },
        setRatingBreakdown: (state, action: PayloadAction<RatingBreakdown[]>) => {
            state.ratingBreakdown = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Fetch reviews received
        builder
            .addCase(fetchReviewsReceived.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchReviewsReceived.fulfilled, (state, action) => {
                state.loading = false;
                state.reviewsReceived = action.payload;
            })
            .addCase(fetchReviewsReceived.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch reviews';
            });

        // Fetch reviews given
        builder
            .addCase(fetchReviewsGiven.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchReviewsGiven.fulfilled, (state, action) => {
                state.loading = false;
                state.reviewsGiven = action.payload;
            })
            .addCase(fetchReviewsGiven.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch reviews';
            });

        // Create review
        builder
            .addCase(createReview.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createReview.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload.type === 'received') {
                    state.reviewsReceived.unshift(action.payload);
                } else {
                    state.reviewsGiven.unshift(action.payload);
                }
            })
            .addCase(createReview.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to create review';
            });

        // Update review
        builder
            .addCase(updateReview.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateReview.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload.type === 'received') {
                    const index = state.reviewsReceived.findIndex(r => r.id === action.payload.id);
                    if (index !== -1) {
                        state.reviewsReceived[index] = action.payload;
                    }
                } else {
                    const index = state.reviewsGiven.findIndex(r => r.id === action.payload.id);
                    if (index !== -1) {
                        state.reviewsGiven[index] = action.payload;
                    }
                }
            })
            .addCase(updateReview.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to update review';
            });

        // Delete review
        builder
            .addCase(deleteReview.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteReview.fulfilled, (state, action) => {
                state.loading = false;
                state.reviewsReceived = state.reviewsReceived.filter(r => r.id !== action.payload);
                state.reviewsGiven = state.reviewsGiven.filter(r => r.id !== action.payload);
            })
            .addCase(deleteReview.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to delete review';
            });

        // Fetch rating stats
        builder
            .addCase(fetchRatingStats.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRatingStats.fulfilled, (state, action) => {
                state.loading = false;
                state.overallRating = action.payload.overallRating;
                state.totalReviews = action.payload.totalReviews;
                state.ratingBreakdown = action.payload.ratingBreakdown;
            })
            .addCase(fetchRatingStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch rating stats';
            });
    },
});

export const {
    addReviewReceived,
    addReviewGiven,
    updateReviewReceived,
    updateReviewGiven,
    removeReviewReceived,
    removeReviewGiven,
    setOverallRating,
    setRatingBreakdown,
    clearError,
} = reviewsSlice.actions;

export default reviewsSlice.reducer;
