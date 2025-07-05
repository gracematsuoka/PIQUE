import { auth } from "../firebase";

export const fetchItems = async ({tab, cursor, query, filters}) => {
    const params = new URLSearchParams();

    if (query) params.append('q', query);
    if (filters.colors?.length) filters.colors.forEach(color => params.append('color', color));
    if (filters.categories?.length) filters.categories.forEach(category => params.append('category', category));
    if (filters.tags?.length) filters.tags.forEach(tag => params.append('tag', tag));
    if (filters.styles?.length) filters.styles.forEach(style => params.append('style', style));

    try {
        const token = await auth.currentUser.getIdToken();
        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/useritems/get-items?${params.toString()}&tab=${tab}&limit=20&${cursor ? `cursor=${cursor}` : ''}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!res.ok) console.log('error', res.status, res.text())
        const data = await res.json();
        return data;
    } catch (err) {
        console.log('Failed to fetch closet:', err);
        throw err;
    } 
}

export const fetchSelectedItem = async ({itemId}) => {
    try {
        const token = await auth.currentUser.getIdToken();
        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/useritems/${itemId}/get-item`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const {item} = await res.json();
        return item;
    } catch (err) {
        console.log('Failed to fetch closet:', err);
        throw err;
    } 
}

export const deleteItem = async ({itemId}) => {
    const token = await auth.currentUser.getIdToken();

    await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/useritems/delete-item?itemId=${itemId}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}

export const createItem = async ({name, colors, category, brand, price, link, tags, tab, processedUrl}) => {
    const imageURL = await getImageURL({processedUrl});
    const token = await auth.currentUser.getIdToken();

    const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/useritems/create-item`, {
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
            imageURL
        })
    });

    const { userItem } = await res.json();
    return userItem;
}

export const createUserCopy = async ({itemRefs, tab}) => {
    const token = await auth.currentUser.getIdToken();

    const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/useritems/create-user-copy`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({itemRefs, tab})
    });

    const { addedItems } = await res.json();
    return addedItems;
}

export const getImageURL = async ({processedUrl}) => {
    try {
        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/images/get-upload-url`);
        const {uploadURL} = await res.json();
        const blob = await fetch(processedUrl).then(res => res.blob());

        const formData = new FormData();
        formData.append('file', blob);

        const uploadRes = await fetch(uploadURL, {
            method: 'POST',
            body: formData
        });

        const data = await uploadRes.json();
        const imageId = data.result?.id;
        const publicURL = `https://imagedelivery.net/${process.env.REACT_APP_CF_HASH}/${imageId}/public`;
        return publicURL;
    } catch (err) {
        console.log('Failed to save image to cf:', err);
        throw err;
    }
}

export const updateItems = async ({itemId, changedField}) => {
    const token = await auth.currentUser.getIdToken();

    const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/useritems/update-item/${itemId}`, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(changedField)
    })

    console.log('status:', res.status)

    if (!res.ok) {
        const errText = await res.text();
        console.error('Backend error:', res.status, errText)
    }

    const {updatedItem} = await res.json();
    console.log('fetched update', updatedItem)
    return updatedItem;
}