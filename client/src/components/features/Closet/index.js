import NavBar from "../NavBar"
import TopBar from "../TopBar"
import "./index.scss"
import { useAuth } from "../../../AuthContext"
import addClothes from "../../../assets/images/icons/addclothes.png"
import SearchBar from "../../reusable/SearchBar"
import AddItem from "../../popups/AddItem"
import ItemDetails from "../../popups/ItemDetails"
import { useState } from "react"
import {ReactComponent as Filter} from '../../../assets/images/icons/filter.svg'

const Closet = () => {
    const {mongoUser} = useAuth();
    const [showAddPopup, setShowAddPopup] = useState(false);
    const [tab, setTab] = useState('closet');

    const toggleAddPopup = () => {
        setShowAddPopup(!showAddPopup);
    }

    return (
        <div className="closet">
            <TopBar/>
            <div className="nav-content">
                <NavBar/>
                <div className="nav-content-wrapper">
                    <p className="welcome-header">Welcome to your closet, {mongoUser?.name || 'Name'}</p>
                    <div className="basic-nav">
                        <p className={tab === 'closet' ? 'active' : ''}>MY CLOSET</p>
                        <p className={tab === 'wishlist' ? 'active' : ''}>MY WISHLIST</p>
                        <p className={tab === 'collections' ? 'active' : ''}>COLLECTIONS</p>
                    </div>
                    <SearchBar/>
                    <div className="add" onClick={toggleAddPopup}>
                        <img src={addClothes}/>
                    </div>
                    <div className="nav-filter-wrapper">
                        <div className="basic-nav sub">
                            <p>ALL</p>
                            <p>TOPS</p>
                            <p>BOTTOMS</p>
                            {/* <p>OUTERWEAR</p> */}
                            <p>SHOES</p>
                            <p>JEWELRY</p>
                            <p>BAGS</p>
                            <p>ACCESSORIES</p>
                        </div>
                        <div className="filter">
                            <p>Filter</p>
                            <Filter/>
                        </div>
                    </div>
                    {showAddPopup && <AddItem onClose={toggleAddPopup}/>}
                    <ItemDetails/>
                </div>
            </div>
            
        </div>
    )
}

export default Closet