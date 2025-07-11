import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProjectsPage from './pages/ProjectsPage';
import DevConnectLandingPage from './pages/landing';
import Register from './pages/auth/register';
import Login from './pages/auth/login';
import ChatPage from './pages/ChatPage';
import Dashboard from './pages/dashboard';
import './App.css';
import CommunitiesPage from './pages/community';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DevConnectLandingPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login/>} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/community" element={<CommunitiesPage />} />
      </Routes>
    </Router>
  );
}

export default App;