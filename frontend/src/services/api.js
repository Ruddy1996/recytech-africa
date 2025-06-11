// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // proxy redirige vers localhost:5000
});

export default api;
