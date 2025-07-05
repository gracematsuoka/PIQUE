import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchPosts } from "../../api/boardposts";
import { useBoard } from "./useBoard";

export const usePost = ({query}) => {
    const { data: boards = [] } = useBoard();
    const boardIds = boards.map(board => board._id);

    return useInfiniteQuery({
        queryKey: ['posts', query],
        queryFn: ({ pageParam = null }) => fetchPosts({cursor: pageParam, boardIds, query}),
        getNextPageParam: last => last.nextCursor ?? undefined
    })
}