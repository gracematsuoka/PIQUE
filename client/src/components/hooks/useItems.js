import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchItems } from "../../api/items";

export const useItems = (tab) => {
    return useInfiniteQuery({
        queryKey: ['items', tab],
        queryFn: ({pageParam = null}) => fetchItems({cursor: pageParam, tab}),
        getNextPageParam: last => last.cursor ?? undefined,
        keepPreviousData: true
    })
}