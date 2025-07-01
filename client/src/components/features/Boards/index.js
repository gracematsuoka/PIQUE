import './index.scss';
import outfit from '../../../assets/images/home/testoutfit.jpg';
import EditIcon from '@mui/icons-material/Edit';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import { useState } from 'react';
import { Bouncy } from 'ldrs/react';
import AddBoard from '../../popups/AddBoard';
import defaultCover from '../../../assets/images/home/pique_hold.png';
import grey from '../../../assets/images/home/grey.png';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import ErrorIcon from '@mui/icons-material/Error';
import { useBoard } from '../../hooks/useBoard';


const Boards = () => {
    const [showAddBoard, setShowAddBoard] = useState(false);
    const [showEditBoard, setShowEditBoard] = useState(false);
    const [selectedBoard, setSelectedBoard] = useState(null);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const {
        data: boards = [],
        isLoading,
        isError,
        error,
    } = useBoard();

    if (isError) {
        return (
            <div className='query-error'>
                <div className='error-wrapper'>
                    <ErrorIcon/>
                    <h1>Error: {error.message}</h1>
                </div>
            </div>
        )
    }

    return (
        <div className="boards">
            <Tooltip title='New board'>
            <div className="add" onClick={() => setShowAddBoard(true)} >
                <AddIcon/>
            </div>
            </Tooltip>
            {showAddBoard && 
                <AddBoard 
                    mode='add'
                    close={() => setShowAddBoard(false)}
                    onSuccess={(newBoard) => {
                        setShowAddBoard(false);
                        queryClient.setQueryData(['boards'], prev => [...prev, newBoard]);
                    }}
                />}
            {showEditBoard &&
                <AddBoard
                    mode='edit'
                    board={selectedBoard}
                    close={() => setShowEditBoard(false)}
                    onSuccess={(newBoard) => {
                        setShowEditBoard(false);
                        queryClient.setQueryData(['boards'], 
                            prev => (prev.map(board => 
                                board._id === newBoard._id ? newBoard : board))
                    )}}
                />
            }
        {isLoading ? (
            <Bouncy
                size="45"
                speed="1.75"
                color="#6B799F"
                />
        ) : boards?.length > 0 ? (
            boards.map(board => 
                <div className="board" 
                    key={board._id} 
                    onClick={(e) => {
                        navigate(`/saved/boards/${board._id}`)
                    }}>
                    <img src={board?.coverRef?.postURL || grey}/>
                    <div className="board-title">
                        <div className="h1-wrap">
                            <h1>{board.title.toUpperCase()}</h1>
                        </div>
                        <p>{board.numSaved} Saved</p>
                    </div>
                    <Tooltip title='Edit board'>
                    <div className="edit" 
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBoard(board);
                            setShowEditBoard(true);
                    }}>
                        <EditIcon/>
                    </div>
                    </Tooltip>
                </div>
            )
        ) : (
            <div className='empty'>
                <p>You have no boards yet...</p>
                <div className='empty-h1'>
                    <h1>Click + to get started</h1>
                </div>
            </div>
        )}
    </div>
    )
}

export default Boards;