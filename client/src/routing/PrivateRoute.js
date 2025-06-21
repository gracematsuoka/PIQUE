import React from 'react';
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function PrivateRoute({ children }) {
    const { firebaseUser, loading } = useAuth();

    if (loading) {
        return null;
    }

    return firebaseUser ? children : <Navigate to='/'/>;
};