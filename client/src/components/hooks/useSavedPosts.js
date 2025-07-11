import { useInfiniteQuery } from "@tanstack/react-query"
import { fetchBoardPosts } from "../../api/boardposts"
import { useBoard } from "./useBoard";

export const useSavedPosts = ({boardId, liked, userId}) => {
    const { data: boards = [], isLoading } = useBoard();
    const boardIds = boards.map(board => board._id);

    return useInfiniteQuery({
        queryKey: (['savedPosts', {boardId, liked, userId}]),
        enabled: (!!boardId || liked || userId) && !isLoading,
        queryFn: ({pageParam = null}) => fetchBoardPosts({cursor: pageParam, boardId, liked, userId, boardIds}),
        getNextPageParam: last => last.nextCursor ?? undefined
    })
}