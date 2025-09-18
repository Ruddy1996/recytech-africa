import axios from 'axios';

const axiosInstance = axios.create({
  //baseURL: 'http://localhost:5000/api',
  //baseURL: "https://recytech-africa-production.up.railway.app/api",
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Middleware pour ajouter le token JWT si existant
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default axiosInstance;
