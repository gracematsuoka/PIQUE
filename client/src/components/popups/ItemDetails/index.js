import './index.scss'
import {ReactComponent as CloseIcon} from '../../../assets/images/icons/close.svg'
import {ReactComponent as Edit} from '../../../assets/images/icons/edit.svg'
import {ReactComponent as Add} from '../../../assets/images/icons/add.svg'
import {ReactComponent as Remove} from '../../../assets/images/icons/remove.svg'
import AddTag from '../AddTag'
import { useState, useEffect, useRef, use } from 'react'
import { getAuth } from 'firebase/auth'


const ItemDetails = ({ mode, 
                    setShowItemDetails,
                    processedUrl,
                    tab,
                    setReloadItems,
                    selectedItem,
                    setLoading,
                    setUpdatedItem,
                    setAddedItem
                 }) => {
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [brand, setBrand] = useState('');
    const [price, setPrice] = useState('');
    const [link, setLink] = useState('');
    const [colorDivs, setColorDivs] = useState([createColorDiv('none')]);
    const [showAddTag, setShowAddTag] = useState(false);
    const [tagDivs, setTagDivs] = useState([]);
    const [addedTags, setAddedTags] = useState([]);
    const addTagRef = useRef(null);
    const editLinkRef = useRef(null);
    const linkInputRef = useRef(null);
    const [originalField, setOriginalField] = useState(null);
    const [changedField, setChangedField] = useState({});
    const [editLink, setEditLink] = useState(false);

    useEffect(() => {
        if (mode === 'edit' && selectedItem) {
            setName(selectedItem.name);
            setCategory(selectedItem.category);
            setBrand(selectedItem.brand);
            setPrice(selectedItem.price);
            setLink(selectedItem.link);
            setColorDivs(selectedItem.colors.map((color, index) => ({
                id: color._id,
                colorGroup: color.color,
                color: color.hex,
                displayRem: index === 0 ? 'none' : ''
            })));
            setOriginalField(selectedItem);
            setAddedTags(selectedItem.tags.map(tag => ({
                id: tag.id,
                content: tag.name,
                color: tag.hex,
                showDetails: false,
                mongoId: tag.id,
                updated: false
            })));
        }

    }, [mode, selectedItem])

    useEffect(() => {
        if (originalField?.colors) {
        handleArrayChange(
            originalField.colors.map(color => ({
                color: color.colorGroup,
                hex: color.color
            })), 
            colorDivs.map(colorDiv => ({
                color: colorDiv.colorGroup,
                hex: colorDiv.color
            })), 
            'colors');
        }
    }, [colorDivs]);

    useEffect(() => {
        if (originalField?.tags) {
            handleArrayChange(
                originalField.tags.map(tag => ({
                    name: tag.content,
                    hex: tag.color
                })), 
                addedTags.map(tag => ({
                    name: tag.content,
                    hex: tag.color
                })), 
                'tags');
        }
    }, [addedTags]);

    const handleChange = (field, value) => {
        console.log('original:', originalField)
        if (originalField[field] !== value) {
            setChangedField(prev => ({...prev, [field]: value}))
        } else {
            setChangedField(prev => {
            const fieldCopy = {...prev};
            delete fieldCopy[field];
            return fieldCopy;
            })
        }
        console.log('field changed:', changedField)
    }

    const handleArrayChange = (originalArray, changedArray, field) => {
        if (!arraysEqual(originalArray, changedArray)) {
            setChangedField(prev => ({...prev, [field]: changedArray}))
        } else {
            setChangedField(prev => {
                const fieldCopy = {...prev};
                delete fieldCopy[field];
                return fieldCopy;
            })
        }
        console.log('array changed:', changedField)
    }

    const arraysEqual = (a, b) => {
        if (a.length !== b.length) return false;
        return a.every((item, i) => 
            JSON.stringify(item) === JSON.stringify(b[i])
        )
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
                    id: tag._id,
                    content: tag.name,
                    color: tag.hex,
                    showDetails: false,
                    updated: false
            }));
            setTagDivs(tags);
        } catch (err) {
            console.log('Failed to populate tags:', err);
        }
    }

    const handleCreateItem = async (selectedTab) => {
        setLoading(true);
        setShowItemDetails(false);
        window.onbeforeunload = () => 'Saving in progress…';

        try {
            const auth = getAuth();
            const token = await auth.currentUser.getIdToken();
            const tagsPromise = handleSaveTags(token);
            const imageURLPromise = handleSaveImage();

            await tagsPromise;
            const imageURL = await imageURLPromise;
            const itemRef = await handleSaveItem(imageURL, token);

            const userItem = await handleSaveUserItem(itemRef, selectedTab, token);
            setAddedItem({...userItem});
            console.log('just added:', userItem)
        } catch (err) {
            console.log('Error saving item:', err);
        } finally {
            setLoading(false);
            window.onbeforeunload = null;
        }
    }

    const handleSaveChanges = async () => {
        setLoading(true);
        setShowItemDetails(false);
        window.onbeforeunload = () => 'Saving in progress…';

        await handleSaveTags();

        if (Object.keys(changedField).length > 0) {
            try {
                const auth = getAuth();
                const token = await auth.currentUser.getIdToken();

                const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/user-items/update-item/${selectedItem._id}`, {
                    method: 'PATCH',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(changedField)
                })

                const data = await res.json();
                const item = data.item;
                setUpdatedItem({...item});
            } catch (err) {
                console.log('Failed to save updates:', err);
            } finally {
                setLoading(false);
                window.onbeforeunload = null;
            }
        }
    }

    // save tags to mongo (for user)
    const handleSaveTags = async (token) => {
        try {
            const tagsCreate = [];
            const tagsUpdate = [];
            tagDivs.map(div => {
                if (div.id && div.updated) {
                    tagsUpdate.push({name: div.content, hex: div.color});
                } else if (!div.id) {
                    tagsCreate.push({name: div.content, hex: div.color});
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

    // save image to cf
    const handleSaveImage = async () => {
        try {
            const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/images/get-upload-url`);
            const {uploadURL} = await res.json();
            const blob = await fetch(processedUrl).then(res => res.blob());

            const formData = new FormData();
            formData.append('file', blob);

            const uploadRes = await fetch(uploadURL, {
                method: 'POST',
                body: formData
            });

            const data = await uploadRes.json();
            const imageId = data.result?.id;
            const publicURL = `https://imagedelivery.net/${process.env.REACT_APP_CF_HASH}/${imageId}/public`;
            return publicURL;
        } catch (err) {
            console.log('Failed to save image to cf:', err);
        }
    }

    // save item to general database
    const handleSaveItem = async (imageURL, token) => {
        try { 
            const colors = colorDivs.map(color => ({
                color: color.colorGroup,
                hex: color.color
            }));

            const numPrice = price === '' ? null : parseFloat(price);

            const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/items/create-item`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    imageURL,
                    name, 
                    colors,
                    category,
                    brand,
                    price: numPrice,
                    link
                })
            });

            const data = await res.json();
            const itemRef = data.item._id;
            return itemRef;
        } catch (err) {
            console.log('Failed to save item details to general database:', err);
        }
    }

    // save item to user's "closet"
    const handleSaveUserItem = async (itemRef, selectedTab, token) => {
        try { 
            const colors = colorDivs.map(color => ({
                color: color.colorGroup,
                hex: color.color
            }));
            const tags = addedTags.map(tag => ({
                name: tag.content,
                hex: tag.color
            }))

            const numPrice = price === '' ? null : parseFloat(price);

            const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/user-items/create-item`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    name, 
                    colors,
                    category,
                    brand,
                    price: numPrice,
                    link,
                    tags,
                    itemRef,
                    tab: selectedTab
                })
            });

            const data = await res.json();
            const userItem = data.popItem;
            console.log('user item:', userItem)
            return userItem;
        } catch (err) {
            console.log('Failed to save item details to general database:', err);
        }
    }

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (addTagRef.current && !addTagRef.current.contains(e.target)){
                setShowAddTag(false);
            }
            if (editLinkRef.current && 
                !editLinkRef.current.contains(e.target) &&
                linkInputRef.current &&
                !linkInputRef.current.contains(e.target)
            ) {
                setEditLink(false);
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

    const itemOptions = ['Tops', 'Bottoms', 'Outerwear', 'Shoes', 
        'Jewelry', 'Bags', 'Accessories', 'Other'
    ]

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
            if (r < 30) return 'Black';
            if (r > 225) return 'White';
            return 'Grey';
        }

        if (h >= 20 && h <= 60 && 
            s >= 5 && s <= 35 &&  
            l >= 70     
        ) return 'Beige';

        if (h >= 15 && h <= 45 && s > 30 && l < 50) return 'brown';

        if (h < 15 || h >= 345) return 'Red';
        if (h < 45) return 'Orange';
        if (h < 70) return 'Yellow';
        if (h < 170) return 'Green';
        if (h < 250) return 'Blue';
        if (h < 290) return 'Purple';
        if (h < 345) return 'Pink';

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

    const handleRemoveTag = (id) => {
        setAddedTags(prev => prev
            .map(div => 
                    div.id === id ? {...div, showDetails: false} : div
                )
            .filter(div => div.id !== id)
        )
    }

    return (
        <div className='item-details'>
            <div className="popup-overlay"></div>
                <div className="popup-container overlay">
                    <div className='popup-content'>
                        <div className='popup-header'>
                            <p className='popup-title'>ITEM DETAILS</p>
                            <div className='close' onClick={e => setShowItemDetails(false)}>
                                <CloseIcon/>
                            </div>
                        </div>
                        <hr/>
                        <div className='popup-content bottom'>
                            <img src={processedUrl || null}/>
                            <div className='item-field-wrapper'>
                                <div className='item-field'>
                                    <h1 className='field-name'>NAME</h1>
                                    <input type='text' 
                                            value={name}
                                            id='name' 
                                            onChange={e => {
                                                    setName(e.target.value);
                                                    mode === 'edit' && handleChange('name', e.target.value);
                                                    }}
                                            placeholder='Empty'/>
                                    <label className='right-icon' htmlFor='name'><Edit/></label>
                                </div>
                                <div className='item-field color'>
                                    <h1 className='field-name'>COLOR</h1>
                                    <div className='edit-color-wrapper'>
                                        {colorDivs.map(colorDiv => (
                                        <div className='edit-color-field' key={colorDiv.id}>
                                            <div className='edit-color'>
                                                <input type='color' 
                                                        id='colorPicker' 
                                                        className='color-input' 
                                                        value={colorDiv.color} 
                                                        onChange={e => {
                                                            handleCGChange(colorDiv.id, e.target.value);
                                                            }}/>
                                            </div>
                                            <select name='colors' 
                                                    id='colorGroup' 
                                                    value={colorDiv.colorGroup} 
                                                    onChange={e => {
                                                            handleCPChange(colorDiv.id, e.target.value);
                                                            }}>
                                                {Object.keys(colorOptions).map(color => 
                                                    <option value={color}>{color}</option>
                                                )}
                                            </select>
                                            <Remove style={{display: colorDiv.displayRem}} 
                                                    onClick={e => {
                                                        handleDeleteColorDiv(colorDiv.id);
                                                        }}/>
                                        </div>
                                        ))}
                                    </div>
                                    <Add className='right-icon' 
                                        onClick={e => {
                                            addColorDiv();
                                        }}
                                    />
                                </div>
                                <div className='item-field category'>
                                    <h1 className='field-name'>CATEG.</h1>
                                    <select name='category' 
                                            value={category} 
                                            onChange={e => {
                                                    setCategory(e.target.value);
                                                    mode === 'edit' && handleChange('category', e.target.value);
                                                    }}>
                                        {itemOptions.map(item =>
                                            <option value={item}>{item}</option>
                                        )}
                                    </select>
                                </div>
                                <div className='item-field'>
                                    <h1 className='field-name'>BRAND</h1>
                                    <input type='text' 
                                            value={brand} 
                                            id='brand' 
                                            placeholder='Empty'
                                            onChange={e => {
                                                    setBrand(e.target.value);
                                                    mode === 'edit' && handleChange('brand', e.target.value);
                                                    }}/>
                                    <label className='right-icon' htmlFor='brand'><Edit/></label>
                                </div>
                                <div className='item-field tags'>
                                    <h1 className='field-name'>TAGS</h1>
                                    <div className='tags-wrapper'>
                                        {addedTags.map(div => 
                                                <div className='tag' key={div.id} style={{backgroundColor: div.color}}>
                                                    <p>{div.content}</p>
                                                    <CloseIcon onClick={e => handleRemoveTag(div.id)}/>
                                                </div>
                                        )}
                                    </div>
                                    {showAddTag && <AddTag 
                                                        className='add-tag' 
                                                        tagDivs={tagDivs}
                                                        setTagDivs={setTagDivs}
                                                        addedTags={addedTags}
                                                        setAddedTags={setAddedTags}
                                                        showAddTag={showAddTag}
                                                        setShowAddTag={setShowAddTag}
                                                        handleArrayChange={handleArrayChange}
                                                        setChangedField={setChangedField}
                                                        originalTags={originalField.tags}
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
                                        <input type='number' 
                                                value={price} 
                                                ref={linkInputRef}
                                                id='price' 
                                                placeholder='0.00'
                                                onChange={e => {
                                                        setPrice(e.target.value);
                                                        mode === 'edit' && handleChange('price', e.target.value);
                                                        }}/>
                                        <label className='right-icon' htmlFor='price'><Edit/></label>
                                    </div>
                                </div>
                                <div className='item-field'>
                                    <h1 className='field-name'>LINK</h1>
                                    {editLink && <input type='url' 
                                            value={link} 
                                            id='link' 
                                            placeholder='Empty'
                                            onChange={e => {
                                                setLink(e.target.value);
                                                mode === 'edit' && handleChange('link', e.target.value);
                                            }}/>}
                                    {!editLink && <a href={link}
                                                     target="_blank"
                                                     rel="noopener noreferrer"
                                                     onClick={(e) => {
                                                       if (!link) e.preventDefault(); 
                                                     }}>{link}</a>
                                    }
                                    <label htmlFor='link' ref={editLinkRef} className='right-icon' onClick={() => setEditLink(true)}><Edit/></label>
                                </div>
                            </div>
                        </div>
                        {mode === 'create' && 
                            <div className='buttons'>
                                <button className='basic-btn' onClick={() => handleCreateItem('closet')} style={{backgroundColor: '#6B799F', color: '#ffffff'}}>Save to Closet</button>
                                <button className='basic-btn' onClick={() => handleCreateItem('wishlist')}>Save to Wishlist</button>
                            </div>
                        }
                        {mode === 'edit' &&
                            <>
                                <button className='basic-btn' onClick={() => handleSaveChanges()}>Save Changes</button>
                            </>
                        }
                </div>
            </div>
        </div>
    )
}

export default ItemDetails;