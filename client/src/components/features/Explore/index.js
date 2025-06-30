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
import ErrorIcon from '@mui/icons-material/Error';
import { useState, useEffect, useRef } from "react";
import outfit from '../../../assets/images/test/400x600.png';
import collection from '../../../assets/images/test/500x500.png';
import { Bouncy } from 'ldrs/react';
import BoardSave from "../../popups/BoardSave";
import AddBoard from "../../popups/AddBoard";
import { usePost } from "../../hooks/usePost";
import { useBoard } from "../../hooks/useBoard";
import { useToggleLike } from "../../hooks/useToggleLike";
import { useQueryClient } from "@tanstack/react-query";

const Explore = () => {

    const { data: boards = [] } = useBoard();

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
        error
    } = usePost();

    const { mutate } = useToggleLike();
    const posts = data?.pages.flatMap(page => page.postData) || [];
    const [selectedPost, setSelectedPost] = useState(null);
    const sentinelRef = useRef(null);
    const [showAddBoard, setShowAddBoard] = useState(false);
    const [activePostId, setActivePostId] = useState(null);
    const queryClient = useQueryClient();

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

        observer.observe(sentinelRef.current);

        return () => observer.disconnect();
    }, [hasNextPage]);
    
    const handleOpen = (postId) => {
        if (activePostId === postId) {
            setActivePostId(null);
        } else {
            setActivePostId(postId);
        }
    }

    if (isError) {
        return (
            <div className='query-error'>
                <div className='error-wrapper'>
                    <ErrorIcon/>
                    <h1>Error: {error.message}</h1>
                </div>
            </div>
        )
    }

    return (
        <div className="explore">
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
                                    onClick={() => mutate({postId: post._id, liked: post.likedByUser})}>
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
                                />
                            }
                        </div>
                    )}
                    {hasNextPage && 
                        <div ref={sentinelRef}/>
                    }
                    {isFetchingNextPage && <Bouncy
                    size="45"
                    speed="1.75"
                    color="#6B799F"
                    />}
                </div>
            </div>
        </div>
    )
} 

export default Explore