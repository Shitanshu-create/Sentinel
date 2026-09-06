import axios from 'axios';
import { env } from '../../../config/env.js';

const api = axios.create({
    baseURL: env.apiBaseUrl,
    withCredentials: true
});

let csrfTokenPromise = null;

async function getCsrfToken() {
    if (!csrfTokenPromise) {
        csrfTokenPromise = api.get('/api/csrf-token', { skipCsrf: true })
            .then((response) => response.data.csrfToken)
            .finally(() => {
                csrfTokenPromise = null;
            });
    }

    return csrfTokenPromise;
}

api.interceptors.request.use(async (config) => {
    const method = (config.method || 'get').toLowerCase();
    const needsCsrf = ['post', 'put', 'patch', 'delete'].includes(method);

    if (needsCsrf && !config.skipCsrf) {
        config.headers = config.headers || {};
        config.headers['CSRF-Token'] = await getCsrfToken();
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const url = error.config?.url || '';
            const isAuthEndpoint = url.includes('/auth/login')
                || url.includes('/auth/register')
                || url.includes('/auth/get-me');

            if (!isAuthEndpoint && window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

function getAuthErrorMessage(err, fallback) {
    const validationMessages = err.response?.data?.errors
        ?.map((error) => error.message)
        .filter(Boolean);

    if (validationMessages?.length) {
        return validationMessages.join('. ');
    }

    return err.response?.data?.message || err.message || fallback;
}

export async function register(payload) {
    try {
        const body = payload.personalDetails ? payload : {
            username: payload.username,
            email: payload.email,
            password: payload.password
        };
        const response = await api.post("/api/auth/register", body);
        return { success: true, ...response.data };
    } catch (err) {
        return { 
            success: false, 
            message: getAuthErrorMessage(err, "Registration failed")
        };
    }   
}

export async function login({ email, password}) {
    try {
        const response = await api.post("/api/auth/login", {
            email,
            password
        });
        return { success: true, ...response.data };
    } catch (err) {
        return { 
            success: false, 
            message: getAuthErrorMessage(err, "Login failed")
        };
    }   
}


export async function logout() {
    try {
        const response = await api.post("/api/auth/logout", {});
        return response.data;
    } catch (err) {
        throw err;
    }
}


export async function getMe() {
    try {
        const response = await api.get("/api/auth/get-me", {});
        return response.data;
    } catch (err) {
        return null;
    }
}

export { api };
