import { auth } from "../firebase";
import { fetchWithError } from "../utils/fetchWithError";

export const fetchTags = async () => {
    try {
        const token = await auth.currentUser.getIdToken();
        const {tags} = await fetchWithError(`${process.env.REACT_APP_API_BASE_URL}/api/users/get-tags`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        return tags;
    } catch (err) {
        console.error('Failed to fetch:', err.message);
    }
}

export const addTags = async ({tags}) => {
    try {
        const token = await auth.currentUser.getIdToken();
        const {addedTags} = await fetchWithError(`${process.env.REACT_APP_API_BASE_URL}/api/users/create-tag`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({tags})
        });

        return addedTags;
    } catch (err) {
        console.error('Failed to fetch:', err.message);
    }
}

export const updateTags = async ({tags}) => {
    try {
        const token = await auth.currentUser.getIdToken();
        const {updatedTags} = await fetchWithError(`${process.env.REACT_APP_API_BASE_URL}/api/users/update-tags`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({tags})
        });

        return updatedTags;
    } catch (err) {
        console.error('Failed to fetch:', err.message);
    }
}

export const deleteTag = async ({tagId}) => {
    try {
        const token = await auth.currentUser.getIdToken();
        await fetchWithError(`${process.env.REACT_APP_API_BASE_URL}/api/users/delete-tag?tagId=${tagId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`
            },
        });
    } catch (err) {
        console.error('Failed to fetch:', err.message);
    }
}