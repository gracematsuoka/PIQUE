import { useInfiniteQuery } from "@tanstack/react-query"
import { fetchBoardPosts } from "../../api/boardposts"
import { useBoard } from "./useBoard";

export const useSavedPosts = ({boardId, liked}) => {
    console.log('liked:', liked)
    const { data: boards = [], isLoading } = useBoard();
    const boardIds = boards.map(board => board._id);

    return useInfiniteQuery({
        queryKey: (['savedPosts', {boardId, liked}]),
        enabled: (!!boardId || liked) && boardIds.length > 0 && !isLoading,
        queryFn: ({pageParam = null}) => fetchBoardPosts({cursor: pageParam, boardId, liked, boardIds}),
        getNextPageParam: last => last.nextCursor ?? undefined
    })
}