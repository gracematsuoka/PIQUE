import './index.scss'
import { Link } from "react-router-dom"
import { useState } from "react"
import { useAuth } from '../../contexts/AuthContext'

const ForgotPassword = () => {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const { resetPassword } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            setMessage('');
            setError('');
            setLoading(true);
            await resetPassword(email);
            setMessage('✓ Check your inbox for further instructions')
        } catch {
            setError('Failed to reset password')
        }

        setLoading(false);
    }

    return (
        <div className="forgot-password">
            <div className='logo'><Link to='/'>PIQUE</Link></div>
            <div className='auth-content'>
                <div className='bg-text-large'>PIQUE</div>
                <div className='auth-title'>
                    <h1>Password Reset</h1>
                    {/* <sub>{isLogin ? 'Log in to your account' : 'Create your account'}</sub>     */}
                </div>
                <div className='auth-fields'>
                    <form onSubmit={handleSubmit}>
                        {error && <p className='error'>{error}</p>}
                        {message && <p className='success'>{message}</p>}
                        <div className='auth-field'>
                            <label htmlFor='email'>Email</label>
                            <input type='text' name='email' placeholder='Enter your email' 
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>
                        <button className='submit' disabled={loading} type='submit'>Reset Password</button>
                    </form>
                    <div className='bottom-links'>
                        <div className='bottom-link'>
                            <p className='small-text'>Need an account?</p>
                            <Link className='small-text' to='/sign-up'>Sign up</Link>
                        </div>
                        <div className='bottom-link'>
                            <p className='small-text'>Already know your password?</p>
                            <Link className='small-text' to='/sign-up'>Log in</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ForgotPassword