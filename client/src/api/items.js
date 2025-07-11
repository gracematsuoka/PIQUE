import { auth } from "../firebase";
import { fetchWithError } from "../utils/fetchWithError";

export const fetchItems = async ({tab, cursor, query, filters}) => {
    const params = new URLSearchParams();

    if (query) params.append('q', query);
    if (filters.colors?.length) filters.colors.forEach(color => params.append('color', color));
    if (filters.categories?.length) filters.categories.forEach(category => params.append('category', category));
    if (filters.tags?.length) filters.tags.forEach(tag => params.append('tag', tag));
    if (filters.styles?.length) filters.styles.forEach(style => params.append('style', style));

    try {
        const token = await auth.currentUser.getIdToken();
        const data = await fetchWithError(`${process.env.REACT_APP_API_BASE_URL}/api/useritems/get-items?${params.toString()}&tab=${tab}&limit=20&${cursor ? `cursor=${cursor}` : ''}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        return data;
    } catch (err) {
        console.error('Failed to fetch:', err.message);
    }
}

export const fetchSelectedItem = async ({itemId}) => {
    try {
        const token = await auth.currentUser.getIdToken();
        const {item} = await fetchWithError(`${process.env.REACT_APP_API_BASE_URL}/api/useritems/${itemId}/get-item`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        return item;
    } catch (err) {
        console.error('Failed to fetch:', err.message);
    }
}

export const deleteItem = async ({itemId}) => {
    try {
        const token = await auth.currentUser.getIdToken();

        await fetchWithError(`${process.env.REACT_APP_API_BASE_URL}/api/useritems/delete-item?itemId=${itemId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    } catch (err) {
        console.error('Failed to fetch:', err.message);
    }
}

export const createItem = async ({name, colors, category, brand, price, link, tags, tab, processedUrl, pref}) => {
    try {
        console.log('proc url', processedUrl)
        const imageURL = await getImageURL({processedUrl});
        console.log('img url', imageURL)
        const token = await auth.currentUser.getIdToken();

        const {userItem} = await fetchWithError(`${process.env.REACT_APP_API_BASE_URL}/api/useritems/create-item`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                name, 
                colors,
                category,
                brand,
                price,
                link,
                tags,
                tab,
                imageURL,
                pref
            })
        });

        return userItem;
    } catch (err) {
        console.error('Failed to fetch:', err.message);
    }
}

export const createUserCopy = async ({itemRefs, tab}) => {
    try {
        const token = await auth.currentUser.getIdToken();

        const {addedItems} = await fetchWithError(`${process.env.REACT_APP_API_BASE_URL}/api/useritems/create-user-copy`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({itemRefs, tab})
        });

        return addedItems;
    } catch (err) {
        console.error('Failed to fetch:', err.message);
    }
}

export const getImageURL = async ({processedUrl}) => {
    try {
        const {uploadURL} = await fetchWithError(`${process.env.REACT_APP_API_BASE_URL}/api/images/get-upload-url`);
        console.log('upl url', uploadURL)

        const res = await fetch(processedUrl);

        if (!res.ok) throw new Error('Failed to fetch');

        const blob = await res.blob();
        const formData = new FormData();
        formData.append('file', blob);

        const data = await fetchWithError(uploadURL, {
            method: 'POST',
            body: formData
        });

        const imageId = data.result?.id;
        const publicURL = `https://imagedelivery.net/${process.env.REACT_APP_CF_HASH}/${imageId}/public`;
        return publicURL;
    } catch (err) {
        console.error('Failed to fetch:', err.message);
    }
}

export const updateItems = async ({itemId, changedField}) => {
    try {
        const token = await auth.currentUser.getIdToken();

        const {updatedItem} = await fetchWithError(`${process.env.REACT_APP_API_BASE_URL}/api/useritems/update-item/${itemId}`, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(changedField)
        })

        return updatedItem;
    } catch (err) {
        console.error('Failed to fetch:', err.message);
    }
}