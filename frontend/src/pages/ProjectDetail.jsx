import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const COLUMNS = ['To Do', 'In Progress', 'For Review', 'Completed'];

const getStatusClass = (status) => {
  switch(status) {
    case 'To Do': return 'status-todo';
    case 'Started': return 'status-inprogress';
    case 'Midway': return 'status-midway';
    case 'For Review': return 'status-review';
    case 'Completed': return 'status-done';
    default: return 'status-todo';
  }
};

const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [memberProgress, setMemberProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedTasks, setExpandedTasks] = useState({});

  const toggleTaskExpansion = (taskId) => {
    setExpandedTasks(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const getDueDateStatus = (dueDate, status) => {
    if (!dueDate || status === 'Completed') return null;
    const due = new Date(dueDate);
    const today = new Date();
    due.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    
    if (due < today) return 'overdue';
    if (due.getTime() === today.getTime()) return 'today';
    return null;
  };

  // New task form
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', dueDate: '', assignedTo: '' });

  // Add member modal
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');

  const fetchProjectDetails = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.get(`http://localhost:5000/api/projects/${id}`, config);
      setProject(res.data.project);
      setTasks(res.data.tasks);
      setMemberProgress(res.data.memberProgress);
    } catch (error) {
      console.error('Error fetching project', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.get('http://localhost:5000/api/projects/users/all', config);
      setUsers(res.data);
    } catch (error) {
      console.error('Error fetching users', error);
    }
  };

  const openMemberModal = () => {
    setShowMemberModal(true);
    fetchAllUsers();
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(`http://localhost:5000/api/projects/${id}/add-member`, { userId: selectedUserId }, config);
      setShowMemberModal(false);
      setSelectedUserId('');
      fetchProjectDetails();
    } catch (error) {
      console.error('Error adding member', error);
      alert(error.response?.data?.message || 'Failed to add member');
    }
  };

  useEffect(() => {
    if (user) fetchProjectDetails();
  }, [user, id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('http://localhost:5000/api/tasks', {
        ...newTask,
        projectId: id,
        status: 'To Do',
        assignedTo: newTask.assignedTo ? [newTask.assignedTo] : []
      }, config);
      setShowTaskModal(false);
      setNewTask({ title: '', description: '', dueDate: '', assignedTo: '' });
      fetchProjectDetails();
    } catch (error) {
      console.error('Error creating task', error);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`http://localhost:5000/api/tasks/${taskId}`, { status: newStatus }, config);
      // Optimistic update
      setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
    } catch (error) {
      console.error('Error updating task', error);
      fetchProjectDetails(); // Revert on failure
    }
  };



  if (loading) return <div className="container" style={{marginTop: '2rem'}}>Loading project...</div>;
  if (!project) return <div className="container" style={{marginTop: '2rem'}}>Project not found</div>;

  return (
    <div className="container" style={{ marginTop: '2rem' }}>
      <div className="dashboard-header" style={{ marginBottom: '1rem' }}>
        <div>
          <h2 style={{ marginBottom: '0.25rem' }}>{project.name}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Created by {project.createdBy?.name || 'Unknown'} • {project.members?.length || 0} Members
          </p>
        </div>
        {user.role === 'Admin' && (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn-secondary" onClick={openMemberModal}>Add Member</button>
            <button className="btn-primary" onClick={() => setShowTaskModal(true)}>+ Add Task</button>
          </div>
        )}
      </div>

      {showTaskModal && (
        <div className="card" style={{ marginBottom: '2rem', maxWidth: '400px' }}>
          <h4 style={{ marginBottom: '1rem' }}>Create New Task</h4>
          <form onSubmit={handleCreateTask}>
            <div className="form-group">
              <label>Title</label>
              <input type="text" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Due Date</label>
              <input type="date" value={newTask.dueDate} onChange={e => setNewTask({...newTask, dueDate: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Assign To</label>
              <select value={newTask.assignedTo} onChange={e => setNewTask({...newTask, assignedTo: e.target.value})}>
                <option value="">-- Unassigned --</option>
                {project.members && project.members.map(m => (
                  <option key={m._id} value={m._id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="submit" className="btn-primary">Create</button>
              <button type="button" className="btn-secondary" onClick={() => setShowTaskModal(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {showMemberModal && (
        <div className="card" style={{ marginBottom: '2rem', maxWidth: '400px' }}>
          <h4 style={{ marginBottom: '1rem' }}>Add Member</h4>
          <form onSubmit={handleAddMember}>
            <div className="form-group">
              <label>Select User</label>
              <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)} required>
                <option value="">-- Choose a User --</option>
                {users.map(u => (
                  <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="submit" className="btn-primary">Add Member</button>
              <button type="button" className="btn-secondary" onClick={() => setShowMemberModal(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>Member Progress</h3>
      <div className="member-progress">
        {memberProgress.map((mp, i) => {
          const total = mp.assignedCount;
          const completed = mp.completedCount;
          const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
          return (
            <div key={i} className="card member-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="member-name">{mp.member.name}</span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{completed}/{total} Done</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${percentage}%` }}></div>
              </div>
            </div>
          );
        })}
        {memberProgress.length === 0 && <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>No members tracking data available.</p>}
      </div>

      <div className="kanban-board">
        {COLUMNS.map(column => {
          const columnTasks = tasks.filter(t => {
            if (column === 'In Progress') return t.status === 'Started' || t.status === 'Midway';
            return t.status === column;
          });
          return (
            <div key={column} className="kanban-column">
              <div className="kanban-column-header">
                <span>{column}</span>
                <span style={{ background: '#e9ecef', padding: '0.1rem 0.5rem', borderRadius: '99px' }}>{columnTasks.length}</span>
              </div>
              <div className="kanban-column-content">
                {columnTasks.map(task => (
                  <div key={task._id} className={`task-card ${task.assignedTo && task.assignedTo.some(a => a._id === user._id) ? 'assigned-to-me' : ''}`}>
                    <h4>{task.title}</h4>
                    {task.description && (
                      <p 
                        className={`task-description ${!expandedTasks[task._id] ? 'collapsed' : ''}`}
                        onClick={() => toggleTaskExpansion(task._id)}
                      >
                        {task.description}
                      </p>
                    )}
                    <div className="task-meta" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          {task.dueDate && <span>📅 {new Date(task.dueDate).toLocaleDateString()}</span>}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                          <span className={`status-indicator ${getStatusClass(task.status)}`}>{task.status}</span>
                          {getDueDateStatus(task.dueDate, task.status) === 'overdue' && (
                            <span className="status-indicator status-overdue">Overdue</span>
                          )}
                          {getDueDateStatus(task.dueDate, task.status) === 'today' && (
                            <span className="status-indicator" style={{ backgroundColor: '#fff3bf', color: '#f59f00' }}>Due Today</span>
                          )}
                        </div>
                      </div>
                      {task.assignedTo && task.assignedTo.length > 0 && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--primary-color)', fontWeight: 500 }}>
                          👤 {task.assignedTo.map(a => a.name).join(', ')}
                        </div>
                      )}
                      
                      <div style={{ display: 'flex', gap: '0.5rem', width: '100%', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                        {task.status === 'To Do' && task.assignedTo && task.assignedTo.some(a => a._id === user._id) && (
                          <button className="btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', flex: 1 }} onClick={(e) => { e.stopPropagation(); updateTaskStatus(task._id, 'Started'); }}>Start Task</button>
                        )}
                        {task.status === 'Started' && task.assignedTo && task.assignedTo.some(a => a._id === user._id) && (
                          <>
                            <button className="btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', flex: 1 }} onClick={(e) => { e.stopPropagation(); updateTaskStatus(task._id, 'Midway'); }}>Mark Midway</button>
                            <button className="btn-primary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', flex: 1 }} onClick={(e) => { e.stopPropagation(); updateTaskStatus(task._id, 'For Review'); }}>Submit for Review</button>
                          </>
                        )}
                        {task.status === 'Midway' && task.assignedTo && task.assignedTo.some(a => a._id === user._id) && (
                          <button className="btn-primary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', flex: 1 }} onClick={(e) => { e.stopPropagation(); updateTaskStatus(task._id, 'For Review'); }}>Submit for Review</button>
                        )}
                        {task.status === 'For Review' && user.role === 'Admin' && (
                          <>
                            <button className="btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', flex: 1, borderColor: '#ff6b6b', color: '#ff6b6b' }} onClick={(e) => { e.stopPropagation(); updateTaskStatus(task._id, 'Started'); }}>Reject</button>
                            <button className="btn-primary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', flex: 1, backgroundColor: 'var(--kanban-done-text)' }} onClick={(e) => { e.stopPropagation(); updateTaskStatus(task._id, 'Completed'); }}>Approve</button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectDetail;
