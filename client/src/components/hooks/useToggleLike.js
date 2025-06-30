import { useMutation, useQueryClient } from "@tanstack/react-query";
import { unlikePost, likePost } from "../../api/boardposts";

export const useToggleLike = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({postId, liked}) => {
            liked ? unlikePost(postId) : likePost(postId);
        },
        onSuccess: (_res, {postId, liked}) => {
            queryClient.setQueriesData(['posts'], prev => 
                prev && {
                    ...prev, 
                    pages: prev.pages.map(page => ({
                        ...page,
                        postData: page.postData.map(post =>
                            post._id === postId ? {
                                ...post,
                                likedByUser: !liked,
                                likes: liked ? post.likes - 1 : post.likes + 1
                            } : post
                        )
                    }))
                }
            )
        }
    })
}