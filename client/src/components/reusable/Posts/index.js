import './index.scss'
import { useSavedPosts } from "../../hooks/useSavedPosts";
import PostDetails from '../../popups/PostDetails';
import BoardSave from '../../popups/BoardSave';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { Bouncy } from 'ldrs/react';
import { useBoard } from '../../hooks/useBoard';
import { useToggleLike } from '../../hooks/useToggleLike';
import { useEffect, useState, useRef } from 'react';
import { useQueryClient } from "@tanstack/react-query";
import AddBoard from '../../popups/AddBoard';
import Masonry from 'react-masonry-css';

const Posts = ({
    mode,
    boardId,
    userId
    }) => {
    const [activePostId, setActivePostId] = useState(null);
    const { mutate } = useToggleLike();
    const sentinelRef = useRef(null);
    const [selectedPost, setSelectedPost] = useState(null);
    const [showAddBoard, setShowAddBoard] = useState(false);
    const queryClient = useQueryClient();

    let query;
    if (mode === 'board') {
        query = {boardId};
    } else if (mode === 'liked') {
        query = {liked: true};
    } else {
        query = {userId};
    }

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
        error
    } = useSavedPosts(query);

    const { data: boards = [], isLoading: boardIsLoading } = useBoard();

    const posts = data?.pages.flatMap(page => page.postData) || [];

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
        <div className='posts'>
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
                    query={query}
                />}
            {(isLoading || isFetchingNextPage || boardIsLoading) ? (
                <Bouncy
                    size="45"
                    speed="1.75"
                    color="#6B799F"
                /> 
            ) : (
                posts.length > 0 ? (
                    <Masonry 
                        breakpointCols={{
                            default: 5,
                            1100: 4,
                            900: 3,
                            700: 2,
                            400: 1
                        }}
                        className='masonry-posts'
                        columnClassName='masonry-posts_col'>
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
                                                queryKeys: [['posts', ''], ['savedPosts', query]]
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
                                    queryKeys={[['posts'], ['savedPosts', query]]}
                                />
                            }
                        </div>
                    )}
                </Masonry>
                ) : (
                    <div className='empty'>
                        <p>You have no saved posts yet...</p>
                        <div className='empty-h1'>
                            <h1>Click <i>{mode === 'profile' ? 'Create' : 'Explore'}</i> to get started</h1>
                        </div>
                    </div>
                ))}
            {hasNextPage && 
                <div ref={sentinelRef}/>
            }
        </div>
    )
}

export default Posts