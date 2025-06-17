import './index.scss'
import {ReactComponent as CloseIcon} from '../../../assets/images/icons/close.svg'
import {ReactComponent as Edit} from '../../../assets/images/icons/edit.svg'
import {ReactComponent as Add} from '../../../assets/images/icons/add.svg'
import {ReactComponent as Remove} from '../../../assets/images/icons/remove.svg'
import blueTank from '../../../assets/images/home/bluetank.png'
import AddTag from '../AddTag'
import { useState, useEffect, useRef } from 'react'
import { getAuth } from 'firebase/auth'

const ItemDetails = ({ onClose }) => {
    const [name, setName] = useState('Tank');
    const [category, setCategory] = useState('tops');
    const [brand, setBrand] = useState('Old Navy');
    const [price, setPrice] = useState(20);
    const [link, setLink] = useState('');
    const [colorDivs, setColorDivs] = useState([createColorDiv('none')]);
    const [showAddTag, setShowAddTag] = useState(false);
    const [tagDivs, setTagDivs] = useState([]);
    const [addedTags, setAddedTags] = useState([]);
    const addTagRef = useRef(null);
    const [tagsLoaded, setTagsLoaded] = useState(false);

    const addTagProps = {
        tagDivs,
        setTagDivs,
        addedTags,
        setAddedTags,
        showAddTag,
        setShowAddTag
    }

    const handlePopulateTags = async () => {
        try {
            const auth = getAuth();
            const token = await auth.currentUser.getIdToken();

            const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/users/get-tags`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            const data = await res.json();
            const tags = data.tags.map(tag => ({
                    id: tag.key,
                    content: tag.name,
                    color: tag.hex,
                    showDetails: false,
                    mongoId: tag._id,
                    updated: false
            }));
            console.log('populated tags:', tags)
            setTagDivs(tags);
        } catch (err) {
            console.log('Failed to populate tags:', err);
        }
    }

    const handleSaveData = async () => {
        try {
            const auth = getAuth();
            const token = await auth.currentUser.getIdToken();
            const tagsCreate = [];
            const tagsUpdate = [];
            tagDivs.map(div => {
                if (div.mongoId && div.updated) {
                    tagsUpdate.push({name: div.content, hex: div.color, mongoId: div.mongoId});
                } else if (!div.mongoId) {
                    tagsCreate.push({name: div.content, hex: div.color, key: div.id});
                }
            })

            if (tagsCreate.length > 0) {
                await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/users/create-tag`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({tags: tagsCreate})
                });
            }

            if (tagsUpdate.length > 0) {
                await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/users/update-tag`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({tags: tagsUpdate})
                });
            }
        } catch (err) {
            console.log('Failed to update/create tags:', err);
        }
    }

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (addTagRef.current && !addTagRef.current.contains(e.target)){
                setShowAddTag(false);
            }
        }

        handlePopulateTags();

        document.addEventListener('mousedown', handleClickOutside);
    
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [])

    function createColorDiv(displayRem) {
        return {
            id: Date.now() + Math.random(),
            color: '#F35050',
            colorGroup: 'red',
            displayRem: displayRem
        }
    }

    const addColorDiv = () => {
        setColorDivs(prev => [...prev, createColorDiv('')])
    }

    const handleDeleteColorDiv = (id) => {
        setColorDivs(prev => prev.filter(colorDiv => colorDiv.id !== id))
    }

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

    // user selects color from drop down, color picker changes accordingly
    const handleCPChange = (id, colorGroup) => {
        let colorPick = colorOptions[colorGroup];

        setColorDivs(prev => prev.map(colorDiv => 
            colorDiv.id === id ? {
                ...colorDiv, 
                color: colorPick,
                colorGroup: colorGroup
            } : colorDiv
        )); 
    }

    // user uses color picker, drop down changes accordingly
    const handleCGChange = (id, color) => {
        const colorGroup = getColorGroup(color);
        setColorDivs(prev => prev.map(colorDiv => 
            colorDiv.id === id ? {
                ...colorDiv,
                color: color,
                colorGroup: colorGroup
            } : colorDiv
        ))
    }

    const getColorGroup = (hex) => {
        const {r, g, b} = hexToRgb(hex);
        const {h, s, l} = rgbToHsl(r, g, b);

        if (r === g && g === b) {
            if (r < 30) return 'black';
            if (r > 225) return 'white';
            return 'grey';
        }

        if (h >= 20 && h <= 60 && 
            s >= 5 && s <= 35 &&  
            l >= 70     
        ) return 'beige';

        if (h >= 15 && h <= 45 && s > 30 && l < 50) return 'brown';

        if (h < 15 || h >= 345) return 'red';
        if (h < 45) return 'orange';
        if (h < 70) return 'yellow';
        if (h < 170) return 'green';
        if (h < 250) return 'blue';
        if (h < 290) return 'purple';
        if (h < 345) return 'pink';

        return 'multi-color';
    }

    const hexToRgb = (hex) => {
        const r = parseInt(hex.substr(1, 2), 16);
        const g = parseInt(hex.substr(3, 2), 16);
        const b = parseInt(hex.substr(5, 2), 16);
        return { r, g, b };
    }

    const rgbToHsl = (r, g, b) => {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0; 
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)); break;
            case g: h = ((b - r) / d + 2); break;
            case b: h = ((r - g) / d + 4); break;
            }
            h *= 60;
        }

        return { h, s: s * 100, l: l * 100 };
    } 

    return (
        <div className='item-details'>
            <div className="popup-overlay"></div>
                <div className="popup-container overlay">
                    <div className='popup-content'>
                        <div className='popup-header'>
                            <p className='popup-title'>ITEM DETAILS</p>
                            <div className='close' onClick={onClose}>
                                <CloseIcon/>
                            </div>
                        </div>
                        <hr/>
                        <div className='popup-content bottom'>
                            <img src={blueTank}/>
                            <div className='item-field-wrapper'>
                                <div className='item-field'>
                                    <h1 className='field-name'>NAME</h1>
                                    <input type='text' value={name} id='name' onChange={e => setName(e.target.value)} placeholder='Empty'/>
                                    <label htmlFor='name'><Edit/></label>
                                </div>
                                <div className='item-field color'>
                                    <h1 className='field-name'>COLOR</h1>
                                    <div className='edit-color-wrapper'>
                                        {colorDivs.map(colorDiv => (
                                        <div className='edit-color-field'>
                                            <div className='edit-color'>
                                                <input type='color' id='colorPicker' className='color-input' value={colorDiv.color} onChange={e => handleCGChange(colorDiv.id, e.target.value)}/>
                                            </div>
                                            <select name='colors' id='colorGroup' value={colorDiv.colorGroup} onChange={e => handleCPChange(colorDiv.id, e.target.value)}>
                                                {Object.keys(colorOptions).map(color => 
                                                    <option value={color}>{color}</option>
                                                )}
                                            </select>
                                            <Remove style={{display: colorDiv.displayRem}} onClick={e => handleDeleteColorDiv(colorDiv.id)}/>
                                        </div>
                                        ))}
                                    </div>
                                    <Add className='right-icon' onClick={addColorDiv}/>
                                </div>
                                <div className='item-field category'>
                                    <h1 className='field-name'>CATEG.</h1>
                                    <select name='category' value={category} onChange={e => setCategory(e.target.value)}>
                                        <option value='tops'>Tops</option>
                                        <option value='bottoms'>Bottoms</option>
                                        <option value='outerwear'>Outerwear</option>
                                        <option value='shoes'>Shoes</option>
                                        <option value='jewelry'>Jewelry</option>
                                        <option value='bags'>Bags</option>
                                        <option value='accessories'>Accessories</option>
                                        <option value='other'>Other</option>
                                    </select>
                                </div>
                                <div className='item-field'>
                                    <h1 className='field-name'>BRAND</h1>
                                    <input type='text' value={brand} id='brand' onChange={e => setBrand(e.target.value)} placeholder='Empty'/>
                                    <label htmlFor='brand'><Edit/></label>
                                </div>
                                <div className='item-field tags'>
                                    <h1 className='field-name'>TAGS</h1>
                                    <div className='tags-wrapper'>
                                        {addedTags.map(div => 
                                                <div className='tag' key={div.id} style={{backgroundColor: div.color}}>
                                                    <p>{div.content}</p>
                                                </div>
                                        )}
                                    </div>
                                    {showAddTag && <AddTag 
                                                        className='add-tag' 
                                                        {...addTagProps}
                                                        ref={addTagRef}
                                                    />}
                                    {!showAddTag && <Add className='right-icon' onClick={e => {
                                        setShowAddTag(!showAddTag);
                                        }}/>}
                                    {showAddTag && <Remove className='right-icon' onClick={e => setShowAddTag(!showAddTag)}/>}
                                </div>
                                <div className='item-field price'>
                                    <h1 className='field-name'>PRICE</h1>
                                    <div className='price-wrapper'>
                                        <p className='dollar'>$</p>
                                        <input type='number' value={price} id='price' onChange={e => setPrice(e.target.value)} placeholder='0.00'/>
                                        <label htmlFor='price'><Edit/></label>
                                    </div>
                                </div>
                                <div className='item-field'>
                                    <h1 className='field-name'>LINK</h1>
                                    <input type='url' value={link} id='link' onChange={e => setLink(e.target.value)} placeholder='Empty'/>
                                    <label htmlFor='link'><Edit/></label>
                                </div>
                            </div>
                        </div>
                        <button className='basic-btn' onClick={handleSaveData}>Save</button>
                </div>
            </div>
        </div>
    )
}

export default ItemDetails;