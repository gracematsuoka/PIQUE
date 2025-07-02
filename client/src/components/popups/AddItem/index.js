import './index.scss'
import {ReactComponent as BackIcon} from '../../../assets/images/icons/back.svg';
import {ReactComponent as ShirtIcon} from '../../../assets/images/icons/shirt.svg';
import {ReactComponent as UploadIcon} from '../../../assets/images/icons/upload.svg';
import SearchBar from '../../reusable/SearchBar';
import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

const AddItem = ({onClose, 
                    setShowAddPopup, 
                    setShowItemDetails, 
                    processedUrl, 
                    setProcessedUrl, 
                    tab
                    }) => {
    const [isFromDevice, setIsFromDevice] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [filled, setFilled] = useState(0);
    const [addTab, setAddTab] = useState('upload');
    const [error, setError] = useState('');
    const maxSize = 10 * 1024 * 1024;

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

    return (
            <>
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
                            <p className={addTab === 'upload' ? 'active' : ''} onClick={() => setAddTab('upload')}>FROM DEVICE</p>
                        </div>
                        <hr/>
                        {addTab === 'database' && <SearchBar/>}

                        {addTab === 'upload' && (
                            <div className='popup-content bottom'>
                                <ShirtIcon className='clothes-upload'/>
                                {error && <p className='error'>{error}</p> }
                                <p>Drag & drop photo here</p>
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
            </>
    )
}

export default AddItem;