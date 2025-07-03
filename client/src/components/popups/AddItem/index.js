import './index.scss'
import {ReactComponent as BackIcon} from '../../../assets/images/icons/back.svg';
import {ReactComponent as ShirtIcon} from '../../../assets/images/icons/shirt.svg';
import {ReactComponent as UploadIcon} from '../../../assets/images/icons/upload.svg';
import SearchBar from '../../reusable/SearchBar';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import {ReactComponent as FilterIcon} from '../../../assets/images/icons/filter.svg';
import { useItems } from '../../hooks/useItems';
import { useCreateCopy } from '../../hooks/useMutateItems';
import Filter from '../Filter';
import {ReactComponent as Check} from '../../../assets/images/icons/check.svg';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const AddItem = ({onClose, 
                    setShowAddPopup, 
                    setShowItemDetails, 
                    setProcessedUrl, 
                    tab,
                    setLoading,
                    handleError
                    }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [filled, setFilled] = useState(0);
    const [addTab, setAddTab] = useState('upload');
    const [error, setError] = useState('');
    const [showFilter, setShowFilter] = useState(false);
    const [categs, setCategs] = useState([]);
    const [colors, setColors] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const createCopy = useCreateCopy();

    // filter
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
    
        useEffect(() => {
            const colorCheckMap = Object.keys(colorMap)
                .map(color => ({
                        color,
                        hex: colorMap[color],
                        checked: false
                    })
            );
            setColors(colorCheckMap)
    
            setCategs(itemArray.map(item => ({
                categ: item,
                checked: false
            })))
        }, []) 

    const maxSize = 10 * 1024 * 1024;
    const {
            data,
            fetchNextPage,
            hasNextPage,
            isFetchingNextPage,
            isLoading: itemsLoading
        } = useItems('database');
    const items = data?.pages.flatMap(page => page.items) || [];

    const sentinelRef = useRef(null);

    useEffect(() => {
        if (!hasNextPage) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    fetchNextPage();
                }
            },
            {
                root: null,
                rootMargin: '0px',
                threshold: 1.0
            }
        )
        if (sentinelRef.current){
            observer.observe(sentinelRef.current)
        };

        return () => observer.disconnect();
    }, [hasNextPage]);

    useEffect(() => {
        if(isLoading && filled < 100) {
            setTimeout(() => setFilled(prev => prev += 2), 50)
        }
    }, [filled, isLoading])

    const processFile = async (image) => {
        const formData = new FormData();
        formData.append('image', image);

        try {
            setIsLoading(true);
            const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/images/upload`, {
                method: 'POST',
                body: formData
            })

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            setProcessedUrl(url);
            setShowAddPopup(false);
            setShowItemDetails(true);
        } catch (err) {
            console.error('Upload failed:', err);
        } finally {
            setIsLoading(false);
        }
    }

    const onDropRejected = useCallback((rejections) => {
        setError('');

        if (rejections.length > 0) {
            // setError('Image must be under 10 MB and with the allowed file type (.png, .jpg, .jpeg)');
            const { code } = rejections[0].errors[0];  
            switch (code) {
                case 'file-too-large':
                setError('Image must be under 10 MB');
                break;
                case 'file-invalid-type':
                setError('Allowed types: .png, .jpg, .jpeg');
                break;
                default:
                setError('File rejected');
        }}}, [])

    const onDropAccepted = useCallback((accepted) => {
        setError('');
        if (accepted.length) processFile(accepted[0]);
    }, [processFile])
    
    const {getRootProps, getInputProps, isDragActive, fileRejections} = useDropzone({
        accept: {
            'image/png': ['.png'],
            'image/jpeg': ['.jpeg', '.jpg']
        },
        maxSize: maxSize,
        onDropRejected,
        onDropAccepted,
        noClick: true,
        multiple: false
    })

    const handleUpload = async (e) => {
        const image = e.target.files[0];

        if (!image) return;

        setError('');

        if (image.size > maxSize) {
            setError('Image must be under 10 MB');
            return;
        }

        const fileType = image.type;
        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];

        if (!allowedTypes.includes(fileType)) {
            setError('Allowed types: .png, .jpg, .jpeg');
            return;
        }

        processFile(image);
    }

    const handleSelected = (itemId) => {
        if (selectedItems.includes(itemId)) {
            setSelectedItems(prev => prev.filter(id => id !== itemId))
            
        } else {
            setSelectedItems(prev => [...prev, itemId])
        }
    }

    const handleAdd = async () => {
        console.log('selected:',selectedItems)
        setShowAddPopup(false);
        setLoading(true);
        try {
            await createCopy.mutateAsync({itemRefs: selectedItems, tab});
        } catch (err) {
            handleError(err);
        } finally {
            setLoading(false);
        }
    }

    return (
            <div className='add-item'>
            <div {...getRootProps()} style={{ width: '100%', height: '100%' }}>
                <div className="popup-overlay"></div>
                <div className="popup-container overlay">
                {!isLoading &&  
                    <div className='popup-content'>
                        <div className='popup-header'>
                            <div className='back' onClick={onClose}>
                                <BackIcon/>
                            </div>
                            <p className='popup-title'>ADD ITEM TO CLOSET</p>
                        </div>
                        <div className='basic-nav popup'>
                            <p className={addTab === 'database' ? 'active' : ''} onClick={() => setAddTab('database')}>DATABASE</p>
                            <p className={addTab === 'upload' ? 'active' : ''} onClick={() => setAddTab('upload')}>UPLOAD</p>
                        </div>
                        <hr/>
                        {addTab === 'database' && 
                        <div className='database'>
                            <div className='search-filter'>
                                <SearchBar/>
                                <div className="filter" onClick={e => setShowFilter(!showFilter)}>
                                    <p>Filter</p>
                                    <FilterIcon/>
                                </div>
                            </div>
                            <div className='items'>
                                {items.map(item => 
                                    <div className='item-wrapper' 
                                        key={item._id}
                                        onClick={() => handleSelected(item._id)}
                                        style={{backgroundColor: selectedItems.includes(item._id) ? '#f2f2f2' : ''}}
                                    >
                                        <img loading='lazy' 
                                            src={item.imageURL}
                                            alt={item.name}
                                        />
                                        {selectedItems.includes(item._id) &&
                                            <div className='circle-check'>
                                                <Check/>
                                            </div> 
                                        }
                                    </div>
                                )}
                                {hasNextPage && 
                                    <div ref={sentinelRef}/>
                                }
                            </div>
                            {(selectedItems.length > 0) && 
                                <div className='num-selected'>
                                    <p>{selectedItems.length} selected</p>
                                </div>
                            }
                            <div className='continue' onClick={handleAdd}>
                                <p>Add to {tab}</p>
                                <NavigateNextIcon/>
                            </div>
                            <Filter className={`popup-container filter ${showFilter ? 'open' : ''}`} 
                                    setShowFilter={setShowFilter}
                                    colors={colors}
                                    setColors={setColors}
                                    categs={categs}
                                    setCategs={setCategs}
                                    showTags={false}
                            />
                        </div>
                        }

                        {addTab === 'upload' && (
                            <div className='popup-content bottom'>
                                <ShirtIcon className='clothes-upload'/>
                                {error && <p className='error'>{error}</p> }
                                <p>Drag & drop saved photo here</p>
                                <p className='or'>OR</p>
                                <button className='sub-btn'>
                                    <UploadIcon/>
                                    <label htmlFor='image-upload'>Upload from device</label>
                                    <input type='file' multiple id='image-upload' accept='image/*' onChange={handleUpload}/>
                                </button>
                            </div>
                        )}  
                        <input {...getInputProps()} />
                    </div>
                }
                {!isLoading && isDragActive && 
                    <div className='active-drag'>
                        <h1>Drop image</h1>
                    </div>
                }
                </div>

                {isLoading && 
                    <div className='loading overlay'>
                        <div className='progress-bar' style={{width: `${filled}%`}}/>
                        <p>Removing background from image...</p>
                    </div>
                }
            </div>
            </div>
    )
}

export default AddItem;