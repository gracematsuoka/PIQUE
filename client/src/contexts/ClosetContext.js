import React, {useContext, useState, useEffect} from 'react';
import { auth } from '../firebase';

const ClosetContext = React.createContext();

export function useCloset() {
    return useContext(ClosetContext);
}

export function ClosetProvider({ children }) {
    const [closetItems, setClosetItems] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        const fetchCloset = async () => {
            try {
                const token = await auth.currentUser.getIdToken();


                const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/useritems/get-closet`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })

                const data = await res.json();
                setClosetItems(data.items);
            } catch (err) {
                console.log('Failed to fetch closet:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchCloset();
    }, []);

    const value = {
        closetItems,
        setClosetItems,
        loading,
        setLoading
    }

    return (
        <ClosetContext.Provider value={value}>
            {children}
        </ClosetContext.Provider>
    )
}