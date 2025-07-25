import './index.scss'
import { Link } from 'react-router-dom'
import GoogleIcon from '../../../assets/images/icons/googleicon.png'
import { useAuth } from '../../../contexts/AuthContext'
import { useEffect, useState } from 'react'
import { auth } from '../../../firebase';
import {getAuth} from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { fetchWithError } from '../../../utils/fetchWithError'

const Auth = ({ mode }) => {
    const isLogin = mode === 'login';
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup, login, googleLogin, firebaseUser, mongoUser, loading: authLoading } = useAuth();


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!password || !email) {
            setError('Please fill in all fields');
            return;
        }

        if (!isLogin && password.length < 8) {
            setError('Password needs to be at least 8 characters');
            return;
        }
        
        try {
            setError('');
            setLoading(true);

            if (isLogin) {
                await login(email, password);
            } else {
                await signup(email, password);
                
                if (!auth.currentUser) {
                    console.error('auth.currentUser is null');
                    return;
                }
                const token = await auth.currentUser.getIdToken(true);

                await fetchWithError(`${process.env.REACT_APP_API_BASE_URL}/api/users/create-user`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                });
            }
        } catch (err) {
            console.error('Error:', err.message)
            setError('Failed to create an account');
        }

        setLoading(false);
    }

    const handleGoogleSignIn = async () => {
        try {
            await googleLogin();
        } catch (e){
            console.error('Google sign in failed: ', e.message)
            setError('Failed to sign in with Google')
        }
    }

    return (
        <div className="auth">
            <div className='logo'><Link to='/'>PIQUE</Link></div>
            <div className='auth-content'>
                <div className='bg-text-large'>PIQUE</div>
                <div className='auth-title'>
                    <h1>{isLogin ? 'Welcome back to ' : 'Get started with '}<span>PIQUE</span></h1>
                    <sub>{isLogin ? 'Log in to your account' : 'Create your account'}</sub>    
                </div>
                <div className='auth-fields'>
                    <form onSubmit={handleSubmit}>
                        {error && <p className='error'>{error}</p>}
                        <div className='auth-field'>
                            <label htmlFor='email'>Email</label>
                            <input type='text' name='email' placeholder='Enter your email' 
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>
                        <div className='auth-field'>
                            <label htmlFor='password'>Password</label>
                            <input type='password' name='password' placeholder={isLogin ? 'Enter your password' : 'Create a password'}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                            {isLogin && (
                                <>
                                    <Link className='small-text' to='/forgot-password' id='forgot-password'>Forgot your password?</Link>
                                </>
                            )}
                        </div>
                        <button className='submit' disabled={loading} type='submit'>{isLogin ? 'Log in' : 'Sign up'}</button>
                    </form>
                    <p className='or-p'><b>OR</b></p>
                    <button className='auth-container' onClick={handleGoogleSignIn}>
                        <img src={GoogleIcon}></img>
                        {isLogin ? 'Sign in with Google' : 'Continue with Google'}
                    </button>
                    <div className='bottom-link'>
                        <p className='small-text'>{isLogin ? "Don't have an account?" : "Already have an account?"}</p>
                        <Link className='small-text' to={isLogin ? '/sign-up' : '/log-in'}>{isLogin ? 'Sign up' : 'Log in'}</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Auth