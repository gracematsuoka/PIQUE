import './index.scss'
import {ReactComponent as CloseIcon} from '../../../assets/images/icons/close.svg'
import { auth } from '../../../firebase';
import {useNavigate} from 'react-router-dom'

const WarningPopup = ({ onClose }) => {
    const navigate = useNavigate();

    const handleDeleteUser = async () => {
        try {
            await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/users/delete-account`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${await auth.currentUser.getIdToken(true)}`
                },
            })
            
            navigate('/');
        } catch (err) {
            console.log('Failed to delete account:', err);
        }
    }

    return (
        <>
            <div className="popup-overlay"></div>
            <div className="popup-container overlay">
                <div className='x' onClick={onClose}>
                    <CloseIcon/>
                </div>
                <div className='popup-content'>
                    <p className='popup-name'>🚨 Warning</p>
                    <p>Your account will be permanantly deleted, this action is <b>irreversible</b></p>
                    <div className='sub-btn' onClick={handleDeleteUser}>Delete Account</div>
                    <button className='submit' onClick={onClose}>Cancel</button>
                </div>
            </div>
        </>
    )
}

export default WarningPopup