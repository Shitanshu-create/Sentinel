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
