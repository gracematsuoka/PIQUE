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
import { useSearchParams } from 'react-router-dom';

const Explore = () => {
    const { mutate } = useToggleLike();
    const [selectedPost, setSelectedPost] = useState(null);
    const sentinelRef = useRef(null);
    const [showAddBoard, setShowAddBoard] = useState(false);
    const [activePostId, setActivePostId] = useState(null);
    const queryClient = useQueryClient();
    const [searchInput, setSearchInput] = useSearchParams();
    const searchTerm = searchInput.get('q') || '';
    const { data: boards = [] } = useBoard();
    const [input, setInput] = useState(searchTerm);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
        error
    } = usePost({query: searchTerm});

    const posts = data?.pages.flatMap(page => page.postData) || [];

    useEffect(() => {
        setInput(searchInput.get('q') || '')
    }, [searchInput])

    const onSearch = (input) => {
        setSearchInput({q: input});
    }

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
                    searchTerm={searchTerm}
            />}
            <div className="nav-content-wrapper">
                <div className="search-bar-wrapper">
                    <SearchBar 
                        onSearch={onSearch}
                        input={input}
                        setInput={setInput}
                    />
                </div>
                <div className="posts">
                    {(isLoading || isFetchingNextPage ) ? (
                        <Bouncy
                            size="45"
                            speed="1.75"
                            color="#6B799F"
                        /> 
                    ) : (
                    posts.length > 0 ? (
                        posts.map(post =>
                            <div className="post" key={post._id}>
                                <img src={post.postURL} onClick={() => {
                                    setSelectedPost(post);
                                }}/>
                                <div className={`post-save-bar ${activePostId === post._id ? 'active' : ''}`}>
                                    <div className="like-btn" 
                                        onClick={() => 
                                            mutate({
                                                postId: post._id, 
                                                liked: post.likedByUser,
                                                queryKeys: [['posts', searchTerm], ['savedPosts', {liked: true}]]
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
                                        queryKeys={[['posts', searchTerm]]}
                                    />
                                }
                            </div>
                            )
                        ) : (
                        <div className='empty'>
                            <p>No search results match '{searchTerm}'...</p>
                            <div className='empty-h1'>
                                <h1>Try a different search input</h1>
                            </div>
                        </div>
                        ))
                    }
                    {hasNextPage && 
                        <div ref={sentinelRef}/>
                    }
                </div>
            </div>
        </div>
    )
} 

export default Explore