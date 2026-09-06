import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { login, register, logout } from "../services/auth.api.js";
import { fetchObservations } from "../../ai-chat/services/journal.api.js";
export const useAuth = () => {
    const context = useContext(AuthContext);
    const { user, setUser, loading, setLoading } = context;

    const handleLogin = async ({ email, password }) => {
        try {
            const res = await login({ email, password });
            if (res.success && res.user) {
                sessionStorage.clear();
                setUser(res.user);
                fetchObservations().catch(err => console.error("Prefetch failed", err));
                return { success: true };
            }
            return { success: false, message: res.message };
        } catch (err) {
            console.error("Login hook failed:", err);
            return { success: false, message: "An unexpected error occurred" };
        }
    }

    const handleRegister = async (payload) => {
        try {
            const res = await register(payload);
            if (res.success && res.user) {
                sessionStorage.clear();
                setUser(res.user);
                fetchObservations().catch(err => console.error("Prefetch failed", err));
                return { success: true };
            }
            return { success: false, message: res.message };
        } catch (err) {
            console.error("Register hook failed:", err);
            return { success: false, message: "An unexpected error occurred" };
        }
    }

    const handleLogout = async () => {
        try {
            await logout();
            sessionStorage.clear();
            setUser(null);
            return { success: true };
        } catch (err) {
            console.error("Logout failed:", err);
            setUser(null);
            return { success: false, message: "Logout may not have completed on server" };
        }
    }

    return { user, loading, handleLogin, handleRegister, handleLogout };
}
