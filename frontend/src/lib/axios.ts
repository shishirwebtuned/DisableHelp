import axios from 'axios';
import { toast } from 'sonner';

// Create an Axios instance
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api', // Mock URL
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        // In a real app, you would get the token from localStorage or Redux state
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => {
        // Show success toast for successful mutations (POST, PUT, DELETE)
        if (['post', 'put', 'patch', 'delete'].includes(response.config.method?.toLowerCase() || '')) {
            const successMessage = response.data?.message || 'Operation completed successfully';
            toast.success(successMessage);
        }
        return response;
    },
    (error) => {
        // Global error handling with toast notifications
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            const status = error.response.status;
            const errorMessage = error.response.data?.message || error.response.data?.error || 'An error occurred';
            
            console.error('API Error:', error.response.data);
            
            switch (status) {
                case 400:
                    toast.error(errorMessage || 'Bad request');
                    break;
                case 401:
                    toast.error('Unauthorized. Please log in again.');
                    // Handle unauthorized access (e.g., redirect to login)
                    if (typeof window !== 'undefined') {
                        setTimeout(() => {
                            window.location.href = '/login';
                        }, 1500);
                    }
                    break;
                case 403:
                    toast.error('Access forbidden. You don\'t have permission.');
                    break;
                case 404:
                    toast.error('Resource not found');
                    break;
                case 422:
                    toast.error(errorMessage || 'Validation error');
                    break;
                case 429:
                    toast.error('Too many requests. Please try again later.');
                    break;
                case 500:
                    toast.error('Server error. Please try again later.');
                    break;
                case 503:
                    toast.error('Service unavailable. Please try again later.');
                    break;
                default:
                    toast.error(errorMessage);
            }
        } else if (error.request) {
            // The request was made but no response was received
            console.error('Network Error:', error.request);
            toast.error('Network error. Please check your connection.');
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error:', error.message);
            toast.error(error.message || 'An unexpected error occurred');
        }
        return Promise.reject(error);
    }
);

export default api;
