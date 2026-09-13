import { api } from '../../auth/services/auth.api.js';

export async function fetchMyAssessments() {
    const response = await api.get('/api/assessments/mine');
    return response.data;
}

export async function submitAssessment(assessmentId, { answers }) {
    const response = await api.post(`/api/assessments/${assessmentId}/submit`, { answers });
    return response.data;
}
