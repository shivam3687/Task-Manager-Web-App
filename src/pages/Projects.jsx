import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Layers, Plus, FolderKanban } from 'lucide-react';

const Projects = () => {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Create Project Modal State
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('/api/projects', config);
      setProjects(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching projects', error);
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('/api/projects', { name, description }, config);
      setShowModal(false);
      setName('');
      setDescription('');
      fetchProjects();
    } catch (error) {
      console.error('Error creating project', error);
      alert(error.response?.data?.message || 'Failed to create project');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Layers size={28} color="#fda085" />
          <h1 style={{ fontSize: '2rem' }}>Projects</h1>
        </div>
        
        {user.role === 'Admin' && (
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            <Plus size={18} /> New Project
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center mt-8">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center" style={{ minHeight: '300px' }}>
          <FolderKanban size={64} color="#fecfef" style={{ marginBottom: '16px' }} />
          <h3 style={{ color: 'var(--text-secondary)' }}>No projects found</h3>
          {user.role === 'Admin' && <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Create a new project to get started.</p>}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {projects.map(project => (
            <Link key={project._id} to={`/projects/${project._id}`}>
              <div className="glass-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>{project.name}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', flex: 1, marginBottom: '16px' }}>
                  {project.description || 'No description provided.'}
                </p>
                <div className="flex justify-between items-center" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '12px' }}>
                  <span>Created by: {project.createdBy?.name}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Modal Overlay */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(253, 251, 247, 0.8)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '500px' }}>
            <h2 className="mb-4">Create New Project</h2>
            <form onSubmit={handleCreateProject}>
              <div className="input-group">
                <label>Project Name</label>
                <input type="text" className="input-field" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="input-group">
                <label>Description</label>
                <textarea className="input-field" rows="3" value={description} onChange={e => setDescription(e.target.value)}></textarea>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button type="button" className="btn" style={{ background: 'rgba(0,0,0,0.05)' }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
