import { useInfiniteQuery } from "@tanstack/react-query"
import { fetchBoardPosts } from "../../api/boardposts"
import { useBoard } from "./useBoard";

export const useSavedPosts = (boardId) => {
    const { data: boards = [], isLoading } = useBoard();
    console.log('boards:', boards)
    const boardIds = boards.map(board => board._id);
    console.log('boardids:', boardIds)

    return useInfiniteQuery({
        queryKey: (['savedPosts', boardId]),
        enabled: !!boardId && boardIds.length > 0 && !isLoading,
        queryFn: ({pageParam = null}) => fetchBoardPosts({cursor: pageParam, boardId, boardIds}),
        getNextPageParam: last => last.nextCursor ?? undefined
    })
}