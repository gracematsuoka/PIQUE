import { useMutation, useQueryClient } from "@tanstack/react-query";
import { unlikePost, likePost } from "../../api/boardposts";

export const useToggleLike = () => {
    const queryClient = useQueryClient();
    const query = '';
    return useMutation({
        mutationFn: ({postId, liked}) => {
            liked ? unlikePost(postId) : likePost(postId);
        },
        onSuccess: (_res, {postId, liked, queryKeys = [['posts', query], ['savedPosts', {liked: true}]]}) => {
            queryKeys.forEach(key => 
                queryClient.setQueryData(key, prev => 
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
            )
        }
    })
}