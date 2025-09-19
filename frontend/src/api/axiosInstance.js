// src/axiosInstance.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // doit déjà inclure /api dans Vercel env
  headers: {
    'Content-Type': 'application/json',
  },
});

// 👉 Debug : voir si la variable est bien injectée par Vercel
console.log("🔗 API Base URL =", import.meta.env.VITE_API_URL);

// Middleware pour ajouter le token JWT si existant
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default axiosInstance;
