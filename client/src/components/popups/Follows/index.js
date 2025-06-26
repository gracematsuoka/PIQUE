import './index.scss';
import defaultProfilePic from '../../../assets/images/icons/default-profile-pic.png'
import CloseIcon from '@mui/icons-material/Close';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Follows = ({mode, 
                followers, 
                following,
                setShowFollowers,
                setShowFollowing
            }) => {
    const userIds = mode === 'followers' ? followers : following;
    const [userData, setUserData] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/users/get-users`, {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({userIds})
            })

            const data = await res.json();
            setUserData(data.users);
        }

        fetchUserData();
    },[])
    

    return (
        <div className='follows-wrap'>
        <div className="popup-overlay"></div>
                <div className="popup-container overlay">
                    <div className='popup-content'>
                    <h1>{mode === 'followers' ? 'Followers' : 'Following'}</h1>
                    <div className='close-btn' onClick={() => mode === 'followers' ? setShowFollowers(false) : setShowFollowing(false)}>
                        <CloseIcon/>
                    </div>
                    <hr/>
                    <div className='follows-list'>
                        {userData.map(user => 
                            <div className='follow-row' key={user._id}>
                                <div className='user-info' 
                                    onClick={() => {
                                                mode === 'followers' ? setShowFollowers(false) : setShowFollowing(false);
                                                navigate(`/profile/${user?.username}`);
                                                }}>
                                    <img src={user?.profileURL || defaultProfilePic}/>
                                    <div className='user-names'>
                                        <h3>{user?.name}</h3>
                                        <p>@{user?.username}</p>
                                    </div>
                                </div>
                                <div className='sub-btn'>
                                    <p>{mode === 'followers' ? 'Remove' : 'Following'}</p>
                                </div>
                            </div>  
                        )}
                    </div>
                    </div>
                </div>
        </div>
    )
}

export default Follows;