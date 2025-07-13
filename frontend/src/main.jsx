import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import axios from 'axios';


axios.defaults.baseURL = import.meta.env.VITE_API_KEY;
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';

axios.interceptors.request.use(config => {
  config.headers['Accept'] = 'application/json';
  return config;
});

createRoot(document.getElementById('root')).render(
   
    <App />
   
)
