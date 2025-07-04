import { useParams } from 'react-router-dom';
import './index.scss';
import SearchBar from '../../reusable/SearchBar';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import EditIcon from '@mui/icons-material/Edit';
import { useBoard } from '../../hooks/useBoard';
import Posts from '../../reusable/Posts';
import { useQueryClient } from "@tanstack/react-query";
import { useState } from 'react';
import AddBoard from '../../popups/AddBoard';

const Board = () => {
    const {boardId} = useParams();
    const { data: boards = [], isLoading: boardIsLoading } = useBoard();
    const board = boards.find(board => board._id === boardId);
    const [showEditBoard, setShowEditBoard] = useState(false);
    const queryClient = useQueryClient();

    return (
        <div className="board-page">
            {showEditBoard &&
                <AddBoard
                    mode='edit'
                    board={board}
                    close={() => setShowEditBoard(false)}
                    onSuccess={(newBoard) => {
                        setShowEditBoard(false);
                        queryClient.setQueryData(['boards'], 
                            prev => (prev.map(board => 
                                board._id === newBoard._id ? newBoard : board))
                    )}}
                />
            }
            <div className="nav-content-wrapper">
                <div className='board-header'>
                    <div className='board-title-edit'>
                        <h1>{board?.title?.toUpperCase()}</h1>
                        <EditIcon onClick={() => setShowEditBoard(true)}/>
                    </div>
                    <div className='numsaved'>
                        <AttachFileIcon/>
                        <p>{board?.numSaved} Saved</p>
                    </div>
                    <p className='board-desc'>{board?.description}</p>
                </div>
                {/* <div className="search-bar-wrapper">
                    <SearchBar/>
                </div> */}
                <Posts
                    mode='board'
                    boardId={boardId}
                />
            </div>
        </div>
    )
}

export default Board;