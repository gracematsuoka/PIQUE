import './index.scss'
import {ReactComponent as BackIcon} from '../../../assets/images/icons/back.svg'
import {ReactComponent as ShirtIcon} from '../../../assets/images/icons/shirt.svg'
import {ReactComponent as UploadIcon} from '../../../assets/images/icons/upload.svg'
import SearchBar from '../../reusable/SearchBar'
import { useState } from 'react'

const AddItem = ({ onClose }) => {
    const [isFromDevice, setIsFromDevice] = useState(true);
    const [tab, setTab] = useState('upload');

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
                                <p>Upload from device</p>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default AddItem;