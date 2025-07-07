import { getIdToken } from 'firebase/auth';
import { fetchWithError } from './fetchWithError';

export const sendTokenToServer = async (user, name, username) => {
    try {
        const token = await getIdToken(user, true);
        const data = await fetchWithError(`${process.env.REACT_APP_API_BASE_URL}/api/users/sync`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name,
                username
            })
        });

        return data;
    } catch (err) {
        console.error('Failed to fetch:', err.message);
    }
}