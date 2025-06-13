import { Link } from "react-router-dom"
import Explore from "../Explore"
import "./index.scss"
import { useAuth } from "../../../AuthContext"
import defaultProfilePic from '../../../assets/images/icons/default-profile-pic.png'
import ProfilePopup from "../../popups/ProfilePopup"
import { useState } from "react"

const TopBar = () => {
    const {mongoUser} = useAuth();
    const [isPopupVisible, setIsPopupVisible] = useState(false);

    const togglePopup = () => {
        setIsPopupVisible(!isPopupVisible);
    }

    return (
        <div className="top-bar">
            <div className="logo"><Link to={Explore}>PIQUE</Link></div>   
            <div className="profile-wrapper">
                <img 
                    className='profile-pic' 
                    src={mongoUser?.profileURL || defaultProfilePic}
                    onClick={togglePopup}
                />
                {isPopupVisible && (
                    <ProfilePopup/>
                )}
            </div>
        </div>
    )
}

export default TopBar