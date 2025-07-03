import './index.scss';
import { useState } from "react";
import ConfettiExplosion from 'react-confetti-explosion';
import {ReactComponent as CloseIcon} from '../../../assets/images/icons/close.svg';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router-dom';

const Congrats = ({setShowCongrats, setReload}) => {
    const navigate = useNavigate();
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
                        <div className='congrats-icon'>
                            <CheckCircleIcon/>
                        </div>
                        <div className='congrats-title'>
                            <h1>Congrats!</h1>
                            <div className='close' 
                                onClick={() => {
                                    setShowCongrats(false);
                                    setReload(true);
                            }}>
                                <CloseIcon/>
                            </div>
                        </div>
                        <p>Your post is now up</p>
                        <button className='sub-btn bold' onClick={() => navigate('/explore')}>Start exploring</button>
                        <div className='sub-btn' 
                            onClick={() => {
                                setShowCongrats(false);
                                setReload(true);
                        }}>
                            Keep styling
                        </div>
                    </div>
                </div>
        </div>
    )
}

export default Congrats;