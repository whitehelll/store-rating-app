import axios from 'axios';
import { useEffect, useState } from 'react';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    // Expired session on a protected call: clear and send back to login.
    if (err.response?.status === 401 && localStorage.getItem('token')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.assign('/login');
    }
    return Promise.reject(err);
  }
);

export const errorMessage = (e) => e.response?.data?.message || 'Could not reach the server.';

// Fetch with a short debounce so typing in filters doesn't fire a request per key.
export function useFetch(path, params = {}) {
  const key = JSON.stringify(params);
  const [state, setState] = useState({ data: null, loading: true, error: '' });
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let live = true;
    const t = setTimeout(() => {
      api.get(path, { params })
        .then((r) => live && setState({ data: r.data, loading: false, error: '' }))
        .catch((e) => live && setState({ data: null, loading: false, error: errorMessage(e) }));
    }, 250);
    return () => { live = false; clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, key, tick]);
  return { ...state, reload: () => setTick((n) => n + 1) };
}

export default api;
