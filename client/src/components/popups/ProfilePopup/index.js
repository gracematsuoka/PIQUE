import { getAuth } from 'firebase/auth'
import { useAuth } from "../../../contexts/AuthContext"
import {ReactComponent as LogoutIcon} from '../../../assets/images/icons/logout.svg'
import {ReactComponent as SettingsIcon} from '../../../assets/images/icons/settings.svg'
import {ReactComponent as FaceIcon} from '../../../assets/images/icons/face.svg'
import './index.scss'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'

const ProfilePopup = () => {
    const auth = getAuth();
    const [error, setError] = useState();
    const {mongoUser, logout} = useAuth();
    const navigate = useNavigate();
    const [isPopupVisible, setIsPopupVisible] = useState(false);

    const togglePopup = () => {
        setIsPopupVisible(!isPopupVisible);
    }
    
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
            <p className='popup-name'>{mongoUser?.name || 'Name'}</p>
            <p className='popup-username'>@{mongoUser?.username || 'username'}</p>
            <hr/>
            <div className='sub-btn'>
                <Link to={`/profile/${mongoUser?.username}`}>
                    <FaceIcon/>
                    <p>Profile</p>
                </Link>
            </div>
            <div className='sub-btn'>
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