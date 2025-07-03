import { useQueryClient, useMutation } from "@tanstack/react-query";
import { createItem, updateItems, deleteItem, createUserCopy } from "../../api/items";

export const useCreateItem = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({name, colors, category, brand, price, link, tags, tab, processedUrl}) => {
            return createItem({name, colors, category, brand, price, link, tags, tab, processedUrl})
        },
        onSuccess: (userItem, {tab}) => {
            console.log('created', userItem)
            qc.setQueryData(['items', tab], prev => 
                prev && {
                    ...prev,
                    pages: prev.pages.map((page, index) => {
                        if (index === 0) {
                            return {
                                ...page,
                                items: [userItem, ...page.items]
                            }
                        }
                        return page;
                    })
                }
            )
        }
    })
}

export const useCreateCopy = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({itemRefs, tab}) => {
            return createUserCopy({itemRefs, tab});
        },
        onSuccess: (userItems, {tab}) => {
            console.log('added', userItems)
            qc.setQueryData(['items', tab], prev => 
                prev && {
                    ...prev,
                    pages: prev.pages.map((page, index) => {
                        if (index === 0) {
                            return {
                                ...page,
                                items: [...userItems, ...page.items]
                            }
                        }
                        return page;
                    })
                }
            )
            console.log('qc data', qc.getQueryData(['items', tab]))
        }
    })
}

export const useUpdateItem = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({itemId, changedField}) => updateItems({itemId, changedField}),
        onSuccess: (updatedItem, vars) => {
            console.log('updated item', updatedItem)
            const {tab} = vars
            qc.setQueryData(['items', tab], prev => 
                prev && {
                    ...prev, 
                    pages: prev.pages.map(page => ({
                        ...page,
                        items: page.items.map(item =>
                            item._id === updatedItem._id ? updatedItem : item
                        )
            }))})
        }
    })
}

export const useDeleteItem = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({itemId}) => deleteItem({itemId}),
        onSuccess: (_res, {itemId, tab}) => {
            qc.setQueryData(['items', tab], prev => 
                prev && {
                    ...prev, 
                    pages: prev.pages.map(page => ({
                        ...page,
                        items: page.items.filter(item => item._id !== itemId)
                }))
        }
    )}})
}