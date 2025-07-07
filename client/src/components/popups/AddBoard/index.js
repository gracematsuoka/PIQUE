import './index.scss';
import CloseIcon from '@mui/icons-material/Close';
import { useState, useEffect } from 'react';
import { auth } from '../../../firebase';
import { useMutation } from '@tanstack/react-query';
import { fetchWithError } from '../../../utils/fetchWithError';

const AddBoard = ({
                    mode,
                    board,
                    close,
                    onSuccess
                }) => {
    const [title, setTitle] = useState(board?.title || '');
    const [description, setDescription] = useState(board?.description || '');
    const [coverURL, setCoverURL] = useState(board?.coverURL || '');
    const [error, setError] = useState('');

    const addBoard = useMutation({
        mutationFn: async (newTitle, newDescription) => {
            try {
                const token = await auth.currentUser.getIdToken();
                const { board: newBoard } = await fetchWithError(`${process.env.REACT_APP_API_BASE_URL}/api/boards/create-board`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-type': 'application/json'
                    },
                    body: JSON.stringify({title: newTitle, description: newDescription})
                })

                return newBoard;
            } catch (err) {
                console.log('Failed to create board:', err);
            }
        },
        onSuccess: (newBoard) => onSuccess(newBoard)
    })

    const editBoard = useMutation({
        mutationFn: async (newTitle, newDescription, newCoverURL) => {
            try {
                const token = await auth.currentUser.getIdToken();
                const { board: newBoard } = await fetchWithError(`${process.env.REACT_APP_API_BASE_URL}/api/boards/edit-board/${board._id}`, {
                    method: 'PATCH',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-type': 'application/json'
                    },
                    body: JSON.stringify({title: newTitle, description: newDescription, coverURL: newCoverURL})
                })

                return newBoard;
            } catch (err) {
                console.log('Failed to update board:', err);
            }
        },
        onSuccess: (editedBoard) => onSuccess(editedBoard)
    })

    const handleSubmit = async () => {
        if (!title) {
            setError('Title is required');
            return;
        }

        if (mode === 'add') {
            addBoard.mutate(title, description);
        }
        if (mode === 'edit') {
            editBoard.mutate(title, description, coverURL);
        } 
    }

    return (
        <div className='add-board'>
            <div className="popup-overlay"></div>
                <div className="popup-container overlay"> 
                    <div className='popup-content'>
                        <div className='popup-header'>
                            <h1>{mode.includes('edit') ? 'Edit board' : 'New board'}</h1>
                            <div className='close' onClick={close}>
                                <CloseIcon/>
                            </div>
                        </div>
                        {error && <div className='error'>{error}</div>}
                        <div className='label-input'>
                            <label htmlFor='title'>Title</label>
                            <input type='text' 
                                    id='title' 
                                    placeholder='Enter title' 
                                    value={title} 
                                    onChange={e => setTitle(e.target.value)}/>
                        </div>
                        <div className='label-input'>
                            <label htmlFor='description'>Description</label>
                            <textarea id='description' 
                                        className='description' 
                                        rows='4' 
                                        placeholder='Enter description'
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}/>
                        </div>
                        <div className='prev-btns'>
                            <button className='sub-btn bold' 
                                    onClick={handleSubmit}>
                                {mode.includes('edit') ? 'Update board' : 'Add board'}
                            </button>
                            <button className='sub-btn' 
                                    onClick={close}>
                                Cancel
                            </button>
                        </div>
                        {mode.includes('edit') &&
                            <p className='delete-board'>Delete board</p>
                        }
                    </div>
                </div>
        </div>
    )
}

export default AddBoard;