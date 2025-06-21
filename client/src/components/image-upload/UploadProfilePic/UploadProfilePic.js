import imageCompression from 'browser-image-compression';
import {getStorage, ref, uploadBytes, getDownloadURL} from 'firebase/storage';
import {getAuth} from 'firebase/auth';
import { useAuth } from '../../../contexts/AuthContext';
import {useState} from 'react';
import defaultProfilePic from '../../../assets/images/icons/default-profile-pic.png'

const UploadProfilePic = () => {
    const auth = getAuth();
    const {mongoUser} = useAuth();
    const [file, setFile] = useState(mongoUser?.profileURL || defaultProfilePic);

    const handleFileChange = async (e) => {
        const image = e.target.files[0];

        const compressed = await imageCompression(image, {
            maxSizeMB: 0.2,
            maxWidthOrHeight: 500,
            useWebWorker: true
        });

        const storage = getStorage();
        const storageRef = ref(storage, `profilePics/${auth.currentUser.uid}`);

        await uploadBytes(storageRef, compressed);
        const downloadURL = await getDownloadURL(storageRef);

        await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/users/update-user`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${await auth.currentUser.getIdToken(true)}`
            },
            body: JSON.stringify({ profileURL: downloadURL })
        });

        setFile(downloadURL);
    }

    return (
        <div className='upload-profile-pic' onClick={() => document.getElementById('profileFile').click()}>
            <div className='edit-pic-icon'>
                <img className='profile-pic' 
                    src={file}
                />
                <svg className='edit-icon' xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000" ><path d="M120-120v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm584-528 56-56-56-56-56 56 56 56Z"/></svg>
            </div>
            <input type='file' id='profileFile' accept='image/*' onChange={handleFileChange} style={{ display: 'none' }}/>
        </div>
    )
}

export default UploadProfilePic;