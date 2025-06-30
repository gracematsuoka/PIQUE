import { useParams } from 'react-router-dom';
import './index.scss';
import SearchBar from '../../reusable/SearchBar';
import { useEffect, useState, useRef } from 'react';
import { auth } from '../../../firebase';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { usePosts } from '../../hooks/useBoardPosts';
import AddBoard from '../../popups/AddBoard';
import PostDetails from '../../popups/PostDetails';
import BoardSave from '../../popups/BoardSave';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { Bouncy } from 'ldrs/react';
import EditIcon from '@mui/icons-material/Edit';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const Board = () => {
    // const {
    //     posts,
    //     cursor,
    //     boardData,
    //     setBoardData,
    //     hasMore,
    //     activePostId,
    //     loading,
    //     fetchBoards,
    //     fetchPosts,
    //     fetchBoardPosts,
    //     handleLike,
    //     handleOpen,
    //     removePost,
    //     addPost
    // } = usePosts();

    // const {boardId} = useParams();
    // const sentinelRef = useRef(null);
    // const [board, setBoard] = useState([]);
    // const [showAddBoard, setShowAddBoard] = useState(false);
    // const [selectedPost, setSelectedPost] = useState(null);
    // const [showEditBoard, setShowEditBoard] = useState(false);

    // useEffect(() => {
    //     if (!boardId || !auth.currentUser) return;

    //     const fetchBoard = async () => {
    //         try {
    //             const token = await auth.currentUser.getIdToken();
    //             const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/boards/${boardId}/board`, {
    //                 headers: {
    //                     Authorization: `Bearer ${token}`
    //                 }
    //             });

    //             const data = await res.json();
    //             setBoard(data);
    //         } catch (err) {
    //             console.log('Failed to fetch board data:', err);
    //         }
    //     }
    //     fetchBoard();
    //     fetchBoards();
    // }, [boardId]);

    // useEffect(() => {
    //     if (!hasMore) return;

    //     console.log('running')
    //     const observer = new IntersectionObserver(
    //         ([entry]) => {
    //             if (entry.isIntersecting) {
    //                 fetchBoardPosts(boardId);
    //             }
    //         },
    //         {
    //             root: null,
    //             rootMargin: '0px',
    //             threshold: 1.0
    //         }
    //     )
    //     if (sentinelRef.current){
    //         observer.observe(sentinelRef.current)
    //     };

    //     return () => observer.disconnect();
    // }, [hasMore]);

    // return (
    //     <div className="board-page">
    //                 {showAddBoard &&
    //                     <AddBoard
    //                         mode='add-explore'
    //                         setShowAddBoard={setShowAddBoard}
    //                         setBoardData={setBoardData}
    //                     />
    //                 }
    //                 {selectedPost && 
    //                     <PostDetails
    //                         selectedPost={selectedPost}
    //                         setSelectedPost={setSelectedPost}
    //                         handleLike={handleLike}
    //                 />}
    //                 {showEditBoard &&
    //                     <AddBoard
    //                         setShowEditBoard={setShowEditBoard}
    //                         mode='edit-board'
    //                         board={board}
    //                         setBoard={setBoard}
    //                     />
    //                 }
    //                 <div className="nav-content-wrapper">
    //                     <div className='board-header'>
    //                         <div className='board-title-edit'>
    //                             <h1>{board?.title?.toUpperCase()}</h1>
    //                             <EditIcon onClick={() => setShowEditBoard(true)}/>
    //                         </div>
    //                         <div className='numsaved'>
    //                             <AttachFileIcon/>
    //                             <p>{board?.numSaved} Saved</p>
    //                         </div>
    //                         <p className='board-desc'>{board?.description}</p>
    //                     </div>
    //                     <div className="search-bar-wrapper">
    //                         <SearchBar/>
    //                     </div>
    //                     {loading ? (
    //                         <Bouncy
    //                             size="45"
    //                             speed="1.75"
    //                             color="#6B799F"
    //                         /> 
    //                     ) : (
    //                         posts.length > 0 ? (
    //                             <div className='posts'>
    //                                 {posts.map(post => 
    //                                     <div className='post' key={post._id}>
    //                                         <img src={post.postURL} onClick={() => {
    //                                             setSelectedPost(post);
    //                                         }}/>
    //                                         <div className={`post-save-bar ${activePostId === post._id ? 'active' : ''}`}>
    //                                             <div className="like-btn" 
    //                                                 onClick={() => handleLike(post._id)}>
    //                                                 {!post.likedByUser && <FavoriteBorderIcon/>}
    //                                                 {post.likedByUser && <FavoriteIcon style={{fill: '#c23b0e'}}/>}
    //                                                 <p>{post.likes}</p>
    //                                             </div>
    //                                             <div className="save-btn" 
    //                                                 onClick={() =>  {
    //                                                     handleOpen(post._id);
    //                                                 }}>
    //                                                 {activePostId === post._id ?
    //                                                     <RemoveIcon/> :
    //                                                     <AddIcon/> 
    //                                                 }
    //                                                 <p>SAVE</p>
    //                                             </div>
    //                                         </div>
    //                                         {activePostId === post._id && 
    //                                             <BoardSave 
    //                                                 className='board-save'
    //                                                 postId={activePostId}
    //                                                 boardData={boardData}
    //                                                 setBoardData={setBoardData}
    //                                                 removePost={removePost}
    //                                                 addPost={addPost}
    //                                                 setShowAddBoard={setShowAddBoard}
    //                                             />
    //                                         }
    //                                     </div>
    //                                 )}
    //                             </div>
    //                         ) : (
    //                             <div className='empty'>
    //                                 <p>You have no saved posts yet...</p>
    //                                 <div className='empty-h1'>
    //                                     <h1>Click <i>'Explore'</i> to get started</h1>
    //                                 </div>
    //                             </div>
    //                         ))}
    //                     {hasMore && 
    //                         <div ref={sentinelRef}/>
    //                     }
    //                 </div>
    //             </div>
    // )
}

export default Board;