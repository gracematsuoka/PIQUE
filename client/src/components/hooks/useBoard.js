import { useQuery } from "@tanstack/react-query";
import { fetchBoards } from "../../api/boardposts";

export const useBoard = () => {
    return useQuery({
        queryKey: ['boards'],
        queryFn: fetchBoards
    })
}