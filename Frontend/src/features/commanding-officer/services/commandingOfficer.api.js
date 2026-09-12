import { api } from '../../auth/services/auth.api.js';

export async function fetchUnitsSummary() {
    const response = await api.get('/api/commanding-officer/units');
    return response.data;
}

export async function fetchUnitDetail(unitName) {
    const response = await api.get(`/api/commanding-officer/units/${encodeURIComponent(unitName)}`);
    return response.data;
}

export async function addOrganizationalNote(unitName, { note, actionType }) {
    const response = await api.post(`/api/commanding-officer/units/${encodeURIComponent(unitName)}/notes`, { note, actionType });
    return response.data;
}
