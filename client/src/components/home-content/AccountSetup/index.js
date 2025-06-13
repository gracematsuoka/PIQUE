import './index.scss'
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import defaultProfilePic from '../../../assets/images/icons/default-profile-pic.png'
import { getAuth } from "firebase/auth"

const AccountSetup = () => {
    const auth = getAuth();
    const user = auth.currentUser;
    const [error, setError] = useState('');
    const [usernameValid, setUsernameValid] = useState('');
    const [name, setName] = useState(user?.displayName || '');
    const [username, setUsername] = useState('');
    const [profileURL, setProfileURL] = useState(user?.photoURL || defaultProfilePic)
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

        navigate('/explore'); 
    }

    const validateUsername = async (username) => {
        try {
            const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/users/check-username`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({username}),
            })

            const data = await res.json();

            if (data.exists) {
                setUsernameValid('☓ Username already exists');
            } else {
                setUsernameValid('✓ Username is available');
            }
        } catch (err) {
            console.error('Error checking username:', error);
            setError('An error occurred trying to validate username');
        }
    }

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append("file", file);

        await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/users/upload-profile-pic`, {
            method: "POST",
            body: formData,
            credentials: "include"
        });
    }

    return (
        <div className="account-setup">
            <div className='logo'><Link to='/'>PIQUE</Link></div>
            <div className='auth-content'>
                <div className='bg-text-large'>PIQUE</div>
                <div className='auth-title'>
                    <h1>Let's get you set up!</h1>
                </div>
                <div className='auth-fields'>
                    <form onSubmit={handleSubmit}>
                        <div className='profile-pic' onClick={() => document.getElementById('profileFile').click()}>
                            <div className='edit-pic-icon'>
                                <img className='profile-pic' 
                                    src={profileURL}
                                    // onChange={e => setProfileURL(e.target.value)}
                                />
                                <svg className='edit-icon' xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000" ><path d="M120-120v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm584-528 56-56-56-56-56 56 56 56Z"/></svg>
                            </div>
                        </div>
                        <input type='file' id='profileFile' style={{ display: 'none' }} onClick={e => handleUpload(e)}/>
                        {error && <p className='error'>{error}</p>}
                        <div className='auth-field'>
                            <label htmlFor='name'>Name</label>
                            <input type='text' id='name' name='name' placeholder='Enter your name' 
                                value={name}
                                onChange={e => setName(e.target.value)}
                            />
                        </div>
                        <div className='auth-field'>
                            <label htmlFor='username'>Username</label>
                            <input type='text' id='username' name='username' placeholder='Enter a username' 
                                value={username}
                                onChange={e => {
                                    setUsername(e.target.value);
                                    validateUsername(e.target.value);
                                }}
                            />
                            {usernameValid && <p className={`live-validate ${
                                usernameValid.includes('☓') ? 'invalid' : 'valid'
                             }`}>
                                {usernameValid}
                            </p>
                            }
                        </div>
                        <button className='submit' type='submit'>Continue</button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default AccountSetup;