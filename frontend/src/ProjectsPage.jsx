import React, { useState } from 'react';
import { projects } from './data/dummy';
import './ProjectsPage.css';

const allTags = Array.from(new Set(projects.flatMap(p => p.tags)));
const allStatuses = Array.from(new Set(projects.map(p => p.status)));

function ProjectsPage() {
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const filteredProjects = projects.filter(project => {
    const tagMatch = selectedTag ? project.tags.includes(selectedTag) : true;
    const statusMatch = selectedStatus ? project.status === selectedStatus : true;
    return tagMatch && statusMatch;
  });

  return (
    <div className="projects-page">
      <header className="projects-header">
        <h1>Collaboration Space</h1>
        <button className="create-project-btn" disabled>
          + Create Project (Coming Soon)
        </button>
      </header>
      <div className="filters">
        <select value={selectedTag} onChange={e => setSelectedTag(e.target.value)}>
          <option value="">All Domains/Skills</option>
          {allTags.map(tag => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
        <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {allStatuses.map(status => (
            <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1) }</option>
          ))}
        </select>
      </div>
      <div className="projects-list">
        {filteredProjects.length === 0 ? (
          <div className="placeholder">No projects found for selected filters.</div>
        ) : (
          filteredProjects.map(project => (
            <div className="project-card" key={project.id}>
              <img src={project.image} alt={project.name} className="project-image" />
              <div className="project-info">
                <h2>{project.name}</h2>
                <p className="project-desc">{project.description}</p>
                <div className="project-tags">
                  {project.tags.map(tag => (
                    <span className="tag" key={tag}>{tag}</span>
                  ))}
                </div>
                <div className="project-meta">
                  <span className={`status ${project.status}`}>{project.status}</span>
                  <span>Created: {project.createdAt}</span>
                  <span>Last Activity: {project.lastActivity}</span>
                </div>
                <div className="contributors">
                  {project.contributors.map(user => (
                    <img key={user.id} src={user.avatar} alt={user.name} title={user.name} className="avatar" />
                  ))}
                </div>
                <button className="join-btn" disabled>
                  Join (Coming Soon)
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="placeholder chatroom-placeholder">
        <strong>Team Chatroom:</strong> Coming soon! Upon joining a project, a chatroom will be auto-generated for collaboration.
      </div>
    </div>
  );
}

export default ProjectsPage; 