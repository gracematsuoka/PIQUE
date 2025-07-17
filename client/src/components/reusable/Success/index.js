import './index.scss';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

const Success = () => {
    const navigate = useNavigate();
    const {refreshMongoUser} = useAuth();

    useEffect(() => {
        AOS.init({duration: 1500});
    }, []);
    
    return (
        <div className='success-pg'>
            <div className="plus-success" data-aos='zoom-in'>
                <p data-aos='zoom-in'>✦</p>
            </div>
            <h1>Success!</h1>
            <p>You are now a part of PIQUE Plus +</p>
            <button className="basic-btn" onClick={() => navigate('/style')}>Start getting styled</button>
        </div>
    )
}

export default Success;