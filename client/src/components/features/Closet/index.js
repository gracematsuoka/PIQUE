import NavBar from "../NavBar"
import TopBar from "../TopBar"
import "./index.scss"
import { useAuth } from "../../../AuthContext"
import addClothes from "../../../assets/images/icons/addclothes.png"
import SearchBar from "../../reusable/SearchBar"
import AddItem from "../../popups/AddItem"
import ItemDetails from "../../popups/ItemDetails"
import Filter from "../../popups/Filter"
import { useState, useEffect } from "react"
import { getAuth } from 'firebase/auth'
import {ReactComponent as FilterIcon} from '../../../assets/images/icons/filter.svg'

const Closet = () => {
    const {mongoUser} = useAuth();
    const [showAddPopup, setShowAddPopup] = useState(false);
    const [tab, setTab] = useState('closet');
    const [showFilter, setShowFilter] = useState(false);
    const [tags, setTags] = useState([]);
    const [colors, setColors] = useState([]);
    const [showItemDetails, setShowItemDetails] = useState(false);
    const [processedUrl, setProcessedUrl] = useState('');

    const colorOptions = {
        Red: '#F35050',
        Orange: '#EEA34E',
        Yellow: '#F5D928',
        Green: '#91D58C',
        Blue: '#81AAEA',
        Purple: '#BE9FE5',
        Pink: '#F1AFD6',
        Black: '#000000',
        White: '#FFFFFF',
        Grey: '#868585',
        Beige: '#E9E0B6',
        Brown: '#A26D2C',
    }

    const populateTags = async () => {
        console.log('ran')
        const auth = getAuth();
        const token = await auth.currentUser.getIdToken();

        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/users/get-tags`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        const data = await res.json();
        setTags(data.tags.map(tag => ({
            name: tag.name,
            hex: tag.hex,
            key: tag.key,
            checked: false
        })));
    }

    useEffect(() => {
        populateTags();

        setColors(Object.entries(colorOptions).map(([color, hex]) => ({
            color: color,
            hex: hex,
            checked: false
        })))
    }, [])

    const toggleAddPopup = () => {
        setShowAddPopup(!showAddPopup);
    }

    const filterProps = {
        setShowFilter,
        colors,
        setColors,
        tags,
        setTags
    }

    const popupProps = {
        setShowAddPopup,
        setShowItemDetails,
        processedUrl,
        setProcessedUrl
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
                            <p>OUTERWEAR</p>
                            <p>SHOES</p>
                            <p>JEWELRY</p>
                            <p>BAGS</p>
                            <p>ACCESSORIES</p>
                        </div>
                        <div className="filter" onClick={e => setShowFilter(!showFilter)}>
                            <p>Filter</p>
                            <FilterIcon/>
                        </div>
                    </div>
                    {showAddPopup && <AddItem onClose={toggleAddPopup} props={popupProps}/>}
                    {showFilter && <Filter {...filterProps}/>}
                    {showItemDetails && <ItemDetails props={popupProps}/>}
                </div>
            </div>
            
        </div>
    )
}

export default Closet