import './index.scss'
import {ReactComponent as CloseIcon} from '../../../assets/images/icons/close.svg'
import {ReactComponent as Edit} from '../../../assets/images/icons/edit.svg'
import {ReactComponent as Add} from '../../../assets/images/icons/add.svg'
import {ReactComponent as Remove} from '../../../assets/images/icons/remove.svg'
import AddTag from '../AddTag'
import { useState, useEffect, useRef } from 'react'
import { useCreateItem, useUpdateItem } from '../../hooks/useMutateItems';
import { useAddTag, useUpdateTag } from '../../hooks/useMutateTag'
import Select, {components} from 'react-select';
import { useTag } from '../../hooks/useTag';
import { useQuery } from '@tanstack/react-query';
import { fetchSelectedItem } from '../../../api/items';
import TagDetails from '../TagDetails';
import {createPortal} from 'react-dom';

const ItemDetails = ({ mode, 
                    setShowItemDetails,
                    processedUrl,
                    tab,
                    selectedItemId,
                    setSelectedItemId,
                    setLoading,
                    handleError
                 }) => {

    const createItem = useCreateItem();
    const updateItem = useUpdateItem();
    const addTag = useAddTag();
    const updateTag = useUpdateTag();
    const {data: tags = []} = useTag();
    const {data: selectedItem} = useQuery({
        queryKey: ['item', selectedItemId],
        queryFn: () => fetchSelectedItem({itemId: selectedItemId}),
        enabled: !!selectedItemId
    });
    const [name, setName] = useState('');
    const [category, setCategory] = useState('Tops');
    const [brand, setBrand] = useState('');
    const [price, setPrice] = useState('');
    const [link, setLink] = useState('');
    const [showAddTag, setShowAddTag] = useState(false);
    const [tagDivs, setTagDivs] = useState([]);
    const [addedTags, setAddedTags] = useState([]);
    const addTagRef = useRef(null);
    const editLinkRef = useRef(null);
    const linkInputRef = useRef(null);
    const [originalField, setOriginalField] = useState(null);
    const [changedField, setChangedField] = useState({});
    const [editLink, setEditLink] = useState(false);
    const [colors, setColors] = useState([]);
    const detailsRefs = useRef({});
    const [tagDetailsPos, setTagDetailsPos] = useState({});

    useEffect(() => {
        if (mode === 'edit' && selectedItem) {
            setName(selectedItem.name);
            setCategory(selectedItem.category);
            setBrand(selectedItem.brand);
            setPrice(selectedItem?.price || '');
            setLink(selectedItem.link);
            if (selectedItem.link) setEditLink(false);
            setColors(selectedItem.colors);
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
        if (originalField[field] !== value) {
            setChangedField(prev => ({...prev, [field]: value}))
        } else {
            setChangedField(prev => {
            const fieldCopy = {...prev};
            delete fieldCopy[field];
            return fieldCopy;
            })
        }
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
    }

    const arraysEqual = (a, b) => {
        if (a.length !== b.length) return false;
        return a.every((item, i) => 
            JSON.stringify(item) === JSON.stringify(b[i])
        )
    }

    const handlePopulateTags = async () => {
        setTagDivs(tags.map(tag => ({
                mongoId: tag._id,
                id: tag._id,
                content: tag.name,
                color: tag.hex,
                showDetails: false,
                updated: false
        })));
    }

    const handleCreateItem = async (tab) => {
        setLoading(true);
        setShowItemDetails(false);
        const itemTags = addedTags.map(tag => ({
            name: tag.content,
            hex: tag.color
        }))
        console.log('item tags', itemTags)

        console.log('tab to update:', tab)
        try {
            await createItem.mutateAsync(
                {processedUrl, name, colors, category, brand, price, link, tags: itemTags, tab},
                {
                    onSettled: () => setLoading(false),
                    onError: () => handleError()
                }
            );
        } catch {
            handleError()
        } finally {
            setLoading(false)
        }
    }

    const handleSaveChanges = async () => {
        const itemId = selectedItemId;
        const changes = {...changedField}

        console.log('mutating')
        console.log('changed:', changedField)
        console.log('will run', Object.keys(changedField).length > 0)
        setSelectedItemId(null);
        setShowItemDetails(false);
        await handleSaveTags();
        try {
            if (Object.keys(changedField).length > 0) {
                await updateItem.mutateAsync(
                    {itemId, tab, changedField: changes},
                    {
                        onSettled: () => setLoading(false),
                        onError: () => handleError()
                    }
                );
        }} catch {
            handleError();
        }
    }

    // save tags to mongo (for user)
    const handleSaveTags = async () => {
        console.log('running tags')
        const tagsCreate = [];
        const tagsUpdate = [];
        console.log('save tagdivs', tagDivs)
        tagDivs.map(div => {
            if (div.mongoId && div.updated) {
                tagsUpdate.push({name: div.content, hex: div.color});
            } else if (!div.mongoId) {
                tagsCreate.push({name: div.content, hex: div.color});
            }
        })

        const promises = [];
        console.log('create', tagsCreate)
        console.log('update', tagsUpdate)

        if (tagsCreate.length > 0) {
            promises.push(addTag.mutateAsync({tags: tagsCreate}));
        };

        if (tagsUpdate.length > 0) {
            promises.push(updateTag.mutateAsync({tags: tagsUpdate}));
        };

        await Promise.all(promises);
    }

    useEffect(() => {
        const handleClickOutside = (e) => {
            const clickedInAddTag = addTagRef.current?.contains(e.target);
            const clickedInAnyDetails = Object.values(detailsRefs.current).some(ref => ref?.contains(e.target));
            if (!clickedInAddTag && !clickedInAnyDetails){
                setShowAddTag(false);
            }
            if (editLinkRef.current && 
                !editLinkRef.current.contains(e.target) &&
                linkInputRef.current &&
                !linkInputRef.current.contains(e.target)
            ) {
                console.log('link',link)
                setEditLink(false);
            }
        }

        handlePopulateTags();

        document.addEventListener('mousedown', handleClickOutside);
    
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [])

    const itemArray = ['Tops', 'Bottoms', 'Outerwear', 'Shoes', 
        'Jewelry', 'Bags', 'Accessories', 'Other'
    ]

    const itemOptions = itemArray.map(item => ({
        label: item,
        value: item
    }))

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

    const colorOptions = Object.keys(colorMap)
                                .map(key => ({
                                    label: key,
                                    value: key,
                                    hex: colorMap[key]
                                }));
    
    const CustomOption = (props) => {
        return (
            <components.Option {...props}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <span
                style={{
                    backgroundColor: props.data.hex,
                    borderRadius: '50%',
                    width: 12,
                    height: 12,
                    marginRight: 8,
                    border: '1px solid #ccc',
                }}
                />
                <span style={{ color: '#000' }}>{props.data.label}</span>
            </div>
            </components.Option>
        );
    };

    const CustomMultiValueLabel = (props) => {
        return (
          <components.MultiValueLabel {...props}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span
                style={{
                  backgroundColor: props.data.hex,
                  borderRadius: '50%',
                  width: 10,
                  height: 10,
                  marginRight: 5,
                  border: '1px solid #f7f7f7',
                }}
              />
              {props.data.label}
            </div>
          </components.MultiValueLabel>
        );
    };

    const customStyles = {
        container: (provided) => ({
            ...provided,
            width: '100%'
        }),
        control: (provided, state) => ({
            ...provided,
            minHeight: '35px',
            height: 'auto',
            fontSize: '14px',
            borderColor: state.isFocused ? '0.5px solid rgba(128, 128, 128, 0.433)' : 'none',
            boxShadow: state.isFocused ? '0 0 0 1px rgba(128, 128, 128, 0.433)' : 'none',
            '&:hover': {
                borderColor: 'rgba(128, 128, 128, 0.433)',
              },
            border: 'none',
            padding: '0 0 0 4px',
            minWidth: '100%',
            width: '100%'
        }),
        valueContainer: (provided) => ({
            ...provided,
            padding: '0',
            display: 'flex',
            flexWrap: 'wrap',
        }),
        input: (provided) => ({
            ...provided,
            margin: 0,
            padding: 0,
        }),
        multiValue: (provided) => ({
            ...provided,
            height: '22px',          
            margin: '2px',
            display: 'flex',
            alignItems: 'center',
            maxWidth: '100%',
            fontSize: '14px',
            borderRadius: '25px',
            backgroundColor: 'rgba(226, 226, 226, 0.43)'
        }),
        multiValueLabel: (provided) => ({
            ...provided,
            padding: 0,
            paddingLeft: '6px',
            paddingRight: '6px',
            fontSize: '14px',
        }),
        multiValueRemove: (provided, state) => ({
            ...provided,
            color: '#fff',
            ':hover': {
                backgroundColor: 'transparent',
                color: '#666', // prevent it from turning red
            },
        }),
        menuList: (provided) => ({
            ...provided, 
            overflow: 'auto',
            maxHeight: '100px'
        }),
        indicatorsContainer: (provided) => ({
            ...provided,
            height: '32px',
            borderRadius: '15px'
        }),
        clearIndicator: (provided) => ({
            ...provided,
            padding: '0 4px'
        }),
        dropdownIndicator: (provided) => ({
            ...provided,
            padding: '0 0 0 4px',
        }),
        option: (provided, state) => ({
            ...provided,
            fontSize: '14px',
            display: 'flex',
            justifyContent: 'flex-start', 
            alignItems: 'center',
            textAlign: 'left', 
            backgroundColor: state.isFocused ? 'rgb(236, 236, 236)' : 'none',
            color: state.isSelected ? 'rgb(174, 174, 174)' : 'none',
        })
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
                            <div className='close' 
                                    onClick={e => {
                                        if (mode === 'edit') setSelectedItemId(null);
                                        setShowItemDetails(false);
                                    }}>
                                <CloseIcon/>
                            </div>
                        </div>
                        <hr/>
                        <div className='popup-content bottom'>
                            <img src={processedUrl || selectedItem?.itemRef?.imageURL}/>
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
                                        <Select 
                                            closeMenuOnSelect={false}
                                            value={colors.map(color => ({label: color, value: color, hex: colorMap[color]}))}
                                            isMulti
                                            options={colorOptions}
                                            components={{Option: CustomOption, MultiValueLabel: CustomMultiValueLabel}}
                                            styles={customStyles}
                                            onChange={(selected) => {
                                                setColors(selected.map(opt => opt.value));
                                                mode === 'edit' && handleChange('colors', selected.map(opt => opt.value));
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className='item-field category'>
                                    <h1 className='field-name'>CATEG.</h1>
                                    <Select 
                                        placeholder='Select...'
                                        value={{label: category, value: category}}
                                        options={itemOptions}
                                        styles={customStyles}
                                        onChange={(selected) => {
                                            setCategory(selected.value);
                                            mode === 'edit' && handleChange('category', selected.value);
                                        }}
                                    />
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
                                    {showAddTag && (
                                    <>
                                        <AddTag 
                                            className='add-tag' 
                                            tagDivs={tagDivs}
                                            setTagDivs={setTagDivs}
                                            addedTags={addedTags}
                                            setAddedTags={setAddedTags}
                                            showAddTag={showAddTag}
                                            setShowAddTag={setShowAddTag}
                                            handleArrayChange={handleArrayChange}
                                            setChangedField={setChangedField}
                                            ref={addTagRef}
                                            detailsRefs={detailsRefs}
                                            setTagDetailsPos={setTagDetailsPos}
                                        />
                                        {tagDivs.map(div => 
                                            div.showDetails && createPortal(
                                                <TagDetails 
                                                    className='tag-details' 
                                                    ref={el => (detailsRefs.current[div.id] = el)} 
                                                    name={div.content} 
                                                    setTagDivs={setTagDivs} 
                                                    setAddedTags={setAddedTags} 
                                                    id={div.id} 
                                                    mongoId={div.mongoId}
                                                    handleArrayChange={handleArrayChange}
                                                    tagDivs={tagDivs}
                                                    style={{
                                                        position: 'fixed',
                                                        top: `${tagDetailsPos.top}px`,
                                                        left: `${tagDetailsPos.left}px`,
                                                        zIndex: 9999
                                                    }}
                                                />,
                                                document.body
                                            )
                                        )}
                                    </>)
                                    }
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
                                    {(editLink) ? ( 
                                        <input type='url' 
                                            value={link} 
                                            id='link' 
                                            placeholder='Empty'
                                            onChange={e => {
                                                setLink(e.target.value);
                                                mode === 'edit' && handleChange('link', e.target.value);
                                            }}/>
                                        ) : (
                                        <a href={link?.startsWith('http') ? link : `https://${link}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => {
                                                if (!link) e.preventDefault(); 
                                            }}>
                                            {link}
                                        </a>
                                    )}
                                    <label htmlFor='link' ref={editLinkRef} className='right-icon' onClick={() => setEditLink(true)}><Edit/></label>
                                </div>
                            </div>
                        </div>
                        {mode === 'create' && 
                            <div className='buttons'>
                                <button className='basic-btn blue' onClick={() => handleCreateItem('closet')}>Save to Closet</button>
                                <button className='basic-btn' onClick={() => handleCreateItem('wishlist')}>Save to Wishlist</button>
                            </div>
                        }
                        {mode === 'edit' &&
                            <>
                                <button type='button' className='basic-btn' id='edit' onClick={() => 
                                    {console.log('clicked')
                                        handleSaveChanges()}}>Save Changes</button>
                            </>
                        }
                </div>
            </div>
        </div>
    )
}

export default ItemDetails;