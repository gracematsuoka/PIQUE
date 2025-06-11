import './index.scss'
import { Link, useNavigate } from 'react-router-dom';

const AccountSetup = () => {
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        navigate('/explore'); // CHANGE
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
                        {/* {error && <p className='error'>{error}</p>} */}
                        <div className='auth-field'>
                            <label htmlFor='name'>Name</label>
                            <input type='text' name='name' placeholder='Enter your name' 
                                // value={email}
                                // onChange={e => setEmail(e.target.value)}
                            />
                        </div>
                        <button className='submit' type='submit'>Continue</button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default AccountSetup;