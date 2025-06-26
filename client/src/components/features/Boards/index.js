import './index.scss';
import outfit from '../../../assets/images/home/testoutfit.jpg';
import EditIcon from '@mui/icons-material/Edit';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import { useEffect, useState } from 'react';
import { Bouncy } from 'ldrs/react';
import AddBoard from '../../popups/AddBoard';
import { getAuth } from 'firebase/auth';
import defaultCover from '../../../assets/images/home/pique_hold.png';

const Boards = () => {
    const [empty, setEmpty] = useState(true);
    const [loading, setLoading] = useState(false);
    const [showAddBoard, setShowAddBoard] = useState(false);
    const [showEditBoard, setShowEditBoard] = useState(false);
    const [selectedBoard, setSelectedBoard] = useState(null);
    const [boards, setBoards] = useState([])

    useEffect(() => {
        const fetchBoards = async () => {
            setLoading(true);
            const auth = getAuth();
            const token = await auth.currentUser.getIdToken();

            try {
                const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/boards/get-boards`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })

                const data = await res.json();
                setBoards(data.boards);
                setLoading(false);
            } catch (err) {
                console.log('Failed to get boards:', err);
            }
        }

        fetchBoards();
    }, [])

    return (
        <div className="boards">
            <Tooltip title='New board'>
            <div className="add" onClick={() => setShowAddBoard(true)} >
                <AddIcon/>
            </div>
            </Tooltip>
            {showAddBoard && 
                <AddBoard 
                    setShowAddBoard={setShowAddBoard}
                    mode='add'
                    setBoards={setBoards}
                />}
            {showEditBoard &&
                <AddBoard
                    setShowEditBoard={setShowEditBoard}
                    mode='edit'
                    board={selectedBoard}
                    setBoards={setBoards}
                />
            }
        {loading ? (
            <Bouncy
                size="45"
                speed="1.75"
                color="#6B799F"
                />
        ) : boards.length > 0 ? (
            boards.map(board => 
                <div className="board" key={board._id}>
                    <img src={board?.coverURL || defaultCover}/>
                    <div className="board-title">
                        <div className="h1-wrap">
                            <h1>{board.title.toUpperCase()}</h1>
                        </div>
                        <p>{board.postIds.length} Saved</p>
                    </div>
                    <Tooltip title='Edit board'>
                    <div className="edit" 
                        onClick={() => {
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