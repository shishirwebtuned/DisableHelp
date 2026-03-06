/**
 * Worker Profile API Service
 * Handles direct API calls for worker profile operations
 */

import api from '@/lib/axios';
import { WorkerProfileSchema } from '@/types/workerProfileSchema';

/**
 * Submit worker profile to the API
 * @param profileData - Worker profile data matching the API schema
 * @returns Response from the API
 */
export async function submitWorkerProfileAPI(profileData: WorkerProfileSchema) {
    try {
        const response = await api.put('/profile/worker', profileData);
        return response.data;
    } catch (error) {
        console.error('Error submitting worker profile:', error);
        throw error;
    }
}

/**
 * Get worker profile from the API
 * @returns Worker profile data
 */
export async function getWorkerProfileAPI() {
    try {
        const response = await api.get('/profile/worker');
        return response.data;
    } catch (error) {
        console.error('Error fetching worker profile:', error);
        throw error;
    }
}

/**
 * Update specific fields of worker profile
 * @param profileData - Partial worker profile data to update
 * @returns Response from the API
 */
export async function updateWorkerProfileAPI(profileData: Partial<WorkerProfileSchema>) {
    try {
        const response = await api.patch('/profile/worker', profileData);
        return response.data;
    } catch (error) {
        console.error('Error updating worker profile:', error);
        throw error;
    }
}
