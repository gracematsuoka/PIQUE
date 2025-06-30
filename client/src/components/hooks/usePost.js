import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchPosts } from "../../api/boardposts";
import { useBoard } from "./useBoard";

export const usePost = () => {
    const { data: boards = [] } = useBoard();
    const boardIds = boards.map(board => board._id);

    return useInfiniteQuery({
        queryKey: ['posts'],
        queryFn: ({ pageParam = null }) => fetchPosts({cursor: pageParam, boardIds}),
        getNextPageParam: last => last.nextCursor ?? undefined
    })
}