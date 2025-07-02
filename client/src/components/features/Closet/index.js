import "./index.scss"
import { useAuth } from "../../../contexts/AuthContext"
import addClothes from "../../../assets/images/icons/addclothes.png"
import SearchBar from "../../reusable/SearchBar"
import AddItem from "../../popups/AddItem"
import ItemDetails from "../../popups/ItemDetails"
import Filter from "../../popups/Filter"
import Items from "../Items"
import { useState, useEffect } from "react"
import {ReactComponent as FilterIcon} from '../../../assets/images/icons/filter.svg'
import Tooltip from "@mui/material/Tooltip";
import { useTag } from "../../hooks/useTag"
import ErrorIcon from '@mui/icons-material/Error';
import { NavLink, useLocation } from "react-router-dom"

const Closet = () => {
    const {mongoUser} = useAuth();
    const [showAddPopup, setShowAddPopup] = useState(false);
    const [tab, setTab] = useState('closet');
    const [tags, setTags] = useState([]);
    const [showFilter, setShowFilter] = useState(false);
    const [colors, setColors] = useState([]);
    const [showItemDetails, setShowItemDetails] = useState(false);
    const [processedUrl, setProcessedUrl] = useState('');
    const [selectedItemId, setSelectedItemId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [filled, setFilled] = useState(0);
    const location = useLocation();

    useEffect(() => {
        location.pathname === '/closet' ? setTab('closet') : setTab('wishlist');
    }, [location])

    const colorMap = {
        'Red': '#F35050',
        'Orange': '#EEA34E',
        'Yellow': '#F5D928',
        'Green': '#91D58C',
        'Blue': '#81AAEA',
        'Purple': '#BE9FE5',
        'Pink': '#F1AFD6',
        'Black': '#000000',
        'Grey': '#868585',
        'White': '#FFFFFF',
        'Beige': '#E9E0B6',
        'Brown': '#A26D2C',
        'Gold': '#D6CE85',
        'Silver': '#E8E5E0',
        'Rose Gold': '#D6AA90'
    }

    const itemArray = ['Tops', 'Bottoms', 'Dresses/Rompers', 'Outerwear', 'Shoes', 'Swimwear', 'Loungewear',
        'Sets', 'Undergarments', 'Jewelry', 'Bags', 'Accessories', 'Other'
    ]

    const {data: dbTags=[]} = useTag();

    useEffect(() => {
        const populateTags = async () => {
            setTags(dbTags.map(tag => ({
                name: tag.name,
                hex: tag.hex,
                key: tag._id,
                checked: false
            })));
        }

        populateTags();
        const colorCheckMap = Object.keys(colorMap)
            .map(color => ({
                    color,
                    hex: colorMap[color],
                    checked: false
                })
        );
        setColors(colorCheckMap)
    }, []) 

    useEffect(() => {
        if(loading && filled < 100) {
            setTimeout(() => setFilled(prev => prev += 10), 50)
        }
    }, [filled, loading])

    const handleError = (err) => {
        setError(err);

        setTimeout(() => {
            setError(null);
        }, 30000);
    }

    const toggleAddPopup = () => {
        setShowAddPopup(!showAddPopup);
    }

    const handleCloseDetails = () => {
        setSelectedItemId(null);
    }

    return (
        <div className="closet">
        {showAddPopup && <AddItem onClose={toggleAddPopup}
                                setShowAddPopup={setShowAddPopup}
                                setShowItemDetails={setShowItemDetails}
                                processedUrl={processedUrl}
                                setProcessedUrl={setProcessedUrl}
                                tab={tab}
                                />}
            <div className="nav-content-wrapper">
                <p className="welcome-header">Welcome to your closet, {mongoUser?.name || 'Name'}</p>
                <div className="basic-nav">
                    <NavLink to='/closet' className={() => `nav ${location.pathname === '/closet' ? 'active' : ''}`}>
                        MY CLOSET
                    </NavLink>
                    <NavLink to='/closet/wishlist' className={({ isActive }) => `nav ${isActive ? 'active' : ''}`}>
                        MY WISHLIST
                    </NavLink>
                </div>
                <div className="search-filter">
                    <SearchBar/>
                    <div className="filter" onClick={e => setShowFilter(!showFilter)}>
                        <p>Filter</p>
                        <FilterIcon/>
                    </div>
                </div>
                <Tooltip title='New item'>
                <div className="add" onClick={toggleAddPopup}>
                    <img src={addClothes}/>
                </div>
                </Tooltip>
                <div className="items-wrapper">
                    <Items 
                        tab={tab}
                        onSelectItem={(item) => {
                            setSelectedItemId(item._id);
                            setShowItemDetails(true);
                        }}
                        handleError={handleError}
                        />
                </div>
                {loading && 
                    <div className="toast">
                        <div className="progress-bar" 
                            style={{width: `${filled}%`}}
                            />
                        <p>Saving item ...</p>
                    </div>
                }
                {error && 
                    <div className="toast error">
                        <ErrorIcon/>
                        <p>Error: {error.message}</p>
                    </div>
                }
                <Filter className={`popup-container filter ${showFilter ? 'open' : ''}`} 
                        setShowFilter={setShowFilter}
                        tags={tags}
                        setTags={setTags}
                        colors={colors}
                        setColors={setColors}
                />
                {showItemDetails && <ItemDetails 
                                        mode='create' 
                                        setShowItemDetails={setShowItemDetails}
                                        processedUrl={processedUrl}
                                        tab={tab}
                                        setLoading={setLoading}
                                        handleError={handleError}
                                        itemArray={itemArray}
                                        colorMap={colorMap}
                                        />}
                {showItemDetails && selectedItemId && 
                                    <ItemDetails 
                                        mode='edit' 
                                        setShowItemDetails={setShowItemDetails}
                                        tab={tab}
                                        selectedItemId={selectedItemId}
                                        setSelectedItemId={setSelectedItemId}
                                        onClose={handleCloseDetails}
                                        setLoading={setLoading}
                                        handleError={handleError}
                                        itemArray={itemArray}
                                        colorMap={colorMap}
                                        />}
            </div>
        </div>
    )
}

export default Closet