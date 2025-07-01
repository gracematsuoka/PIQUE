import { useParams } from 'react-router-dom';
import './index.scss';
import SearchBar from '../../reusable/SearchBar';
import { useEffect, useState, useRef } from 'react';
import { auth } from '../../../firebase';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import AddBoard from '../../popups/AddBoard';
import PostDetails from '../../popups/PostDetails';
import BoardSave from '../../popups/BoardSave';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { Bouncy } from 'ldrs/react';
import EditIcon from '@mui/icons-material/Edit';
import { useSavedPosts } from '../../hooks/useSavedPosts';
import { useBoard } from '../../hooks/useBoard';
import { useToggleLike } from '../../hooks/useToggleLike';
import { useQueryClient } from "@tanstack/react-query";

const Board = () => {
    const {boardId} = useParams();

    const { data: boards = [], isLoading: boardIsLoading } = useBoard();

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
        error
    } = useSavedPosts({boardId});

    const queryClient = useQueryClient();
    const { mutate } = useToggleLike();
    const posts = data?.pages.flatMap(page => page.postData) || [];
    const sentinelRef = useRef(null);
    const [showAddBoard, setShowAddBoard] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [showEditBoard, setShowEditBoard] = useState(false);
    const [activePostId, setActivePostId] = useState(null);
    const board = boards.find(board => board._id === boardId);

    useEffect(() => {
        if (!hasNextPage) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    fetchNextPage();
                }
            },
            {
                root: null,
                rootMargin: '0px',
                threshold: 1.0
            }
        )
        if (sentinelRef.current){
            observer.observe(sentinelRef.current)
        };

        return () => observer.disconnect();
    }, [hasNextPage]);

    const handleOpen = (postId) => {
        if (activePostId === postId) {
            setActivePostId(null);
        } else {
            setActivePostId(postId);
        }
    }

    return (
        <div className="board-page">
            {showAddBoard &&
                <AddBoard
                    mode='add'
                    close={() => setShowAddBoard(false)}
                    onSuccess={(newBoard) => {
                        setShowAddBoard(false);
                        queryClient.setQueryData(['boards'], prev => [...prev, newBoard]);
                    }}
                />
            }
            {selectedPost && 
                <PostDetails
                    selectedPost={selectedPost}
                    setSelectedPost={setSelectedPost}
                    mutate={mutate}
                    boards={boards}
                    savedBoards={posts.find(post => post._id === selectedPost._id)?.savedBoards || []}
                />}

            {showEditBoard &&
                <AddBoard
                    mode='edit'
                    board={board}
                    close={() => setShowEditBoard(false)}
                    onSuccess={(newBoard) => {
                        setShowEditBoard(false);
                        queryClient.setQueryData(['boards'], 
                            prev => (prev.map(board => 
                                board._id === newBoard._id ? newBoard : board))
                    )}}
                />
            }
            <div className="nav-content-wrapper">
                <div className='board-header'>
                    <div className='board-title-edit'>
                        <h1>{board?.title?.toUpperCase()}</h1>
                        <EditIcon onClick={() => setShowEditBoard(true)}/>
                    </div>
                    <div className='numsaved'>
                        <AttachFileIcon/>
                        <p>{board?.numSaved} Saved</p>
                    </div>
                    <p className='board-desc'>{board?.description}</p>
                </div>
                <div className="search-bar-wrapper">
                    <SearchBar/>
                </div>
                {(isLoading || isFetchingNextPage || boardIsLoading) ? (
                    <Bouncy
                        size="45"
                        speed="1.75"
                        color="#6B799F"
                    /> 
                ) : (
                    posts.length > 0 ? (
                        <div className='posts'>
                            {posts.map(post => 
                                <div className='post' key={post._id}>
                                    <img src={post.postURL} onClick={() => {
                                        setSelectedPost(post);
                                    }}/>
                                    <div className={`post-save-bar ${activePostId === post._id ? 'active' : ''}`}>
                                        <div className="like-btn" 
                                            onClick={() => 
                                                mutate({postId: post._id, 
                                                        liked: post.likedByUser,
                                                        queryKeys: [['posts'], ['savedPosts', {boardId}]]
                                                        })}>
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
                                            boards={boards}
                                            savedBoards={posts.find(post => post._id === activePostId)?.savedBoards || []}
                                            setShowAddBoard={setShowAddBoard}
                                            queryKey={[['posts'], ['savedPosts', {boardId}]]}
                                        />
                                    }
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className='empty'>
                            <p>You have no saved posts yet...</p>
                            <div className='empty-h1'>
                                <h1>Click <i>'Explore'</i> to get started</h1>
                            </div>
                        </div>
                    ))}
                {hasNextPage && 
                    <div ref={sentinelRef}/>
                }
            </div>
        </div>
    )
}

export default Board;