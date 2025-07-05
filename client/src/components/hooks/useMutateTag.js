import { useQueryClient, useMutation } from "@tanstack/react-query";
import { addTags, updateTags, deleteTag } from "../../api/tags";

export const useAddTag = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({tags}) => addTags({tags}),
        onSuccess: (addedTags) => {
            qc.setQueryData(['tags'], prev => [...prev, ...addedTags]);
        }
    })
};

export const useUpdateTag = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({tags}) => updateTags({tags}),
        onSuccess: (updatedTags) => {
            const updatedTagMap = new Map(updatedTags.map(tag => [tag._id, tag]));
            qc.setQueryData(['tags'], (prev = []) =>
                prev.map(tag =>
                    updatedTagMap.has(tag._id) ? updatedTagMap.get(tag._id) : tag
                )
            )
        }
    })
};

export const useDeleteTag = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({tagId}) => deleteTag({tagId}),
        onSuccess: (_res, {tagId}) => {
            qc.setQueryData(['tags'], prev => {
                if (!prev) return [];
                return prev.filter(tag => tag._id !== tagId);
            })
        }
    })
}