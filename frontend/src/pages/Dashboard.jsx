import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState({ totalTasks: 0, completedTasks: 0, overdueTasks: 0 });
  const [projects, setProjects] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [loading, setLoading] = useState(true);
  
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const [statsRes, projectsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/dashboard', config),
        axios.get('http://localhost:5000/api/projects', config)
      ]);
      setStats(statsRes.data);
      setProjects(projectsRes.data);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('http://localhost:5000/api/projects', { name: newProjectName, members: [user._id] }, config);
      setShowCreateModal(false);
      setNewProjectName('');
      fetchData();
    } catch (error) {
      console.error('Failed to create project', error);
    }
  };

  if (loading) return <div className="container" style={{ marginTop: '2rem' }}>Loading dashboard...</div>;

  return (
    <div className="container">
      <div className="dashboard-header">
        <h2>Welcome back, {user.name}</h2>
      </div>
      
      <div className="stats-grid">
        <div className="card stat-card">
          <h3>{stats.totalTasks}</h3>
          <p>Total Tasks</p>
        </div>
        <div className="card stat-card">
          <h3 style={{ color: 'var(--kanban-done-text)' }}>{stats.completedTasks}</h3>
          <p>Completed Tasks</p>
        </div>
        <div className="card stat-card">
          <h3 style={{ color: 'var(--kanban-midway-text)' }}>{stats.overdueTasks}</h3>
          <p>Overdue Tasks</p>
        </div>
      </div>

      <div className="dashboard-header" style={{ marginTop: '3rem' }}>
        <h2>Your Projects</h2>
        {user.role === 'Admin' && (
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>+ New Project</button>
        )}
      </div>

      {showCreateModal && (
        <div className="card" style={{ marginBottom: '2rem', maxWidth: '400px' }}>
          <h4 style={{ marginBottom: '1rem' }}>Create New Project</h4>
          <form onSubmit={handleCreateProject}>
            <div className="form-group">
              <label>Project Name</label>
              <input type="text" value={newProjectName} onChange={e => setNewProjectName(e.target.value)} required />
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="submit" className="btn-primary">Create</button>
              <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="project-grid">
        {projects.map(project => (
          <div key={project._id} className="card project-card" onClick={() => navigate(`/projects/${project._id}`)}>
            <div className="project-card-header">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{project.name}</h3>
              <span style={{ color: 'var(--text-secondary)', fontSize: '1.25rem' }}>→</span>
            </div>
            <div className="project-meta">
              <span className="meta-pill">👥 {project.memberCount} Members</span>
              <span className="meta-pill">📋 {project.taskCount} Tasks</span>
            </div>
          </div>
        ))}
        {projects.length === 0 && <p>No projects found. Create one to get started.</p>}
      </div>
    </div>
  );
};

export default Dashboard;
