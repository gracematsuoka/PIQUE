import './index.scss'
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { auth } from '../../../firebase';
import { useAuth } from '../../../contexts/AuthContext';
import UploadProfilePic from '../../reusable/UploadProfilePic';
import WarningPopup from '../../popups/WarningPopup';
import { fetchWithError } from '../../../utils/fetchWithError';
import {ReactComponent as Check} from '../../../assets/images/icons/check.svg';
import { Bouncy } from 'ldrs/react';
import Tooltip from '@mui/material/Tooltip';
import FeedbackIcon from '@mui/icons-material/Feedback';

const AccountSetup = ({ mode }) => {
    const isSetup = mode === 'setup';
    const {mongoUser, resetPassword, loading: authLoading, refreshMongoUser} = useAuth();
    const email = mongoUser?.email || '';
    const [loading, setLoading] = useState('');
    const [message, setMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [error, setError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [usernameValid, setUsernameValid] = useState('');
    const [name, setName] = useState(mongoUser?.name || '');
    const [username, setUsername] = useState(mongoUser?.username || '');
    const [pref, setPref] = useState(mongoUser?.pref || '')
    const [isWarningVisible, setIsWarningVisible] = useState(false);
    const styleArray = ['Women', 'Men', 'Unisex']
    const navigate = useNavigate();

    if (authLoading || !mongoUser) {
        return (
            <Bouncy
                size="45"
                speed="1.75"
                color="#6B799F"
            />
        )
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name || !username) {
            setError('Please fill in all fields');
            return;
        }
        
        if (usernameValid.includes('☓')) {
            setError('Please choose another username');
            return;
        }
        try {
            const token = await auth.currentUser.getIdToken();
            await fetchWithError(`${process.env.REACT_APP_API_BASE_URL}/api/users/update-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({name, username, pref})
            });
        } catch (err) {
            console.error('Failed to fetch:', err.message);
        }

        await refreshMongoUser();

        if (isSetup) {
            navigate('/'); 
        } else {
            setUsernameValid('');
            setSuccessMessage('Information Saved ✓');
        }
        
    }

    const validateUsername = async (username) => {
        try {
            const token = await auth.currentUser.getIdToken();

            const data = await fetchWithError(`${process.env.REACT_APP_API_BASE_URL}/api/users/check-username`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({username}),
            });

            if (!data.exists || username == mongoUser.username) {
                setUsernameValid('✓ Username is available');
                setError('');
            } else {
                setUsernameValid('☓ Username already exists');
                setError('');
            }
        } catch (err) {
            console.error('Error checking username:', err);
            setError('An error occurred trying to validate username');
        }
    }

    const handleResetPassword = async (e) => {
        e.preventDefault();
        
        try {
            setMessage('');
            setPasswordError('');
            setLoading(true);
            await resetPassword(email);
            setMessage('✓ Check your inbox for further instructions')
        } catch {
            setPasswordError('Failed to reset password')
        }

        setLoading(false);
    }

    const toggleIsWarningVisible = () => {
        setIsWarningVisible(!isWarningVisible);
    }

    const handleShowPortal = async () => {
        const token = await auth.currentUser.getIdToken();
        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/plus/create-customer-portal-session`, {
            method: "POST",
            credentials: 'include',
            headers: { 
                Authorization: `Bearer ${token}`
            }
        });
        
        const { url } = await res.json();
        window.location.href = url;
    };      

    return (
        <div className="account-setup">
            {isSetup && (
                <>
                    <div className='logo'>PIQUE</div>
                </>
            )}
            <div className={isSetup ? 'auth-content' : ''}>
                {isSetup && (
                    <>
                        <div className='bg-text-large'>PIQUE</div>  
                    </>
                )}
                <div className='auth-title'>
                            <h1>{isSetup ? "Let's get you set up!" : "Settings"}</h1>
                        </div>
                <div className='auth-fields'>
                    <form onSubmit={handleSubmit}>
                        <UploadProfilePic/>
                        {/* {mongoUser?.plus &&
                            <Tooltip title='View Subscription Details'>
                            <p className='plus-msg' onClick={handleShowPortal}>You have PIQUE Plus ✦</p>
                            </Tooltip>
                        } */}
                        {error && <p className='error'>{error}</p>}
                        <div className='auth-field'>
                            <label htmlFor='name'>Name</label>
                            <input type='text' id='name' name='name' placeholder='Enter your name' 
                                value={name}
                                onChange={e => {
                                    setName(e.target.value)
                                    setSuccessMessage('');
                                }}
                            />
                        </div>
                        <div className='auth-field'>
                            <label htmlFor='username'>Username</label>
                            <input type='text' id='username' name='username' placeholder='Enter a username' 
                                value={username}
                                onChange={e => {
                                    setUsername(e.target.value);
                                    validateUsername(e.target.value);
                                    setSuccessMessage('');
                                }}
                            />
                            {usernameValid && username && <p className={`live-validate ${
                                usernameValid.includes('☓') ? 'invalid' : 'valid'
                                }`}>
                                {usernameValid}
                            </p>
                            }
                        </div>
                        <div className='auth-field'>
                            <p className='pref'>Clothing Preference <i>(Optional)</i></p>
                            <div className='filter-choices'>
                                {styleArray.map(style => 
                                    <div className='tag' 
                                        key={style} 
                                        style={{backgroundColor: 'rgba(128, 128, 128, 0.114)', outline: pref === style ? '1px solid black' : ''}} 
                                        onClick={e => setPref(prev => prev !== style ? style : '')}> 
                                        <div className='circle-check' style={{backgroundColor: pref === style ? 'black' : ''}}>
                                            {pref === style ? <Check/> : null}
                                        </div> 
                                        <p>{style}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <button className='submit' type='submit'>{isSetup ? 'Continue' : 'Save'}</button>
                        {successMessage && <p className='success'>{successMessage}</p>}
                        {!isSetup && (
                            <>
                                <div className='sub-btn' onClick={handleResetPassword}>
                                    <p>Reset Password</p>
                                </div>
                                {message && <p className='success'>{message}</p>}
                                {passwordError && <p className='error'>{passwordError}</p>}
                                <div className='sub-btn alert' onClick={toggleIsWarningVisible}>
                                    Delete Account
                                </div>
                                <div className='feedback'>
                                    <div style={{display: 'flex', gap: '5px'}}>
                                        <FeedbackIcon/>
                                        <p>Have feedback?</p>
                                    </div>
                                    <p>Send an email to <b>pique.fashion.app@gmail.com</b> and we'll get back to you shortly.</p>
                                </div>
                            </>
                        )}
                    </form>
                </div>
            </div>
            {isWarningVisible && <WarningPopup onClose={toggleIsWarningVisible}/>}
        </div>
    )
}

export default AccountSetup;