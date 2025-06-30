import { addPost, removePost } from "../../api/boardposts";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useToggleBoard = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({boardId, postId, remove}) => {
            remove ? removePost(boardId, postId) : addPost(boardId, postId);
        },
        onSuccess: (_res, {boardId, postId, remove}) => {
            qc.setQueryData(['posts'], prev =>
                prev && {
                    ...prev, 
                    pages: prev.pages.map(page => ({
                        ...page,
                        postData: page.postData.map(post =>
                            post._id === postId ? {
                                ...post,
                                savedBoards: remove ? 
                                    post.savedBoards.filter(id => id != boardId) :
                                    [...post.savedBoards, boardId]
                            } : post
                        )
                    }))
                }
            )
        }
    })
}