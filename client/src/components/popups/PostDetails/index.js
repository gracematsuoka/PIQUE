import './index.scss';
import { useAuth } from '../../../contexts/AuthContext';
import defaultProfilePic from '../../../assets/images/icons/default-profile-pic.png'
import {ReactComponent as CloseIcon} from '../../../assets/images/icons/close.svg'
import outfit from '../../../assets/images/home/testoutfit.jpg';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useState, useEffect, useRef } from 'react';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import BlackShirt from '../../../assets/images/icons/hangshirt-black.png'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import Tooltip from '@mui/material/Tooltip';
import { getAuth } from 'firebase/auth';
import { Canvas, FabricImage, FabricText,  } from 'fabric';
import { useNavigate } from 'react-router-dom';

const PostDetails = ({
    selectedPost,
    setSelectedPost,
    handleLike
    }) => {
    const {mongoUser} = useAuth();
    const [post, setPost] = useState(null);
    const navigate = useNavigate();
    const canvasRef = useRef();
    const [canvas, setCanvas] = useState(null);

    useEffect(() => {
        const fetchPostDetails = async () => {
            const auth = getAuth();
            const token = await auth.currentUser.getIdToken();

            const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/posts/${selectedPost._id}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            const postData = await res.json();
            setPost(postData);
        }

        fetchPostDetails();
    }, [selectedPost])

    useEffect(() => {
        if (!post) return;
    
        const canvas = new Canvas(canvasRef.current, {
            selection: false,
            hoverCursor: 'pointer'
        });

        (async () => {
            await canvas.loadFromJSON(
                post.canvasJSON,
                () => canvas.requestRenderAll(),
                {
                    Image: FabricImage,
                    Text: FabricText
                }
            );

            
            
            canvas.getObjects().forEach(obj => obj.selectable = false);

            const fonts = new Set();
            canvas.getObjects().forEach(obj => {
                if (obj.type === 'textbox') {
                    if (obj.fontFamily) fonts.add(obj.fontFamily);
                }
            })

            fonts.forEach(font => loadGoogleFont(font))

            document.fonts.ready.then(() => canvas.requestRenderAll());
        })();

        return () => canvas.dispose();
    }, [post])

    const loadGoogleFont = (font) => {
        const fontId = font.replace(/\s+/g, '');
        if (!document.getElementById(fontId)) {
            const link = document.createElement('link');
            link.id = fontId;
            link.href = `https://fonts.googleapis.com/css2?family=${font.replace(/ /g, "+")}&display=swap`;
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        }
    }

    return (
        <div className='post-details'>
        <div className="popup-overlay"></div>
                <div className="popup-container overlay">
                    <div className='popup-content'>
                        <div className='post-header'>
                            <img src={mongoUser?.profileURL || defaultProfilePic}/>
                            <p>{post?.title.toUpperCase()}</p>
                            <div className='close' onClick={() => setSelectedPost(null)}>
                                <CloseIcon/>
                            </div>
                        </div>
                        <hr/>
                        <div className='post-content'>
                            {/* <img className='outfit' src={outfit}/> */}
                            <div className='outfit'>
                                <canvas ref={canvasRef} width={400} height={600}/>
                            </div>
                            <div className='post-details'>
                                <div className='save-bar'>
                                    <div className='toolbar-icon like' onClick={() => handleLike(selectedPost._id)}>
                                            {!selectedPost.likedByUser && <FavoriteBorderIcon/>}
                                            {selectedPost.likedByUser && <FavoriteIcon style={{fill: '#c23b0e'}}/>}
                                            <p>{selectedPost.likes}</p>
                                    </div>
                                    <Tooltip title='Save to board'>
                                    <div className='save-btn'>
                                        <p>+ SAVE</p>
                                    </div>
                                    </Tooltip>
                                </div>
                                <p className='description'>{post?.description}</p>
                                <h1>ITEMS</h1>
                                <div className='post-item'>
                                    <div className='item-left'>
                                        <p>Long Sleeve</p>
                                        <div className='quick-add'>
                                            <Tooltip title='Add to wishlist'>
                                            <div className='toolbar-icon'>
                                                <ShoppingBagIcon/>
                                            </div>
                                            </Tooltip>
                                            <Tooltip title='Add to closet'>
                                            <div className='toolbar-icon'>
                                                <img src={BlackShirt}/>
                                            </div>
                                            </Tooltip>
                                        </div>
                                    </div>
                                    <div className='item-right'>
                                        <KeyboardArrowRightIcon/>
                                    </div>
                                </div>
                                <div className='post-item'>
                                    <div className='item-left'>
                                        <p>Long Sleeve</p>
                                        <div className='quick-add'>
                                            <Tooltip title='Add to wishlist'>
                                            <div className='toolbar-icon'>
                                                <ShoppingBagIcon/>
                                            </div>
                                            </Tooltip>
                                            <Tooltip title='Add to closet'>
                                            <div className='toolbar-icon'>
                                                <img src={BlackShirt}/>
                                            </div>
                                            </Tooltip>
                                        </div>
                                    </div>
                                    <div className='item-right'>
                                        <KeyboardArrowRightIcon/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
        </div>
    )
}

export default PostDetails;