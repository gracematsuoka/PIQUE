import { useState } from "react"
import { useAuth } from "../../../contexts/AuthContext"
import { useNavigate } from "react-router-dom";
import TopBar from "../TopBar";
import NavBar from "../NavBar";
import './index.scss';
import defaultProfilePic from '../../../assets/images/icons/default-profile-pic.png'

const Profile = () => {
    const {mongoUser} = useAuth();
    let username = (mongoUser?.username || 'Username').toLowerCase();

    return (
        <div className="profile">
            <TopBar/>
            <div className="nav-content">
                <NavBar/>
                <div className="nav-content-wrapper">
                    <div className="profile-header">
                        <div className="profile-pic-wrapper">
                            <img className='profile-pic' src={mongoUser?.profileURL || defaultProfilePic}/>
                        </div>
                        <div className="profile-text">
                            <p className='popup-name'>{mongoUser?.name || 'Name'}</p>
                            <p className='popup-username'>@{username}</p>
                            <div className='follow'>
                                <p><b>10</b> followers</p>
                                <p><b>10</b> following</p>
                            </div>
                        </div>
                    </div>
                    <hr/>
                    <div className="post-drafts">
                        <div className="basic-nav">
                            <p>POSTS</p>
                            <p>DRAFTS</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
} 

export default Profile