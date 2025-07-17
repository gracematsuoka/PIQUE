import React, { useContext, useState, useEffect } from 'react'
import {auth, googleProvider} from '../firebase'
import {getIdToken, setPersistence, browserLocalPersistence, getAuth} from 'firebase/auth'
import { createUserWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, signInWithPopup } from 'firebase/auth';
import { fetchWithError } from '../utils/fetchWithError';

const AuthContext = React.createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [firebaseUser, setFirebaseUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mongoUser, setMongoUser] = useState(null);
    const signup = async (email, password) => {
        return await createUserWithEmailAndPassword(auth, email, password);
    }

    const login = async (email, password) => {
        return await signInWithEmailAndPassword(auth, email, password);
    }

    const logout = async () => {
        return await signOut(auth);
    }

    const resetPassword = async (email) => {
        return await sendPasswordResetEmail(auth, email);
    }

    const refreshMongoUser = async () => {
        try {
            const user = auth.currentUser;
            if (!user) return;

            const token = await user.getIdToken(true);
            const data = await fetchWithError(`${process.env.REACT_APP_API_BASE_URL}/api/users/me`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setMongoUser(data);
        } catch (err) {
            console.log('Failed to refresh mongoUser:', err);
        }
    }

    const googleLogin = async () => {
        try {
            await setPersistence(auth, browserLocalPersistence);
            const res = await signInWithPopup(auth, googleProvider);
            const user = res.user;
            const token = await getAuth().currentUser.getIdToken(true);
            
            const backendUser = await fetchWithError(`${process.env.REACT_APP_API_BASE_URL}/api/users/google-signin`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
            });

            setFirebaseUser(user);
            setMongoUser(backendUser);

            return { firebaseUser: user, mongoUser: backendUser };
        } catch (err) {
            console.error('Failed to fetch:', err.message);
        }
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setFirebaseUser(user);
                try {
                    if (!user) throw new Error('No firebase user');

                    const token = await getIdToken(user, true);
                    const data = await fetchWithError(`${process.env.REACT_APP_API_BASE_URL}/api/users/me`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    setMongoUser(data);
                } catch (err) {
                    console.error('Failed to fetch user from backend:', err);
                    setMongoUser(null);
                } finally {
                    setLoading(false);
                }
        })

        return unsubscribe;
    }, [])

    const currentUser = firebaseUser && mongoUser ? { firebaseUser, mongoUser } : null;

    const value = {
        currentUser,
        firebaseUser,
        mongoUser,
        signup,
        login,
        logout,
        resetPassword,
        googleLogin,
        loading,
        refreshMongoUser 
    }

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}