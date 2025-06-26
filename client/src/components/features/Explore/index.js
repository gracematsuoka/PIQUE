import TopBar from "../TopBar";
import NavBar from "../NavBar";
import './index.scss';
import SearchBar from "../../reusable/SearchBar";
import PostDetails from "../../popups/PostDetails";
// import outfit from '../../../assets/images/home/testoutfit.jpg';
import AddIcon from '@mui/icons-material/Add';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useState, useEffect, useRef } from "react";
import outfit from '../../../assets/images/test/400x600.png';
import collection from '../../../assets/images/test/500x500.png';
import { getAuth } from "firebase/auth";

const Explore = () => {
    const [showDetails, setShowDetails] = useState(false);
    const [posts, setPosts] = useState([]);
    const [cursor, setCursor] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [selectedId, setSelectedId] = useState(null);
    const sentinelRef = useRef(null);

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

    return (
        <div className="explore">
            <TopBar/>
                <div className="nav-content">
                    <NavBar/>
                    {selectedId && 
                        <PostDetails
                            posts={posts}
                            setPosts={setPosts}
                            selectedId={selectedId}
                            setSelectedId={setSelectedId}
                    />}
                    <div className="nav-content-wrapper">
                        <div className="search-bar-wrapper">
                            <SearchBar/>
                        </div>
                        <div className="posts">
                            {posts.map(post =>
                                <div className="post" key={post._id}>
                                    <img src={post.postURL} onClick={() => {
                                        setSelectedId(post._id);
                                    }}/>
                                    <div className="post-save-bar">
                                        <div className="like-btn" 
                                            onClick={() => handleLike(post._id)}>
                                            {!post.likedByUser && <FavoriteBorderIcon/>}
                                            {post.likedByUser && <FavoriteIcon style={{fill: '#c23b0e'}}/>}
                                            <p>{post.likes}</p>
                                        </div>
                                        <div className="save-btn">
                                            <AddIcon/>
                                            <p>SAVE</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {hasMore && 
                                <div ref={sentinelRef}/>
                            }
                        </div>
                    </div>
                </div>
        </div>
    )
} 

export default Explore