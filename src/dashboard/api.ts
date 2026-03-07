const BASE = 'http://localhost:5000';

function authHeaders() {
    const token = localStorage.getItem('nickle_token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

async function apiFetch(path: string, opts: RequestInit = {}) {
    const res = await fetch(`${BASE}${path}`, {
        ...opts,
        headers: { ...authHeaders(), ...(opts.headers || {}) },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
}

export const api = {
    get: (path: string) => apiFetch(path, { method: 'GET' }),
    post: (path: string, body: object) =>
        apiFetch(path, { method: 'POST', body: JSON.stringify(body) }),
};
