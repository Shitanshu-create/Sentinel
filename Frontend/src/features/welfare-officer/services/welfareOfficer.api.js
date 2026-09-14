import { api } from '../../auth/services/auth.api.js';

export async function fetchRoster() {
    const response = await api.get('/api/welfare-officer/roster');
    return response.data;
}

export async function fetchPersonnelDetail(id) {
    const response = await api.get(`/api/welfare-officer/personnel/${id}`);
    return response.data;
}

export async function addWelfareNote(id, { note, actionType }) {
    const response = await api.post(`/api/welfare-officer/personnel/${id}/notes`, { note, actionType });
    return response.data;
}

export async function fetchQuestionBank() {
    const response = await api.get('/api/assessments/question-bank');
    return response.data;
}

export async function assignAssessment(personnelId, { questionIds }) {
    const response = await api.post(`/api/assessments/personnel/${personnelId}`, { questionIds });
    return response.data;
}

export async function fetchOfficerAssessments() {
    const response = await api.get('/api/assessments/officer');
    return response.data;
}

