import './index.scss';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import Tooltip from '@mui/material/Tooltip';
import { useToggleBoard } from '../../hooks/useToggleBoard';

const BoardSave = ({
    postId,
    savedBoards,
    boards,
    setShowAddBoard
    }) => {

    const { mutate } = useToggleBoard();
    console.log('postid', postId)
    console.log('saved boards', savedBoards)

    return (
        <div className='board-save'>
            {boards.map(board => 
                <div className='board-item' key={board._id}>
                    <p>{board.title.toUpperCase()}</p>
                    {savedBoards.includes(board._id) ?
                        <Tooltip title='Remove from board'>
                        <div className='icon-circle' 
                            key={board._id + '-' + board.exists} 
                            onClick={() => mutate({boardId: board._id, postId, remove: true})}>
                            <RemoveIcon/>
                        </div>
                        </Tooltip> :
                        <Tooltip title='Add to board'>
                        <div className='icon-circle' 
                            key={board._id + '-' + board.exists} 
                            onClick={() => mutate({boardId: board._id, postId, remove: false})}>
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