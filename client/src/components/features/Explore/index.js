import TopBar from "../TopBar";
import NavBar from "../NavBar";
import './index.scss';
import SearchBar from "../../reusable/SearchBar";
import PostDetails from "../../popups/PostDetails";
// import outfit from '../../../assets/images/home/testoutfit.jpg';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useState, useEffect, useRef } from "react";
import outfit from '../../../assets/images/test/400x600.png';
import collection from '../../../assets/images/test/500x500.png';
import { getAuth } from "firebase/auth";
import { Bouncy } from 'ldrs/react';
import BoardSave from "../../popups/BoardSave";
import AddBoard from "../../popups/AddBoard";

const Explore = () => {
    const [posts, setPosts] = useState([]);
    const [cursor, setCursor] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [selectedPost, setSelectedPost] = useState(null);
    const [activePostId, setActivePostId] = useState(null);
    const [boards, setBoards] = useState([]);
    const [loading, setLoading] = useState(false)
    const sentinelRef = useRef(null);
    const [boardData, setBoardData] = useState([]);
    const [boardIds, setBoardIds] = useState([]);
    const [showAddBoard, setShowAddBoard] = useState(false);

    useEffect(() => {
        const fetchBoards = async () => {
            const token = await getAuth().currentUser.getIdToken();
            const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/boards/get-boards`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await res.json();
            setBoards(data.boards);
            setBoardIds(data.boards?.map(board => board._id));
        }

        fetchBoards();
    }, [])

    useEffect(() => {
        if (!hasMore) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    fetchPosts();
                }
            },
            {
                root: null,
                rootMargin: '0px',
                threshold: 1.0
            }
        )

        observer.observe(sentinelRef.current);

        return () => observer.disconnect();
    }, [hasMore]);

    const fetchPosts = async () => {
        setLoading(true);
        const auth = getAuth();
        const token = await auth.currentUser.getIdToken();

        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/posts/get-posts?limit=20&${cursor ? `cursor=${cursor}` : ''}`, {
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

        const auth = getAuth();
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
        const token = await getAuth().currentUser.getIdToken();
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
        const token = await getAuth().currentUser.getIdToken();
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
        const token = await getAuth().currentUser.getIdToken();
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

    return (
        <div className="explore">
            <TopBar/>
                <div className="nav-content">
                    <NavBar/>
                    {showAddBoard &&
                        <AddBoard
                            mode='add-explore'
                            setShowAddBoard={setShowAddBoard}
                            setBoardData={setBoardData}
                        />
                    }
                    {selectedPost && 
                        <PostDetails
                            selectedPost={selectedPost}
                            setSelectedPost={setSelectedPost}
                            handleLike={handleLike}
                    />}
                    <div className="nav-content-wrapper">
                        <div className="search-bar-wrapper">
                            <SearchBar/>
                        </div>
                        <div className="posts">
                            {posts.map(post =>
                                <div className="post" key={post._id}>
                                    <img src={post.postURL} onClick={() => {
                                        setSelectedPost(post);
                                    }}/>
                                    <div className={`post-save-bar ${activePostId === post._id ? 'active' : ''}`}>
                                        <div className="like-btn" 
                                            onClick={() => handleLike(post._id)}>
                                            {!post.likedByUser && <FavoriteBorderIcon/>}
                                            {post.likedByUser && <FavoriteIcon style={{fill: '#c23b0e'}}/>}
                                            <p>{post.likes}</p>
                                        </div>
                                        <div className="save-btn" 
                                            onClick={() =>  {
                                                handleOpen(post._id);
                                            }}>
                                            {activePostId === post._id ?
                                                <RemoveIcon/> :
                                                <AddIcon/> 
                                            }
                                            <p>SAVE</p>
                                        </div>
                                    </div>
                                    {activePostId === post._id && 
                                        <BoardSave 
                                            className='board-save'
                                            postId={activePostId}
                                            boardData={boardData}
                                            setBoardData={setBoardData}
                                            removePost={removePost}
                                            addPost={addPost}
                                            setShowAddBoard={setShowAddBoard}
                                        />
                                    }
                                </div>
                            )}
                            {hasMore && 
                                <div ref={sentinelRef}/>
                            }
                            {loading && <Bouncy
                            size="45"
                            speed="1.75"
                            color="#6B799F"
                            />}
                        </div>
                    </div>
                </div>
        </div>
    )
} 

export default Explore