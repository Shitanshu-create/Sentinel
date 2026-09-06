import React from 'react';
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

const ProtectedRoute = ({ children }) => {
    const { loading, user } = useAuth();

    if (loading) {
        return (
            <main className="auth-page-container">
                <div className="auth-wrapper" style={{ textAlign: 'center', padding: '2rem' }}>
                    <h1 className="auth-title">Loading...</h1>
                </div>
            </main>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
