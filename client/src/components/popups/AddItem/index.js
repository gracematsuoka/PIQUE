import './index.scss'
import {ReactComponent as BackIcon} from '../../../assets/images/icons/back.svg'
import {ReactComponent as ShirtIcon} from '../../../assets/images/icons/shirt.svg'
import {ReactComponent as UploadIcon} from '../../../assets/images/icons/upload.svg'
import SearchBar from '../../reusable/SearchBar'
import { useState, useEffect } from 'react'

const AddItem = ({ onClose, props }) => {
    const {setShowAddPopup, setShowItemDetails, processedUrl, setProcessedUrl} = props;
    const [isFromDevice, setIsFromDevice] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [filled, setFilled] = useState(0);
    const [tab, setTab] = useState('upload');

    useEffect(() => {
        if(isLoading && filled < 100) {
            setTimeout(() => setFilled(prev => prev += 2), 50)
        }
    }, [filled, isLoading])

    const handleUpload = async (e) => {
        const image = e.target.files[0];
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

    return (
            <>
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
                        <p className={tab === 'database' ? 'active' : ''} onClick={() => setTab('database')}>DATABASE</p>
                        <p className={tab === 'upload' ? 'active' : ''} onClick={() => setTab('upload')}>FROM DEVICE</p>
                    </div>
                    <hr/>
                    {tab === 'database' && <SearchBar/>}

                    {tab === 'upload' && (
                        <div className='popup-content bottom'>
                            <ShirtIcon className='clothes-upload'/>
                            <p>Drag & drop photo here</p>
                            <p className='or'>OR</p>
                            <button className='sub-btn'>
                                <UploadIcon/>
                                <label htmlFor='image-upload'>Upload from device</label>
                                <input type='file' multiple id='image-upload' accept='image/*' onChange={handleUpload}/>
                            </button>
                        </div>
                    )}
                </div>}

            {isLoading && 
                <div className='loading'>
                    <div className='progress-bar' style={{width: `${filled}%`}}/>
                    <p>Removing image background...</p>
                </div>
            }
            </div>
            </>
    )
}

export default AddItem;