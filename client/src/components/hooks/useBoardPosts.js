import { useState } from "react";
import { auth } from '../../firebase';

export function useBoardPosts() {
    const [posts, setPosts] = useState([]);
    const [boardIds, setBoardIds] = useState([]);
    const [boardData, setBoardData] = useState([]);
    const [boards, setBoards] = useState([]);
    const [cursor, setCursor] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [activePostId, setActivePostId] = useState(null);
    const [loading, setLoading] = useState(false)

    const fetchBoards = async () => {
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

    // const fetchPosts = async () => {
    //     setLoading(true);
    //     const token = await auth.currentUser.getIdToken();

    //     const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/posts/get-posts?limit=20&${cursor ? `cursor=${cursor}` : ''}`, {
    //         method: 'POST',
    //         headers: {
    //             Authorization: `Bearer ${token}`
    //         }
    //     })
    //     const data = await res.json();
    //     setPosts(prev => [...prev, ...data.postData]);
    //     setCursor(data.nextCursor);
    //     setHasMore(data.hasMore);
    //     setLoading(false);
    // }

    const fetchBoardPosts = async (boardId) => {
        setLoading(true);
        const token = await auth.currentUser.getIdToken();

        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/posts/${boardId}/posts?limit=20&${cursor ? `cursor=${cursor}` : ''}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        const data = await res.json();
        setPosts(prev => [...prev, ...data.postData]);
        setCursor(data.nextCursor);
        setHasMore(data.hasMore);
        setLoading(false);
    }

    const handleLike = async (postId) => {
        const liked = posts.find(post => post._id === postId)?.likedByUser;

        setPosts(prev => 
            prev.map(post => 
                post._id === postId ? {...post, likedByUser: !post.likedByUser, 
                    likes: liked ? post.likes - 1 : post.likes + 1} 
                    : post
            ));

        const token = await auth.currentUser.getIdToken();

        if (liked) {
            await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/posts/${postId}/unlike`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
        } else {
            await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/posts/${postId}/like`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
        }
    }

    const checkBoards = async (postId) => {
        const token = await auth.currentUser.getIdToken();
        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/boardposts/${postId}/post-exists`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-type': 'application/json'
            },
            body: JSON.stringify({boardIds})
        })

        const exists = await res.json();
        const existsMap = new Map();
        if (exists.length > 0){
        exists.forEach(item => {
            existsMap.set(item.boardId, item.exists)
        });}

        setBoardData(boards.map(board => ({
            ...board,
            exists: existsMap.get(board._id.toString()) || false
        })));
    }

    const handleOpen = async (postId) => {
        if (postId === activePostId) {
            setActivePostId(null);
        } else {
            await checkBoards(postId);
            setActivePostId(postId);
        }
    }

    const removePost = async (boardId) => {
        const token = await auth.currentUser.getIdToken();
        await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/boardposts/${activePostId}/remove-post/${boardId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        setBoardData(prev => prev.map(board => 
            board._id.toString() === boardId.toString() ? {...board, exists: false} : board
        ));
    }

    const addPost = async (boardId) => {
        const token = await auth.currentUser.getIdToken();
        await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/boardposts/${activePostId}/add-post/${boardId}`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        setBoardData(prev => prev.map(board => 
            board._id.toString() === boardId.toString() ? {...board, exists: true} : board
        ));
    }

    return {
        posts,
        cursor,
        boardData,
        setBoardData,
        hasMore,
        activePostId,
        loading,
        fetchBoards,
        fetchBoardPosts,
        // fetchPosts,
        handleLike,
        handleOpen,
        removePost,
        addPost
    }
}
