import './index.scss';
import CloseIcon from '@mui/icons-material/Close';
import { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';

const AddBoard = ({setShowAddBoard,
                    setShowEditBoard,
                    mode,
                    board,
                    setBoards,
                    setBoardData
                }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [coverURL, setCoverURL] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (mode === 'edit') {
            setTitle(board.title);
            setDescription(board?.description);
            setCoverURL(board?.coverURL);
        }
    }, [])

    const handleSubmit = async () => {
        if (!title) {
            setError('Title is required');
            return;
        }

        mode === 'edit' ? setShowEditBoard(false) : setShowAddBoard(false);
        const auth = getAuth();
        const token = await auth.currentUser.getIdToken();

        if (mode === 'edit') {
            try {
                const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/boards/edit-board/${board._id}`, {
                    method: 'PATCH',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-type': 'application/json'
                    },
                    body: JSON.stringify({title, description, coverURL})
                })

                const data = await res.json();
                const editedBoard = data.board;

                setBoards(prev => prev.map(board => 
                    board._id = editedBoard._id ? editedBoard : board
                ));
            } catch (err) {
                console.log('Failed to update board:', err);
            }
        } else {
            try {
                const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/boards/create-board`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-type': 'application/json'
                    },
                    body: JSON.stringify({title, description})
                })

                const data = await res.json();
                const board = data.board;

                if (mode === 'add') setBoards(prev => [...prev, board]);

                if (mode === 'add-explore') setBoardData(prev => [...prev, {
                    ...board,
                    exists: false
                }])
            } catch (err) {
                console.log('Failed to create board:', err);
            }
        } 
    }

    return (
        <div className='add-board'>
            <div className="popup-overlay"></div>
                <div className="popup-container overlay"> 
                    <div className='popup-content'>
                        <div className='popup-header'>
                            <h1>{mode === 'edit' ? 'Edit board' : 'New board'}</h1>
                            <div className='close' onClick={() => mode === 'edit' ? setShowEditBoard(false) : setShowAddBoard(false)} >
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
                                    onClick={() => {
                                        handleSubmit();
                                    }}>
                                {mode === 'edit' ? 'Update board' : 'Add board'}
                            </button>
                            <button className='sub-btn' 
                                    onClick={() => {
                                            mode === 'edit' ? setShowEditBoard(false) : setShowAddBoard(false)
                            }}>
                                Cancel
                            </button>
                        </div>
                        {mode === 'edit' &&
                            <p className='delete-board'>Delete board</p>
                        }
                    </div>
                </div>
        </div>
    )
}

export default AddBoard;