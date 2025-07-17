import { auth } from '../../../firebase';
import { useAuth } from "../../../contexts/AuthContext"
import {ReactComponent as LogoutIcon} from '../../../assets/images/icons/logout.svg'
import {ReactComponent as SettingsIcon} from '../../../assets/images/icons/settings.svg'
import {ReactComponent as FaceIcon} from '../../../assets/images/icons/face.svg'
import './index.scss'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'

const ProfilePopup = ({setIsPopupVisible}) => {
    const [error, setError] = useState();
    const {mongoUser, logout} = useAuth();
    const navigate = useNavigate();
    
    async function handleLogout() {
        setError('');

        try {
            await logout();
            navigate('/');
        } catch {
            setError('Failed to log out');
        }
    }
    
    return (
        <div className="popup-container profile">
            <div className='profile-name'>
                <p className='popup-name'>{mongoUser?.name || 'Name'}</p>
                <p className="spark">{mongoUser?.plus ? '✦' : ''}</p>
            </div>
            <p className='popup-username'>@{mongoUser?.username || 'username'}</p>
            <hr/>
            <div className='sub-btn' onClick={() => setIsPopupVisible(false)}>
                <Link to={`/profile/${mongoUser?.username}`}>
                    <FaceIcon/>
                    <p>Profile</p>
                </Link>
            </div>
            <div className='sub-btn' onClick={() => setIsPopupVisible(false)}>
                <Link to='/settings'>
                    <SettingsIcon/>
                    Settings
                </Link>
            </div>
            <div className='sub-btn' onClick={handleLogout}>
                <LogoutIcon/>
                Log out
            </div>
        </div>
    )
}

export default ProfilePopup