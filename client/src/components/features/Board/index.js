import { useParams } from 'react-router-dom';
import './index.scss';
import SearchBar from '../../reusable/SearchBar';
import TopBar from '../TopBar';
import NavBar from '../NavBar';
import { useEffect, useState, useRef } from 'react';
import { auth } from '../../../firebase';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { usePosts } from '../../hooks/usePosts';
import AddBoard from '../../popups/AddBoard';
import PostDetails from '../../popups/PostDetails';
import BoardSave from '../../popups/BoardSave';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';

const Board = () => {
    const {
        posts,
        boardData,
        setBoardData,
        hasMore,
        activePostId,
        loading,
        fetchBoards,
        fetchPosts,
        fetchBoardPosts,
        handleLike,
        handleOpen,
        removePost,
        addPost
    } = usePosts();

    const {boardId} = useParams();
    const sentinelRef = useRef(null);
    const [board, setBoard] = useState([]);
    const [showAddBoard, setShowAddBoard] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);

    console.log('auth:', auth.currentUser)

    useEffect(() => {
        console.log('ran')
        if (!boardId || !auth.currentUser) return;
        console.log('elllo')
        const fetchBoard = async () => {
            console.log('hi')
            try {
                const token = await auth.currentUser.getIdToken();
                const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/boards/${boardId}/board`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const data = await res.json();
                console.log('board:', data)
                setBoard(data);
            } catch (err) {
                console.log('Failed to fetch board data:', err);
            }
        }

        fetchBoard();
        fetchBoards();
    }, [boardId]);

    useEffect(() => {
        fetchBoardPosts(boardId);
    }, [hasMore]);

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

    if (loading) return;

    return (
        <div className="board-page">
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
                        <div className='board-header'>
                            <h1>{board?.title.toUpperCase()}</h1>
                            <div className='numsaved'>
                                <AttachFileIcon/>
                                <p>{board?.numSaved} Saved</p>
                            </div>
                            <p className='board-desc'>{board?.description}</p>
                        </div>
                        <div className="search-bar-wrapper">
                            <SearchBar/>
                        </div>
                        {posts.length > 0 ? (
                            <div className='posts'>
                                {posts.map(post => 
                                    <div className='post' key={post.postRef._id}>
                                        <img src={post.postRef.postURL} onClick={() => {
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
                            </div>
                        ) : (
                            <div className='empty'>
                                <p>You have no saved posts yet...</p>
                                <div className='empty-h1'>
                                    <h1>Click <i>'Explore'</i> to get started</h1>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
        </div>
    )
}

export default Board;