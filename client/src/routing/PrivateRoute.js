import React from 'react';
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function PrivateRoute({ children }) {
    const { firebaseUser, loading, mongoUser } = useAuth();
    const location = useLocation();

    if (loading || firebaseUser && mongoUser === null) return null;

    if (!firebaseUser) return <Navigate to="/"/>;

    if (firebaseUser && !mongoUser?.username && location.pathname !== '/account-setup') {
        return <Navigate to="/account-setup"/>;
    }

    return children;
};