import { api } from '../../auth/services/auth.api.js';

// * Fetch all journal entries from backend
export async function fetchEntries() {
    const response = await api.get('/api/journal');
    return response.data;
}

// * Create new journal entry with optional AI analysis and base64 media
export async function createEntry({ chat, title, aiActive, uploadedFiles }) {
    const response = await api.post('/api/journal', { chat, title, aiActive, uploadedFiles });
    return response.data;
}

// * Update existing journal entry by database ID
export async function updateEntry(id, { chat, title, aiActive }) {
    const response = await api.put(`/api/journal/${id}`, { chat, title, aiActive });
    return response.data;
}

// * Delete journal entry by database ID
export async function deleteEntry(id) {
    const response = await api.delete(`/api/journal/${id}`);
    return response.data;
}

// * Fetch user stats (streak, totals, averages)
export async function fetchStats() {
    const response = await api.get('/api/journal/stats');
    return response.data;
}

// * Fetch global AI observations, recommendations, and themes
export async function fetchObservations() {
    const response = await api.get('/api/journal/observations');
    return response.data;
}

// * Chat with AI companion using context from past journal entries
export async function chatWithAI({ message, conversationHistory }) {
    const response = await api.post('/api/journal/chat', { message, conversationHistory });
    return response.data;
}
