import './index.scss';
import { useState } from "react";
import ConfettiExplosion from 'react-confetti-explosion';
import {ReactComponent as CloseIcon} from '../../../assets/images/icons/close.svg';

const Congrats = ({setShowCongrats, setReload}) => {
    const [isExploding, setIsExploding] = useState(true);

    return (
        <div className='congrats'>
            <div className="popup-overlay"></div>
                <div className="popup-container overlay">
                {isExploding && 
                    <ConfettiExplosion 
                        colors={['#BBD6DB', '#E0F2F4', '#DDDD7B', '#FFE697', '#F791A9', '#FFDADF']}
                />}
                    <div className='popup-content'>
                        <div className='congrats-title'>
                            <h1>Congrats! 💃</h1>
                            <div className='close' 
                                onClick={() => {
                                    setShowCongrats(false);
                                    setReload(true);
                            }}>
                                <CloseIcon/>
                            </div>
                        </div>
                        <p>Your post is now up</p>
                        <div className='btn-wrap'>
                            <button className='sub-btn post'>VIEW POST</button>
                            <button className='sub-btn' 
                                onClick={() => {
                                    setShowCongrats(false);
                                    setReload(true);
                            }}>
                                KEEP STYLING
                            </button>
                        </div>
                    </div>
                </div>
        </div>
    )
}

export default Congrats;