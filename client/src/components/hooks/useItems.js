import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchItems } from "../../api/items";

export const useItems = ({tab, query, filters}) => {
    return useInfiniteQuery({
        queryKey: ['items', tab, query, filters],
        queryFn: ({pageParam = null}) => fetchItems({cursor: pageParam, tab, query, filters}),
        getNextPageParam: last => last.cursor ?? undefined,
        keepPreviousData: true
    })
}