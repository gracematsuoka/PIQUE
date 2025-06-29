import './index.scss'
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { auth } from '../../../firebase';
import { useAuth } from '../../../contexts/AuthContext';
import UploadProfilePic from '../../image-upload/UploadProfilePic/UploadProfilePic';
import WarningPopup from '../../popups/WarningPopup';

const AccountSetup = ({ mode }) => {
    const isSetup = mode === 'setup';
    const user = auth.currentUser;
    const {mongoUser, resetPassword} = useAuth();
    const email = mongoUser?.email || '';
    const [loading, setLoading] = useState('');
    const [message, setMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [error, setError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [usernameValid, setUsernameValid] = useState('');
    const [name, setName] = useState(mongoUser?.name || '');
    const [username, setUsername] = useState(mongoUser?.username || '');
    const [isWarningVisible, setIsWarningVisible] = useState(false);
    
    const navigate = useNavigate();

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

        await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/users/update-user`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${await auth.currentUser.getIdToken(true)}`
            },
            body: JSON.stringify({name, username})
        })

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

            const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/users/check-username`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({username}),
            })

            const data = await res.json();

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