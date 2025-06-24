import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ children }) => {
    const { currentUser } = useAuth();

    if (!currentUser) {
        // User not logged in, redirect to login page
        return <Navigate to="/login" />;
    }

    return children; // User is logged in, render the child components
};

export default ProtectedRoute; 