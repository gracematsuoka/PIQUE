import { addPost, removePost } from "../../api/boardposts";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useToggleBoard = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({boardId, postId, remove}) => {
            return remove ? removePost(boardId, postId) : addPost(boardId, postId);
        },
        onMutate: async ({boardId, postId, remove, queryKeys = [['posts']]}) => {
            await qc.cancelQueries();

            const prevPosts = queryKeys.forEach(key => [key, qc.getQueryData(key)]);
            const prevBoards = qc.getQueryData(['boards']);

            queryKeys.forEach(key =>
                qc.setQueryData(key, prev =>
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
            );

            qc.setQueryData(['boards'], prev => 
                prev.map(board => 
                    board._id === boardId ? 
                        {
                            ...board, 
                            numSaved: remove ? board.numSaved - 1 : board.numSaved + 1
                        } : board
                )
            );

            return { prevPosts, prevBoards };
        },
        onSuccess: (newCoverRef, { boardId }) => {
            qc.setQueryData(['boards'], prev => 
                prev.map(board => 
                    board._id === boardId ? 
                        {
                            ...board, 
                            coverRef: typeof newCoverRef !== 'undefined' ? newCoverRef : board.coverRef
                        } : board
                )
            );
        },
        onError: (_err, _vars, context) => {
            if (context?.prevPosts) {
                context.prevPosts.forEach(([key, data]) => qc.setQueryData(key, data));
            }
            if (context?.prevBoards) {
                qc.setQueryData(['boards'], context.prevBoards)
            }
        }
    })
}