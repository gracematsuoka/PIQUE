import { useEffect, useState } from 'react';
import './index.scss';
import { getAuth } from 'firebase/auth';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import Tooltip from '@mui/material/Tooltip';

const BoardSave = ({
    postId,
    setBoardData,
    boardData,
    removePost,
    addPost,
    setShowAddBoard
    }) => {

    return (
        <div className='board-save'>
            {boardData.map(board => 
                <div className='board-item' key={board._id}>
                    <p>{board.title.toUpperCase()}</p>
                    {board.exists ?
                        <Tooltip title='Remove from board'>
                        <div className='icon-circle' key={board._id + '-' + board.exists} onClick={() => removePost(board._id)}>
                            <RemoveIcon/>
                        </div>
                        </Tooltip> :
                        <Tooltip title='Add to board'>
                        <div className='icon-circle' key={board._id + '-' + board.exists} onClick={() => addPost(board._id)}>
                            <AddIcon/>
                        </div>
                        </Tooltip>
                    }
                </div>
            )}
            <div className='sub-btn new-board' onClick={() => setShowAddBoard(true)}>
                <p>Create board</p>
            </div>
        </div>
    )
}

export default BoardSave;