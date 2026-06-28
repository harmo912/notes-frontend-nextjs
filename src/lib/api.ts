import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api',
});

// Intercepteur : à chaque requête, il va chercher le token dans le localStorage
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['Accept'] = 'application/json';
    return config;
});

export default api;