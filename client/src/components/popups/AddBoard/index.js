import './index.scss';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';

const AddBoard = ({setShowAddBoard}) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');

    const handleCreateBoard = async () => {
        if (!title) {
            setError('Title is required');
            return;
        }

        
    }

    return (
        <div className='add-board'>
            <div className="popup-overlay"></div>
                <div className="popup-container overlay"> 
                    <div className='popup-content'>
                        <div className='popup-header'>
                            <h1>NEW BOARD</h1>
                            <div className='close' onClick={() => setShowAddBoard(false)} >
                                <CloseIcon/>
                            </div>
                        </div>
                        {error && <div className='error'>{error}</div>}
                        <div className='label-input'>
                            <label htmlFor='title'>Title</label>
                            <input type='text' id='title' placeholder='Enter title'/>
                        </div>
                        <div className='label-input'>
                            <label htmlFor='description'>Description</label>
                            <textarea id='description' className='description' rows='4' placeholder='Enter description'/>
                        </div>
                        <div className='prev-btns'>
                            <button className='sub-btn bold' onClick={() => setShowAddBoard(false)}>Create board</button>
                            <button className='sub-btn' onClick={() => handleCreateBoard()}>Cancel</button>
                        </div>
                    </div>
                </div>
        </div>
    )
}

export default AddBoard;