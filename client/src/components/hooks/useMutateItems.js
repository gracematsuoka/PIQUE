import { useQueryClient, useMutation } from "@tanstack/react-query";
import { createItem, updateItems, deleteItem, createUserCopy } from "../../api/items";

export const useCreateItem = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({name, colors, category, brand, price, link, tags, tab, processedUrl, pref}) => {
            return createItem({name, colors, category, brand, price, link, tags, tab, processedUrl, pref})
        },
        onSuccess: (userItem, vars) => {
            const {tab} = vars;
            console.log('created', userItem) 
            console.log('tab', tab)
            qc.setQueriesData({queryKey: ['items', tab], exact: false}, prev => 
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
        onSuccess: (userItems, vars) => {
            const {tab} = vars;
            qc.setQueriesData({queryKey: ['items', tab], exact: false}, prev => 
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
            qc.setQueriesData({queryKey: ['items', tab], exact: false}, prev => 
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