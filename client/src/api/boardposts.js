import { auth } from "../firebase";
import { fetchWithError } from "../utils/fetchWithError";

export const fetchBoards = async () => {
    try {
        const token = await auth.currentUser.getIdToken();
        const { boards } = await fetchWithError(`${process.env.REACT_APP_API_BASE_URL}/api/boards/get-boards`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        return boards;
    } catch (err) {
        console.error('Failed to fetch:', err.message);
    }
}

export const fetchPosts = async ({cursor, boardIds, query}) => {
    try {
        const token = await auth.currentUser.getIdToken();

        const { postData, hasMore, nextCursor } = await fetchWithError(`${process.env.REACT_APP_API_BASE_URL}/api/posts/get-posts?${query ? `q=${query}&` : ''}limit=20&${cursor ? `cursor=${cursor}` : ''}`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({boardIds})
        })

        return { postData, hasMore, nextCursor };
    } catch (err) {
        console.error('Failed to fetch:', err.message);
    }
}

export const fetchBoardPosts = async ({boardId, liked, userId, cursor, boardIds}) => {
    try {
        const token = await auth.currentUser.getIdToken();
        
        if (userId) {
            const data = await fetchWithError(`${process.env.REACT_APP_API_BASE_URL}/api/posts/profile-posts?userId=${userId}&limit=20&${cursor ? `cursor=${cursor}` : ''}`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({boardIds})
            });

            return data;
        } else {
            let query;
            if (boardId) query = `boardId=${boardId}&`;
            else if (liked) query = 'liked=true&';

            const data = await fetchWithError(`${process.env.REACT_APP_API_BASE_URL}/api/posts/saved?${query}limit=20&${cursor ? `cursor=${cursor}` : ''}`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({boardIds})
            });

            return data;
        };
    } catch (err) {
        console.error('Failed to fetch:', err.message);
    }
}

export const removePost = async (boardId, postId) => {
    try {
        const token = await auth.currentUser.getIdToken();
        const { newCoverRef } = await fetchWithError(`${process.env.REACT_APP_API_BASE_URL}/api/boardposts/${postId}/remove-post/${boardId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        return newCoverRef;
    } catch (err) {
        console.error('Failed to fetch:', err.message);
    }
}

export const addPost = async (boardId, postId) => {
    try {
        const token = await auth.currentUser.getIdToken();
        const { newCoverRef } = await fetchWithError(`${process.env.REACT_APP_API_BASE_URL}/api/boardposts/${postId}/add-post/${boardId}`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        return newCoverRef;
    } catch (err) {
        console.error('Failed to fetch:', err.message);
    }
}

export const unlikePost = async (postId) => {
    try {
        const token = await auth.currentUser.getIdToken();
        await fetchWithError(`${process.env.REACT_APP_API_BASE_URL}/api/posts/${postId}/unlike`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    } catch (err) {
        console.error('Failed to fetch:', err.message);
    }
}

export const likePost = async (postId) => {
    try {
        const token = await auth.currentUser.getIdToken();
        await fetchWithError(`${process.env.REACT_APP_API_BASE_URL}/api/posts/${postId}/like`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    } catch (err) {
        console.error('Failed to fetch:', err.message);
    }
}