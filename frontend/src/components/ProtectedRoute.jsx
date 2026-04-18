import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const ProtectedRoute = () => {
    const { user } = useAuth();

    useEffect(() => {
        if (!user) {
            toast.warn("Please log in to access this page");
        }
    }, [user]);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
