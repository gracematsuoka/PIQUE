import { getIdToken } from 'firebase/auth';

export const sendTokenToServer = async (user, name, username) => {
    const token = await getIdToken(user, true);
    const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/users/sync`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            name,
            username
        })
    })

    const data = await res.json();
    return data;
}