import { api } from '../../auth/services/auth.api.js';

export async function updateProfile(payload) {
    const response = await api.put('/api/auth/profile', payload);
    return response.data;
}
