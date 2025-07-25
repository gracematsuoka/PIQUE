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
import { useCreateCopy } from '../../hooks/useMutateItems';
import { useDeleteItem } from '../../hooks/useMutateItems';
import CheckIcon from '@mui/icons-material/Check';
import { fetchWithError } from '../../../utils/fetchWithError';

const PostDetails = ({
    selectedPost,
    setSelectedPost,
    mutate,
    boards,
    savedBoards,
    searchTerm,
    query
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
    const [liked, setLiked] = useState(false);
    const [likes, setLikes] = useState(0);
    const createCopy = useCreateCopy();
    const deleteItem = useDeleteItem();
    const [addW, setAddW] = useState([]);
    const [addC, setAddC] = useState([]);
    let queryKeys = [['posts', '']];
    if (query) {
        queryKeys.push(['savedPosts', query]);
    }
    if (searchTerm) {
        queryKeys.push(['posts', searchTerm]);
    }

    useEffect(() => {
        setLiked(selectedPost.likedByUser);
        setLikes(selectedPost.likes);
        const fetchPostDetails = async () => {
            try {
                const token = await auth.currentUser.getIdToken();
                setToken(token);
        
                const postData = await fetchWithError(`${process.env.REACT_APP_API_BASE_URL}/api/posts/${selectedPost._id}`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                setPost(postData);
                setUsername(postData.userRef?.username);
                setProfileURL(postData.userRef?.profileURL);
            } catch (err) {
                console.error('Failed to fetch:', err.message);
            }
        }

        fetchPostDetails();
    }, [selectedPost])

    useEffect(() => {
        let isCancelled = false;
        if (!post) return;
        if (!canvasRef.current) return;
    
        const canvas = new Canvas(canvasRef.current, {
            selection: false,
            hoverCursor: 'pointer'
        });

        fabricCanvasRef.current = canvas;
        canvas.setViewportTransform([zoom, 0, 0, zoom, 0, 0]);
        canvas.calcOffset();

        const handleInitCanvas = async () => {
            try {
                await canvas.loadFromJSON (
                    post.canvasJSON,
                    () => {
                        if (!isCancelled) {
                            canvas.requestRenderAll();
                        }
                    },
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

                console.log()
                fonts.forEach(font => loadGoogleFont(font))
                fetchItemDetails(itemIds);

                document.fonts.ready.then(() => canvas.requestRenderAll());
            } catch (err) {
                console.log('Error:', err);
            }
        }

        const fetchItemDetails = async (itemIds) => {
            try {
                const data = await fetchWithError(`${process.env.REACT_APP_API_BASE_URL}/api/items/get-items`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-type': 'application/json'
                    },
                    body: JSON.stringify({itemIds})
                })

                setItems(data.items);
            } catch (err) {
                console.log('Failed to fetch items:', err);
            }
        }

        handleInitCanvas();

        return () => {
            isCancelled = true;
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
            }
        }

        const easeOutCubic = t => (--t) * t * t + 1;

        const hover = e => {
            if (e.target?.itemId) {
                setHoverItemId(e.target.itemId);
                e.target.hovered = true;
            }
        }

        // const mouseOut = e => {
        //     setHoverItemId(null);
        //     const target = e.target;
        //     if (!target || !target.hovered) return;

        //     target.hovered = false;
        //     target.animate('scaleX', target._originalScaleX, {
        //         duration: 150,
        //         onChange: canvas.renderAll.bind(canvas),
        //         easing: easeOutCubic
        //     });
        //     target.animate('scaleY', target._originalScaleY, {
        //         duration: 150,
        //         onChange: canvas.renderAll.bind(canvas),
        //         easing: easeOutCubic
        //     });
        // };

        canvas.on('mouse:over', hover);
        // canvas.on('mouse:out', mouseOut);
        canvas.on('mouse:down', mouseDown);

        return () => {
            canvas.off('mouse:down', mouseDown);
            // canvas.off('mouse:out', mouseOut);
            canvas.off('mouse:down', mouseDown);
        }
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

    const handleAdd = (tab, itemId) => {
        let add;
        if (tab === 'wishlist') {
            if (addW.includes(itemId)) {
                add = false;
                setAddW(prev => prev.filter(id => id !== itemId))
            } else {
                add = true;
                setAddW(prev => [...prev, itemId])
            }
        } else {
            if (addC.includes(itemId)) {
                add = false;
                setAddC(prev => prev.filter(id => id !== itemId))
            } else {
                add = true;
                setAddC(prev => [...prev, itemId])
            }
        }
        add ? createCopy.mutate({itemRefs: [itemId], tab}) : deleteItem.mutate({itemId, tab});
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
                                        onClick={() => {
                                            setLiked(prev => !prev);
                                            setLikes(prev => liked ? prev - 1 : prev + 1);
                                            mutate({
                                                postId: selectedPost._id, 
                                                liked,
                                                queryKeys
                                            });
                                        }}>
                                            {!liked && <FavoriteBorderIcon/>}
                                            {liked && <FavoriteIcon style={{fill: '#c23b0e'}}/>}
                                            <p>{likes}</p>
                                    </div>
                                    <Tooltip title='Save to board' >
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
                                            <div className='quick-add mini'>
                                                <Tooltip title='Add to wishlist'>
                                                <div className={`toolbar-icon ${addW.includes(item._id) ? 'active' : ''}`}
                                                    onClick={() => handleAdd('wishlist', item._id)}>
                                                    <ShoppingBagIcon/>
                                                    {addW.includes(item._id) && <CheckIcon/>}
                                                </div>
                                                </Tooltip>
                                                <Tooltip title='Add to closet'>
                                                <div className={`toolbar-icon ${addC.includes(item._id) ? 'active' : ''}`}
                                                    onClick={() => handleAdd('closet', item._id)}>
                                                    <img src={BlackShirt}/>
                                                    {addC.includes(item._id) && <CheckIcon/>}
                                                </div>
                                                </Tooltip>
                                                {/* <Tooltip title='Add to rack'>
                                                <div className='toolbar-icon'>
                                                    <AddIcon/>
                                                </div>
                                                </Tooltip> */}
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
                                            {/* <div className='circle' style={{backgroundColor: selectedItem?.colors[0].hex}}/> */}
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
                                            <div className={`toolbar-icon ${addW.includes(selectedItem?._id) ? 'active' : ''}`}
                                                onClick={() => handleAdd('wishlist', selectedItem?._id)}>
                                                <ShoppingBagIcon/>
                                                <p>Add{addW.includes(selectedItem?._id) ? 'ed' : ''} to wishlist {addW.includes(selectedItem?._id) ? '✓' : ''}</p>
                                            </div>
                                            <div className={`toolbar-icon ${addC.includes(selectedItem?._id) ? 'active' : ''}`}
                                                onClick={() => handleAdd('closet', selectedItem?._id)}>
                                                <img src={BlackShirt}/>
                                                <p>Add{addC.includes(selectedItem?._id) ? 'ed' : ''} to closet {addC.includes(selectedItem?._id) ? '✓' : ''}</p>
                                            </div>
                                            {/* <div className='toolbar-icon'>
                                                <AddIcon/>
                                                <p>Add to rack</p>
                                            </div> */}
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