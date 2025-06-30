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

export const fetchPosts = async ({cursor, boardIds}) => {
    const token = await auth.currentUser.getIdToken();

    const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/posts/get-posts?limit=20&${cursor ? `cursor=${cursor}` : ''}`, {
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

export const fetchBoardPosts = async ({boardId, cursor, boardIds}) => {
    const token = await auth.currentUser.getIdToken();
    console.log('fetch:',boardIds)

    const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/posts/${boardId}/posts?limit=20&${cursor ? `cursor=${cursor}` : ''}`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({boardIds})
    })
    const data = await res.json();
    console.log('data pi:', data)
    return data;
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