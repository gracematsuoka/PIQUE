import './index.scss';
import { useState, useEffect } from 'react';
import { auth } from '../../../firebase';
import { fetchWithError } from '../../../utils/fetchWithError';

const PostPrev = ({canvasJSON,
                    postURL,
                    title,
                    setTitle,
                    setShowPost,
                    setShowCongrats
                }) => { 
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [filled, setFilled] = useState(0);

    useEffect(() => {
            if(loading && filled < 100) {
                const timeout = setTimeout(() => setFilled(prev => prev += 5), 50);
                return () => clearTimeout(timeout);
            }
        }, [filled, loading])

    const handlePost = async () => {
        if (!postURL) {
            setError('System timed out, please cancel and try again');
            return;
        }

        if (!title) {
            setError('Title is required');
            return;
        }

        setLoading(true);
        const cfURL = await handleSaveImage();

        try {
            const token = await auth.currentUser.getIdToken();

            await fetchWithError(`${process.env.REACT_APP_API_BASE_URL}/api/posts/create-post`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({canvasJSON, title, description, postURL: cfURL})
            })

            setShowPost(false);
            setShowCongrats(true);
        } catch (err) {
            console.log('Failed to create post');
            setError('Failed to post, please try again');
            setShowPost(true);
        } finally {
            setLoading(false);
        }
    }

    const handleSaveImage = async () => {
        try {
            const {uploadURL} = await fetchWithError(`${process.env.REACT_APP_API_BASE_URL}/api/images/get-upload-url`);
            
            const res = await fetch(postURL);

            if (!res.ok) throw new Error('Failed to fetch');

            const blob = await res.blob();
            const formData = new FormData();
            formData.append('file', blob);

            const data = await fetchWithError(uploadURL, {
                method: 'POST',
                body: formData
            });

            const imageId = data.result?.id;
            const publicURL = `https://imagedelivery.net/${process.env.REACT_APP_CF_HASH}/${imageId}/public`;
            return publicURL;
        } catch (err) {
            console.log('Failed to save image to cf:', err);
        }
    }

    return (
        <div className='postprev'>
        <div className="popup-overlay"></div>
                    {loading && 
                        <div className="loading overlay">
                            <div className="progress-bar" 
                                style={{width: `${filled}%`}}
                                />
                            <p>Posting ...</p>
                        </div>
                    }
                    {!loading && 
                    <div className="popup-container overlay">
                        <div className='popup-content'>
                            <div className='prev-title'>
                                <p>Looking good 💅</p>
                                <h1>Get ready to post...</h1>
                            </div>
                            <div className='prev-content'>
                                <div className='prev-img'>
                                    <img src={postURL} alt='Post Preview'/>
                                </div>
                                <div className='prev-right'>
                                    <div className='prev-desc'>
                                        {error && <div className='error'>{error}</div>}
                                        <input type='text' placeholder='Title' value={title} onChange={e => setTitle(e.target.value)}/>
                                        <textarea className='description' rows='8' placeholder='Description' value={description} onChange={e => setDescription(e.target.value)}/>
                                        <p style={{fontSize: '9px', textAlign: 'center'}}>* Note: any uploaded items will become part of the public database once posted</p>
                                    </div>
                                    <div className='prev-btns'>
                                        <button className='sub-btn bold' onClick={handlePost}>Post</button>
                                        <button className='sub-btn' onClick={() => setShowPost(false)}>Cancel</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        </div>
                        }
        </div>
    )       
}

export default PostPrev;