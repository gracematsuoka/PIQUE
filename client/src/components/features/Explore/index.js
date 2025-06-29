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
import { Bouncy } from 'ldrs/react';
import BoardSave from "../../popups/BoardSave";
import AddBoard from "../../popups/AddBoard";
import {usePosts} from '../../hooks/usePosts';

const Explore = () => {
    const {
        posts,
        boardData,
        setBoardData,
        hasMore,
        activePostId,
        loading,
        fetchBoards,
        fetchPosts,
        handleLike,
        handleOpen,
        removePost,
        addPost
    } = usePosts();

    const [selectedPost, setSelectedPost] = useState(null);
    const sentinelRef = useRef(null);
    const [showAddBoard, setShowAddBoard] = useState(false);

    useEffect(() => {
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