import { useState, useEffect } from "react"
import { useAuth } from "../../../contexts/AuthContext"
import { useNavigate, useParams } from "react-router-dom";
import './index.scss';
import { auth } from '../../../firebase';
import Follows from "../../popups/Follows";
import defaultProfilePic from '../../../assets/images/icons/default-profile-pic.png';
import Posts from "../../reusable/Posts";
import { fetchWithError } from "../../../utils/fetchWithError";

const Profile = () => {
    const {mongoUser} = useAuth();
    const {username} = useParams();
    const [userData, setUserData] = useState(null);
    const [showFollowers, setShowFollowers] = useState(false);
    const [showFollowing, setShowFollowing] = useState(false);
    const [followers, setFollowers] = useState(0);
    const [following, setFollowing] = useState(0);
    const [loading, setLoading] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false)

    const isSelf = username === mongoUser?.username; 

    useEffect(() => {
        const handleFetchUser = async () => {
            setLoading(true);
            try {
                const data = await fetchWithError(`${process.env.REACT_APP_API_BASE_URL}/api/users/${username}/get-user`);           

                setUserData(data);
                setFollowers(data.followers);
                setFollowing(data.following);
            } catch (err) {
                console.log('Failed to fetch user data:', err);
            } finally {
                setLoading(false);
            }
        }

        handleFetchUser();
    }, [username])

    useEffect(() => {
        if (!userData) return; 
        const checkFollowing = async () => {
            try {
                const token = await auth.currentUser.getIdToken();
                const data = await fetchWithError(`${process.env.REACT_APP_API_BASE_URL}/api/follows/${userData._id}/is-following`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setIsFollowing(data.follow);
            } catch (err) {
                console.log('Failed to verify following status:', err);
            }
        }

        checkFollowing();
    }, [userData])

    const handleFollow = async () => {
        setIsFollowing(prev => !prev);
        try {
            const token = await auth.currentUser.getIdToken();
            if (!isFollowing) {
                await fetchWithError(`${process.env.REACT_APP_API_BASE_URL}/api/follows/${userData._id}/create-follow`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setFollowers(prev => prev += 1);
            } else {
                await fetchWithError(`${process.env.REACT_APP_API_BASE_URL}/api/follows/${userData._id}/remove-follow`, {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setFollowers(prev => prev -= 1);
            }
        } catch (err) {
            console.error('Failed to fetch:', err.message);
        }
    }

    if (!loading && !userData) return 'Unable to fetch user data'

    return (
        <div className="profile">
            <div className="nav-content-wrapper">
                <div className="profile-header">
                    <div className="profile-pic-wrapper">
                        <img className='profile-pic' src={userData?.profileURL || defaultProfilePic}/>
                    </div>
                    <div className="profile-text">
                        <div className="profile-name">
                            <p className='popup-name'>{userData?.name}</p>
                            <p className="spark">{userData?.plus ? '✦' : ''}</p>
                        </div>
                        <p className='popup-username'>@{userData?.username}</p>
                        <div className='follow'>
                            <div className="sub-btn" onClick={() => setShowFollowers(true)}>
                                <p><b>{followers}</b> followers</p>
                            </div>
                            <div className="sub-btn" onClick={() => setShowFollowing(true)}>
                                <p><b>{following}</b> following</p>
                            </div>
                        </div>
                        {!isSelf &&
                            <div className="sub-btn follow" onClick={handleFollow}>
                                {isFollowing ? 'Following ✓' : 'Follow'}
                            </div>
                        }
                    </div>
                </div>
                <hr/>
                <div className="post-drafts">
                    <div className="basic-nav">
                        <p>POSTS</p>
                    </div>
                    <Posts
                        mode='profile'
                        userId={userData?._id}
                        isSelf={isSelf}
                    />
                </div>

                {showFollowers && 
                    <Follows mode='followers'
                            setShowFollowers={setShowFollowers}
                            setFollowers={setFollowers}
                            isSelf={isSelf}
                            userId={userData?._id}
                    />}
                {showFollowing && 
                    <Follows mode='following'
                            setShowFollowing={setShowFollowing}
                            setFollowing={setFollowing}
                            isSelf={isSelf}
                            userId={userData?._id}
                    />}
            </div>
        </div>
    )
} 

export default Profile