import './index.scss';
import { useAuth } from '../../../contexts/AuthContext';
import defaultProfilePic from '../../../assets/images/icons/default-profile-pic.png'
import {ReactComponent as CloseIcon} from '../../../assets/images/icons/close.svg'
import outfit from '../../../assets/images/home/testoutfit.jpg';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useState } from 'react';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import BlackShirt from '../../../assets/images/icons/hangshirt-black.png'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import Tooltip from '@mui/material/Tooltip';

const PostDetails = ({
    like,
    setLike,
    setShowDetails
}) => {
    const {mongoUser} = useAuth();

    return (
        <div className='post-details'>
        <div className="popup-overlay"></div>
                <div className="popup-container overlay">
                    <div className='popup-content'>
                        <div className='post-header'>
                            <img src={mongoUser?.profileURL || defaultProfilePic}/>
                            <p>CHIC STREET WEAR</p>
                            <div className='close'>
                                <CloseIcon/>
                            </div>
                        </div>
                        <hr/>
                        <div className='post-content'>
                            <img className='outfit' src={outfit}/>
                            <div className='post-details'>
                                <div className='save-bar'>
                                    <div className='toolbar-icon like' onClick={() => setLike(prev => !prev)}>
                                        {!like && <FavoriteBorderIcon/>}
                                        {like && <FavoriteIcon style={{fill: 'red'}}/>}
                                        <p>50</p>
                                    </div>
                                    <Tooltip title='Save to board'>
                                    <div className='save-btn'>
                                        <p>+ SAVE</p>
                                    </div>
                                    </Tooltip>
                                </div>
                                <p className='description'>Street wear on the street yuh its super cool yuhhhh whoop whoop</p>
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