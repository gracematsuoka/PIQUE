import './index.scss'

const Auth = ({ mode }) => {
    const isLogin = mode === 'login';

    return (
        <div className="Auth">
            <div className='logo'>PIQUE</div>
            <div className='auth-content'>
                <div className='auth-title'>
                    <h1>{isLogin ? 'Welcome back to PIQUE' : 'Get started with PIQUE'}</h1>
                    <sub>{isLogin ? 'Log in to your account' : 'Create your account'}</sub>    
                </div>
                <div className='auth-fields'>
                    
                </div>
            </div>
        </div>
    )
}

export default Auth