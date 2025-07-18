import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProjectsPage from './pages/ProjectsPage';
import DevConnectLandingPage from './pages/landing';
import Register from './pages/auth/register';
import Login from './pages/auth/login';
import ChatPage from './pages/ChatPage';
import Dashboard from './pages/dashboard';
import './App.css';
import CommunitiesPage from './pages/community';
import Profile from './pages/Profile';
import ChatSpace from './pages/communities/ChatSpace';
import ManageCommunity from './pages/communities/ManageCommunity';

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
        <Route path="/communities/chat/:id" element={<ChatSpace />} />
        <Route path="/communities/manage/:id" element={<ManageCommunity />} />
        <Route path="/my_profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;