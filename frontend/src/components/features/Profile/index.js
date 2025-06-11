import { useState } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { useNavigate } from "react-router-dom";

const Profile = () => {
    const [error, setError] = useState('');
    const {currentUser, logout} = useAuth();
    const navigate = useNavigate();
    
    async function handleLogout() {
        setError('');

        try {
            await logout();
            navigate('/');
        } catch {
            setError('Failed to log out');
        }
    }

    return (
        <div className="profile">
            <button onClick={handleLogout} className="sub-btn">Log out</button>
        </div>
    )
} 

export default Profile