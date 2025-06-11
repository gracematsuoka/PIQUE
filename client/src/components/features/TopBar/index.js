import { Link } from "react-router-dom"

const TopBar = () => {
    return (
        <div className="top-bar">
            <Link to='/profile'>Profile</Link>
        </div>
    )
}

export default TopBar