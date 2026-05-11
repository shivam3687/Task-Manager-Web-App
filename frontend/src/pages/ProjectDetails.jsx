import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { format } from 'date-fns';
import { Plus, ArrowLeft, Clock, User as UserIcon, Calendar, CheckCircle, MessageSquare, Send } from 'lucide-react';

const ProjectDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Task Modal State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', status: 'To Do', priority: 'Medium', dueDate: '', assignedTo: ''
  });

  // Edit Task State
  const [editTask, setEditTask] = useState(null);

  // Team Modal State
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);

  // Updates State
  const [updateText, setUpdateText] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      const [projectRes, tasksRes, usersRes] = await Promise.all([
        axios.get(`/api/projects/${id}`, config),
        axios.get(`/api/tasks?project=${id}`, config),
        axios.get('/api/auth/users', config)
      ]);
      
      setProject(projectRes.data);
      setTasks(tasksRes.data);
      setUsers(usersRes.data);
      setSelectedMembers(projectRes.data.members?.map(m => m._id) || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data', error);
      setLoading(false);
    }
  };

  const handleCreateOrUpdateTask = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      if (editTask) {
        await axios.put(`/api/tasks/${editTask._id}`, formData, config);
      } else {
        await axios.post('/api/tasks', { ...formData, project: id }, config);
      }
      
      setShowModal(false);
      setEditTask(null);
      setFormData({ title: '', description: '', status: 'To Do', priority: 'Medium', dueDate: '', assignedTo: '' });
      fetchData();
    } catch (error) {
      console.error('Error saving task', error);
      alert(error.response?.data?.message || 'Failed to save task');
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`/api/tasks/${taskId}`, { status: newStatus }, config);
      fetchData();
    } catch (error) {
      console.error('Error updating status', error);
    }
  };

  const handleManageTeam = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`/api/projects/${id}`, { members: selectedMembers }, config);
      setShowTeamModal(false);
      fetchData();
    } catch (error) {
      console.error('Error updating team', error);
      alert(error.response?.data?.message || 'Failed to update team');
    }
  };

  const handleUpdateProjectStatus = async (newStatus) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      // Check if user is an admin or just a member updating to Pending Validation
      if (user.role === 'Admin') {
        await axios.put(`/api/projects/${id}`, { status: newStatus }, config);
      } else {
        await axios.put(`/api/projects/${id}/member-update`, { status: newStatus }, config);
      }
      fetchData();
    } catch (error) {
      console.error('Error updating project status', error);
      alert(error.response?.data?.message || 'Failed to update project status');
    }
  };

  const handlePostUpdate = async (e) => {
    e.preventDefault();
    if (!updateText.trim()) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`/api/projects/${id}/member-update`, { updateText }, config);
      setUpdateText('');
      fetchData();
    } catch (error) {
      console.error('Error posting update', error);
      alert('Failed to post update');
    }
  };

  const handleProjectSubmission = async (e) => {
    e.preventDefault();
    const submissionText = prompt("Enter project submission details/link:");
    if (submissionText) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.put(`/api/projects/${id}`, { submission: submissionText, status: 'Completed' }, config);
        fetchData();
      } catch (error) {
        console.error('Error submitting project', error);
        alert(error.response?.data?.message || 'Failed to submit project');
      }
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.delete(`/api/tasks/${taskId}`, config);
        fetchData();
      } catch (error) {
        console.error('Error deleting task', error);
      }
    }
  };

  const openEditModal = (task) => {
    setEditTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      assignedTo: task.assignedTo?._id || ''
    });
    setShowModal(true);
  };

  if (loading) return <div className="flex justify-center mt-8">Loading project details...</div>;
  if (!project) return <div className="flex justify-center mt-8 text-danger">Project not found.</div>;

  return (
    <div>
      <Link to="/projects" className="flex items-center gap-2 mb-4 text-secondary" style={{ color: 'var(--text-secondary)' }}>
        <ArrowLeft size={16} /> Back to Projects
      </Link>
      
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 style={{ fontSize: '2rem', margin: 0 }}>{project.name}</h1>
            <span className={`badge ${project.status === 'Completed' ? 'badge-done' : 'badge-progress'}`}>
              {project.status || 'Active'}
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>{project.description}</p>
          {project.submission && (
            <div className="mt-2 p-2" style={{ background: 'rgba(212, 252, 121, 0.2)', borderRadius: '8px', border: '1px solid rgba(150, 230, 161, 0.5)' }}>
              <strong>Submission: </strong>
              <span style={{ color: '#333' }}>{project.submission}</span>
            </div>
          )}
          <div className="flex gap-2 mt-3">
            {project.members && project.members.map(m => (
              <span key={m._id} className="badge badge-done flex items-center gap-1"><UserIcon size={12} /> {m.name}</span>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2 items-end">
          <div className="flex gap-2">
            {user.role === 'Admin' && (
              <button onClick={() => setShowTeamModal(true)} className="btn btn-secondary">
                <UserIcon size={18} /> Manage Team
              </button>
            )}
            {user.role === 'Admin' && project.status !== 'Completed' && (
              <button onClick={() => { setEditTask(null); setShowModal(true); }} className="btn btn-primary">
                <Plus size={18} /> New Task
              </button>
            )}
          </div>
          {user.role === 'Admin' && project.status !== 'Completed' && (
            <button onClick={handleProjectSubmission} className="btn" style={{ background: 'var(--success-gradient)', color: '#333' }}>
              <CheckCircle size={18} /> Approve & Mark Completed
            </button>
          )}
          {user.role !== 'Admin' && project.status === 'Active' && (
            <button onClick={() => handleUpdateProjectStatus('Pending Validation')} className="btn btn-secondary">
              <CheckCircle size={18} /> Submit for Validation
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', overflowX: 'auto', paddingBottom: '16px' }}>
        {['To Do', 'In Progress', 'Pending Validation', 'Done'].map(status => (
          <div key={status} className="glass" style={{ padding: '20px', minHeight: '500px' }}>
            <div className="flex justify-between items-center mb-4">
              <h3 style={{ fontSize: '1.2rem', color: '#555' }}>{status}</h3>
              <span className="badge" style={{ background: 'rgba(0,0,0,0.05)' }}>{tasks.filter(t => t.status === status).length}</span>
            </div>
            
            <div className="flex flex-col gap-4">
              {tasks.filter(t => t.status === status).map(task => (
                <div key={task._id} className="glass-card" style={{ padding: '16px' }}>
                  <div className="flex justify-between items-start mb-2">
                    <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{task.title}</h4>
                    <span className={`badge badge-${task.priority.toLowerCase()}`}>{task.priority}</span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '12px' }}>{task.description}</p>
                  
                  <div className="flex flex-col gap-2" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    {task.assignedTo && (
                      <span className="flex items-center gap-1"><UserIcon size={14} /> {task.assignedTo.name}</span>
                    )}
                    {task.dueDate && (
                      <span className="flex items-center gap-1"><Calendar size={14} /> {format(new Date(task.dueDate), 'MMM dd, yyyy')}</span>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center pt-3 border-t" style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                    <select 
                      value={task.status} 
                      onChange={(e) => handleUpdateStatus(task._id, e.target.value)}
                      disabled={task.status === 'Done'}
                      style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '0.8rem', background: 'transparent' }}
                    >
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Pending Validation">Pending Validation</option>
                      {(user.role === 'Admin' || task.status === 'Done') && (
                        <option value="Done">Done</option>
                      )}
                    </select>
                    
                    <div className="flex gap-2">
                      {user.role === 'Admin' && task.status !== 'Done' && (
                        <button onClick={() => openEditModal(task)} style={{ border: 'none', background: 'transparent', color: '#fda085', cursor: 'pointer', fontSize: '0.8rem' }}>Edit</button>
                      )}
                      {user.role === 'Admin' && (
                        <button onClick={() => handleDeleteTask(task._id)} style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem' }}>Delete</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="glass mt-8 p-6">
        <h3 className="flex items-center gap-2 mb-4"><MessageSquare size={20} color="#ff9a9e" /> Project Updates</h3>
        <div className="flex flex-col gap-4 mb-4" style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {project.updates && project.updates.length > 0 ? (
            project.updates.map((update, idx) => (
              <div key={idx} className="glass-card" style={{ padding: '12px', background: 'rgba(255,255,255,0.4)' }}>
                <div className="flex justify-between items-center mb-1">
                  <strong style={{ fontSize: '0.9rem', color: '#444' }}>{update.user?.name || 'Unknown User'}</strong>
                  <span style={{ fontSize: '0.75rem', color: '#888' }}>{format(new Date(update.createdAt), 'MMM dd, HH:mm')}</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.95rem', color: '#555' }}>{update.text}</p>
              </div>
            ))
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>No updates posted yet.</p>
          )}
        </div>
        <form onSubmit={handlePostUpdate} className="flex gap-2">
          <input 
            type="text" 
            className="input-field mb-0 flex-1" 
            placeholder="Post an update to the team/Admin..." 
            value={updateText}
            onChange={(e) => setUpdateText(e.target.value)}
          />
          <button type="submit" className="btn btn-primary"><Send size={18} /> Post</button>
        </form>
      </div>

      {/* Task Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(253, 251, 247, 0.8)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 className="mb-4">{editTask ? 'Edit Task' : 'Create New Task'}</h2>
            <form onSubmit={handleCreateOrUpdateTask}>
              <div className="input-group">
                <label>Task Title</label>
                <input type="text" className="input-field" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
              </div>
              <div className="input-group">
                <label>Description</label>
                <textarea className="input-field" rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              </div>
              <div className="flex gap-4">
                <div className="input-group" style={{ flex: 1 }}>
                  <label>Status</label>
                  <select className="input-field" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Pending Validation">Pending Validation</option>
                    <option value="Done">Done</option>
                  </select>
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>Priority</label>
                  <select className="input-field" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
              <div className="input-group">
                <label>Due Date</label>
                <input type="date" className="input-field" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Assign To</label>
                <select className="input-field" value={formData.assignedTo} onChange={e => setFormData({...formData, assignedTo: e.target.value})}>
                  <option value="">Unassigned</option>
                  {project.members && project.members.map(m => (
                    <option key={m._id} value={m._id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button type="button" className="btn" style={{ background: 'rgba(0,0,0,0.05)' }} onClick={() => { setShowModal(false); setEditTask(null); }}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editTask ? 'Save Changes' : 'Create Task'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Team Modal */}
      {showTeamModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(253, 251, 247, 0.8)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 className="mb-4">Manage Team Members</h2>
            <form onSubmit={handleManageTeam}>
              <div className="input-group">
                <label>Select members to allot to this project:</label>
                <div className="flex flex-col gap-2 mt-2">
                  {users.map(u => (
                    <label key={u._id} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded">
                      <input 
                        type="checkbox" 
                        checked={selectedMembers.includes(u._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedMembers([...selectedMembers, u._id]);
                          } else {
                            setSelectedMembers(selectedMembers.filter(id => id !== u._id));
                          }
                        }}
                      />
                      <span>{u.name} ({u.email})</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button type="button" className="btn" style={{ background: 'rgba(0,0,0,0.05)' }} onClick={() => setShowTeamModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-secondary">Save Team</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
