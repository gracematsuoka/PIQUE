import './index.scss'
import {ReactComponent as BackIcon} from '../../../assets/images/icons/back.svg'
import {ReactComponent as ShirtIcon} from '../../../assets/images/icons/shirt.svg'
import {ReactComponent as UploadIcon} from '../../../assets/images/icons/upload.svg'
import SearchBar from '../../reusable/SearchBar'
import { useState } from 'react'

const AddItem = ({ onClose }) => {
    const [isFromDevice, setIsFromDevice] = useState(true);
    const [tab, setTab] = useState('upload');

    const handleUpload = async (e) => {
        const files = e.target.files;
        const formData = new FormData();

        for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i]);
        }

        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/images/upload-multiple`, {
            method: 'POST',
            body: formData
        })
    }

    return (
        <>
            <div className="popup-overlay"></div>
            <div className="popup-container overlay">
                
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
                                <label htmlFor='image-upload'>Upload from device</label> */
                                <input type='file' multiple id='image-upload' accept='image/*' onClick={handleUpload}/>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default AddItem;