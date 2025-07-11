export async function fetchWithError(url, options = {}) {
    const res = await fetch(url, options);

    if (!res.ok) {
        const contentType = res.headers.get('content-type');
        let message;

        if (contentType && contentType.includes('application/json')) {
            const data = await res.json();
            message = data.error || JSON.stringify(data);
        } else {
            message = await res.text();
        }

        throw new Error(`Error ${res.status}: ${message}`);
    }

    if (res.status === 204) {
        return null;
    }
    
    return await res.json(); 
}
  