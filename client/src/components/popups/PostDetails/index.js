import './index.scss';
import { useAuth } from '../../../contexts/AuthContext';
import defaultProfilePic from '../../../assets/images/icons/default-profile-pic.png'
import {ReactComponent as CloseIcon} from '../../../assets/images/icons/close.svg'
import outfit from '../../../assets/images/home/testoutfit.jpg';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useState, useEffect, useRef } from 'react';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import BlackShirt from '../../../assets/images/icons/hangshirt-black.png'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import Tooltip from '@mui/material/Tooltip';
import { auth } from '../../../firebase';
import { Canvas, FabricImage, FabricText } from 'fabric';
import { useNavigate } from 'react-router-dom';
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import BoardSave from '../BoardSave';
import AddBoard from '../AddBoard';
import { useQueryClient } from '@tanstack/react-query';

const PostDetails = ({
    selectedPost,
    setSelectedPost,
    mutate,
    boards,
    savedBoards
    }) => {
    const queryClient = useQueryClient();
    const [post, setPost] = useState(null);
    const navigate = useNavigate();
    const canvasRef = useRef();
    const fabricCanvasRef = useRef();
    const [selectedItem, setSelectedItem] = useState(null);
    const [hoverItemId, setHoverItemId] = useState(null);
    const zoom = 0.9;
    const [token, setToken] = useState(null);
    const [items, setItems] = useState([]);
    const [username, setUsername] = useState('');
    const [profileURL, setProfileURL] = useState('');
    const [showAddBoard, setShowAddBoard] = useState(false);
    const [showSave, setShowSave] = useState(false);

    useEffect(() => {
        const fetchPostDetails = async () => {
            const token = await auth.currentUser.getIdToken();
            setToken(token);
    
            const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/posts/${selectedPost._id}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            const postData = await res.json();
            setPost(postData);
            setUsername(postData.userRef?.username);
            setProfileURL(postData.userRef?.profileURL);
        }

        fetchPostDetails();
    }, [selectedPost])

    useEffect(() => {
        if (!post) return;
    
        const canvas = new Canvas(canvasRef.current, {
            selection: false,
            hoverCursor: 'pointer'
        });

        fabricCanvasRef.current = canvas;
        canvas.setViewportTransform([zoom, 0, 0, zoom, 0, 0]);
        canvas.calcOffset();

        (async () => {
            await canvas.loadFromJSON(
                post.canvasJSON,
                () => canvas.requestRenderAll(),
                {
                    Image: FabricImage,
                    Text: FabricText
                }
            );            
            
            canvas.enableRetinaScaling = true;
            canvas.getObjects().forEach(obj => obj.selectable = false);

            canvas.renderAll();
            function tick() {
                canvas.requestRenderAll();
                requestAnimationFrame(tick);
              }
              tick();

            const fonts = new Set();
            const itemIds = [];

            canvas.getObjects().forEach(obj => {
                if (obj.type === 'textbox') {
                    if (obj.fontFamily) fonts.add(obj.fontFamily);
                }
                itemIds.push(obj.itemId);
            })

            fonts.forEach(font => loadGoogleFont(font))
            fetchItemDetails(itemIds);

            document.fonts.ready.then(() => canvas.requestRenderAll());
        })();

        const fetchItemDetails = async (itemIds) => {
            try {
                const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/items/get-items`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-type': 'application/json'
                    },
                    body: JSON.stringify({itemIds})
                })

                const data = await res.json();
                setItems(data.items);
            } catch (err) {
                console.log('Failed to fetch items:', err);
            }
        }

        const easeOutCubic = t => (--t) * t * t + 1;

        const hover = e => {
            if (e.target?.itemId) {
                setHoverItemId(e.target.itemId);
                e.target.hovered = true;

                if (!e.target._originalScaleX) {
                    e.target._originalScaleX = e.target.scaleX;
                    e.target._originalScaleY = e.target.scaleY;
                }
                console.log("Target scaleX:", e.target.scaleX)
                e.target.animate('scaleX', e.target._originalScaleX * 1.1, {
                    duration: 150,
                    easing: easeOutCubic,
                    onChange: () => {
                        e.target.setCoords();
                        canvas.requestRenderAll();
                        console.log('scaled')
                    }
                });
                e.target.animate('scaleY', e.target._originalScaleY * 1.1, {
                    duration: 150,
                    easing: easeOutCubic,
                    onChange: () => {
                        e.target.setCoords();
                        canvas.requestRenderAll();
                    }
                });
            }
        }

        const mouseOut = e => {
            setHoverItemId(null);
            const target = e.target;
            if (!target || !target.hovered) return;

            target.hovered = false;
            target.animate('scaleX', target._originalScaleX, {
                duration: 150,
                onChange: canvas.renderAll.bind(canvas),
                easing: easeOutCubic
            });
            target.animate('scaleY', target._originalScaleY, {
                duration: 150,
                onChange: canvas.renderAll.bind(canvas),
                easing: easeOutCubic
            });
        };

        canvas.on('mouse:over', hover);
        canvas.on('mouse:out', mouseOut);

        return () => {
            canvas.dispose();
            fabricCanvasRef.current = null;
        }
    }, [post, token])

    useEffect(() => {
        const canvas = fabricCanvasRef.current;
        if (!items?.length || !canvas) return;

        const mouseDown = e => {
            if (e.target?.itemId) {
                setSelectedItem(items.find(item => item._id === e.target.itemId));
                console.log(items.find(item => item._id === e.target.itemId))
            }
        }

        canvas.on('mouse:down', mouseDown);

        return () => canvas.off('mouse:down', mouseDown)
    }, [items])

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
        <div className="popup-overlay"></div>
                <div className="popup-container overlay">
                    <div className='popup-content'>
                        <div className='post-header'>
                            <Tooltip title={`View @${username}`}>
                                <img src={profileURL || defaultProfilePic} onClick={() => navigate(`/profile/${username}`)}/>
                            </Tooltip>
                            <p>{post?.title.toUpperCase()}</p>
                            <div className='close' onClick={() => setSelectedPost(null)}>
                                <CloseIcon/>
                            </div>
                        </div>
                        <hr/>
                        <div className='post-content'>
                            <div className='outfit'>
                                <canvas ref={canvasRef} width={400 * zoom} height={600 * zoom}/>
                            </div>
                            <div className='post-details'>
                                <div className='save-bar'>
                                    <div className='toolbar-icon like' 
                                        onClick={() => mutate({postId: post._id, liked: post.likedByUser})}>
                                            {!selectedPost.likedByUser && <FavoriteBorderIcon/>}
                                            {selectedPost.likedByUser && <FavoriteIcon style={{fill: '#c23b0e'}}/>}
                                            <p>{selectedPost.likes}</p>
                                    </div>
                                    <Tooltip title='Save to board'>
                                    <div className='save-btn' onClick={() => setShowSave(prev => !prev)}>
                                        {showSave ? 
                                            <RemoveIcon/> :
                                            <AddIcon/>
                                        }
                                        <p>SAVE</p>
                                    </div>
                                    {showSave &&
                                        <BoardSave 
                                            className='board-save'
                                            postId={post._id}
                                            boards={boards}
                                            savedBoards={savedBoards}
                                            setShowAddBoard={setShowAddBoard}
                                        />
                                    }
                                    </Tooltip>
                                </div>
                                <p className='description'>{post?.description}</p>
                                <h1>ITEMS</h1>
                                <div className='items-wrapper' >
                                    {items.map(item =>
                                        <div className='post-item' key={item._id}>
                                            <div className={`item-top ${hoverItemId === item._id ? 'active' : ''}`}
                                                onClick={() => setSelectedItem(item)}>
                                                <p>{item.name}</p>
                                                <div className='item-arrow'>
                                                    <KeyboardArrowRightIcon/>
                                                </div>
                                            </div>
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
                                                <Tooltip title='Add to rack'>
                                                <div className='toolbar-icon'>
                                                    <AddIcon/>
                                                </div>
                                                </Tooltip>
                                            </div>
                                            <hr/>
                                        </div>
                                        )}
                                        <div className={`post-item-det ${selectedItem ? 'show' : ''}`}>
                                            <div className='item-arrow' onClick={() => setSelectedItem(null)}>
                                                <KeyboardArrowLeftIcon/>
                                            </div>
                                            <div className='item-header'>
                                                <h1>{selectedItem?.name}</h1>
                                                <div className='circle' style={{backgroundColor: selectedItem?.colors[0].hex}}/>
                                                <p id='brand' style={{color: selectedItem?.brand ? 'black' : '#BBBBBB'}}>
                                                    {selectedItem?.brand || '---'}
                                                </p>
                                                <div className='item-link'>
                                                    <a href={selectedItem?.link.startsWith('http') ? selectedItem?.link : `https://${selectedItem?.link}`}
                                                        id='link'
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => {
                                                            if (!selectedItem?.link) e.preventDefault(); 
                                                        }}
                                                        style={{color: selectedItem?.link ? 'white' : '#BBBBBB'}}
                                                        >
                                                        {selectedItem?.link.replace('https://', '').replace('www.', '') || '---'}
                                                    </a>
                                                    <ArrowOutwardIcon/>
                                                </div>
                                            </div>
                                            <hr/>
                                            <div className='item-mid'>
                                                <div className='item-field-disp'>
                                                    <label htmlFor='price'>PRICE</label>
                                                    <p id='price' style={{color: selectedItem?.price ? 'black' : '#BBBBBB'}}>
                                                        ${selectedItem?.price || ' ---'}
                                                    </p>
                                                </div>
                                                <div className='item-field-disp'>
                                                    <label htmlFor='category'>CATEGORY</label>
                                                    <p id='category' style={{color: selectedItem?.category ? 'black' : '#BBBBBB'}}>
                                                        {selectedItem?.category || '---'}
                                                    </p>
                                                </div>
                                            </div>
                                            <hr/>
                                            <div className='quick-add'>
                                                <div className='toolbar-icon'>
                                                    <ShoppingBagIcon/>
                                                    <p>Add to wishlist</p>
                                                </div>
                                                <div className='toolbar-icon'>
                                                    <img src={BlackShirt}/>
                                                    <p>Add to closet</p>
                                                </div>
                                                <div className='toolbar-icon'>
                                                    <AddIcon/>
                                                    <p>Add to rack</p>
                                                </div>
                                            </div>
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