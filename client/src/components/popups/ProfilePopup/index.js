import { getAuth } from 'firebase/auth'
import { useAuth } from "../../../AuthContext"
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
    let username = (mongoUser?.username || 'Username').toLowerCase();
   
    
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
        <div className="profile-popup">
            <p className='popup-name'>{mongoUser?.name || 'Name'}</p>
            <p className='popup-username'>@{username}</p>
            <div className='follow'>
                <p><b>10</b> followers</p>
                <p><b>10</b> following</p>
            </div>
            <hr/>
            <div className='sub-btn'>
                <Link to='/profile'>
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