import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProjectsPage from './pages/ProjectsPage';
import DevConnectLandingPage from './pages/landing';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DevConnectLandingPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
