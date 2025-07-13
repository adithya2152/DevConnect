import axios from "axios";

// src/api.js
const api = axios.create({
  baseURL: 'https://devconnect-a8lf.onrender.com/api', // Note /api prefix
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add path normalization
api.interceptors.request.use(config => {
  // Remove double slashes
  config.url = config.url.replace(/([^:]\/)\/+/g, '$1');
  return config;
});