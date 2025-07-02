import { useQuery } from "@tanstack/react-query";
import { fetchTags } from "../../api/tags";

export const useTag = () => {
    return useQuery({
        queryKey: ['tags'],
        queryFn: fetchTags
    })
}