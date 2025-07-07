import './index.scss';
import defaultProfilePic from '../../../assets/images/icons/default-profile-pic.png'
import CloseIcon from '@mui/icons-material/Close';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../../firebase';
import { fetchWithError } from '../../../utils/fetchWithError';

const Follows = ({mode, 
                setShowFollowers,
                setShowFollowing,
                userId,
                isSelf,
                setFollowers,
                setFollowing
            }) => {
    const [userData, setUserData] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = await auth.currentUser.getIdToken();

                const data = await fetchWithError(`${process.env.REACT_APP_API_BASE_URL}/api/follows/${userId}/${mode}`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setUserData(data.map(userData => ({
                    user: mode === 'followers' ? userData.followerRef : userData.followingRef,
                    follow: true
                })));
            } catch (err) {
                console.error('Failed to fetch:', err.message);
            }
        }

        fetchUserData();
    },[])
    
    const handleChange = async (follow, otherUserId) => {
        try {
            if (mode === 'followers') {
                if (!follow) return;
                setUserData(userData.map(data => 
                    data.user._id === userId ? {...data, follow: !data.follow} : data
                ))

                const token = await auth.currentUser.getIdToken();
                await fetchWithError(`${process.env.REACT_APP_API_BASE_URL}/api/follows/${userId}/remove-follower/${otherUserId}`, {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setFollowers(prev => prev -= 1);
                return;
            }
            if (mode === 'following') {
                setUserData(userData.map(data => 
                    data.user._id === otherUserId ? {...data, follow: !data.follow} : data
                ));
                const token = await auth.currentUser.getIdToken();

                if (!follow) {
                    await fetchWithError(`${process.env.REACT_APP_API_BASE_URL}/api/follows/${otherUserId}/create-follow`, {
                        method: 'POST',
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    setFollowing(prev => prev += 1);
                    return;
                } else {
                    await fetchWithError(`${process.env.REACT_APP_API_BASE_URL}/api/follows/${otherUserId}/remove-follow`, {
                        method: 'DELETE',
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    setFollowing(prev => prev -= 1);
                return;
            }}
        } catch (err) {
            console.error('Failed to fetch:', err.message);
        }
    }

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
                        {userData.map(({user, follow}) => (
                            <div className='follow-row' key={user?._id}>
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
                                {isSelf && 
                                    <div className='sub-btn' onClick={() => handleChange(follow, user?._id)}>
                                        {follow && <p>{mode === 'followers' ? 'Remove' : 'Following'}</p>}
                                        {!follow && <p>{mode === 'followers' ? 'Removed ✓' : 'Follow'}</p>}
                                    </div>
                                }
                            </div>  
                        ))}
                    </div>
                    </div>
                </div>
        </div>
    )
}

export default Follows;