import './index.scss';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useToggleBoard } from '../../hooks/useToggleBoard';

const BoardSave = ({
    postId,
    savedBoards,
    boards,
    setShowAddBoard,
    queryKey
    }) => {

    const { mutate } = useToggleBoard();

    return (
        <div className='board-save'>
            {boards.map(board => 
                <div className='board-item' key={board._id}>
                    <p>{board.title.toUpperCase()}</p>
                    {savedBoards.includes(board._id) ?
                        <div className='icon-circle' 
                            key={board._id + '-' + board.exists} 
                            onClick={() => 
                                mutate({
                                    boardId: board._id, 
                                    postId, 
                                    remove: true,
                                    queryKey
                                })}>
                            <RemoveIcon/>
                        </div> :
                        <div className='icon-circle' 
                            key={board._id + '-' + board.exists} 
                            onClick={() => 
                                mutate({
                                    boardId: board._id, 
                                    postId, 
                                    remove: false,
                                    queryKey
                                })}>
                            <AddIcon/>
                        </div>
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