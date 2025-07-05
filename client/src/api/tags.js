import { auth } from "../firebase";

export const fetchTags = async () => {
    const token = await auth.currentUser.getIdToken();
    const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/users/get-tags`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    const {tags} = await res.json();
    return tags;
}

export const addTags = async ({tags}) => {
    const token = await auth.currentUser.getIdToken();
    const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/users/create-tag`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({tags})
    });

    const {addedTags} = await res.json();
    return addedTags;
}

export const updateTags = async ({tags}) => {
    const token = await auth.currentUser.getIdToken();
    const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/users/update-tags`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({tags})
    });

    const {updatedTags} = await res.json();
    return updatedTags;
}

export const deleteTag = async ({tagId}) => {
    const token = await auth.currentUser.getIdToken();
    await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/users/delete-tag?tagId=${tagId}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`
        },
    })
}