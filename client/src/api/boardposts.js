import { auth } from "../firebase";

export const fetchBoards = async () => {
    const token = await auth.currentUser.getIdToken();
    const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/boards/get-boards`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const { boards } = await res.json();
    return boards;
}

export const fetchPosts = async ({cursor, boardIds, query}) => {
    const token = await auth.currentUser.getIdToken();
    console.log('query fetch', query)

    const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/posts/get-posts?${query ? `q=${query}&` : ''}limit=20&${cursor ? `cursor=${cursor}` : ''}`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({boardIds})
    })
    const { postData, hasMore, nextCursor } = await res.json();
    return { postData, hasMore, nextCursor };
}

export const fetchBoardPosts = async ({boardId, liked, userId, cursor, boardIds}) => {
    const token = await auth.currentUser.getIdToken();
    
    if (userId) {
        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/posts/profile-posts?userId=${userId}&limit=20&${cursor ? `cursor=${cursor}` : ''}`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({boardIds})
        });
        const data = await res.json();
        return data;
    } else {
        let query;
        if (boardId) query = `boardId=${boardId}&`;
        else if (liked) query = 'liked=true&';
        console.log('query', query)

        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/posts/saved?${query}limit=20&${cursor ? `cursor=${cursor}` : ''}`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({boardIds})
        });
        const data = await res.json();
        return data;
    }
}

export const removePost = async (boardId, postId) => {
    const token = await auth.currentUser.getIdToken();
    const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/boardposts/${postId}/remove-post/${boardId}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const { newCoverRef } = await res.json();
    return newCoverRef;
}

export const addPost = async (boardId, postId) => {
    const token = await auth.currentUser.getIdToken();
    const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/boardposts/${postId}/add-post/${boardId}`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const { newCoverRef } = await res.json();
    return newCoverRef;
}

export const unlikePost = async (postId) => {
    const token = await auth.currentUser.getIdToken();
    await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/posts/${postId}/unlike`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
}

export const likePost = async (postId) => {
    const token = await auth.currentUser.getIdToken();
    await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
}