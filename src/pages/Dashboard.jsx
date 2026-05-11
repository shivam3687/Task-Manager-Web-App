import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { format } from 'date-fns';
import { Clock, CheckCircle, AlertCircle, LayoutDashboard } from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        };
        const [tasksRes, projectsRes] = await Promise.all([
          axios.get('/api/tasks', config),
          axios.get('/api/projects', config)
        ]);
        setTasks(tasksRes.data);
        setProjects(projectsRes.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data', error);
        setLoading(false);
      }
    };
    
    if (user) {
      fetchTasks();
    }
  }, [user]);

  if (loading) return <div className="flex justify-center mt-8">Loading dashboard...</div>;

  const myTasks = tasks.filter(task => task.assignedTo?._id === user._id);
  
  const stats = {
    projects: projects.length,
    total: myTasks.length,
    todo: myTasks.filter(t => t.status === 'To Do').length,
    inProgress: myTasks.filter(t => t.status === 'In Progress').length,
    done: myTasks.filter(t => t.status === 'Done').length,
    overdue: myTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Done').length
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <LayoutDashboard size={28} color="#ff9a9e" />
        <h1 style={{ fontSize: '2rem' }}>Dashboard</h1>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <div className="glass-card flex flex-col items-center">
          <div style={{ background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '2.5rem', fontWeight: 700 }}>
            {stats.projects}
          </div>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Active Projects</span>
        </div>
        
        <div className="glass-card flex flex-col items-center">
          <div style={{ background: 'var(--secondary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '2.5rem', fontWeight: 700 }}>
            {stats.total}
          </div>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Total Tasks</span>
        </div>
        
        <div className="glass-card flex flex-col items-center">
          <div style={{ color: '#6b7280', fontSize: '2.5rem', fontWeight: 700 }}>{stats.todo}</div>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>To Do</span>
        </div>
        
        <div className="glass-card flex flex-col items-center">
          <div style={{ background: 'var(--secondary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '2.5rem', fontWeight: 700 }}>
            {stats.inProgress}
          </div>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>In Progress</span>
        </div>
        
        <div className="glass-card flex flex-col items-center">
          <div style={{ background: 'var(--success-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '2.5rem', fontWeight: 700 }}>
            {stats.done}
          </div>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Completed</span>
        </div>
        
        <div className="glass-card flex flex-col items-center" style={{ border: stats.overdue > 0 ? '1px solid #fecdd3' : '' }}>
          <div style={{ color: '#ef4444', fontSize: '2.5rem', fontWeight: 700 }}>{stats.overdue}</div>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Overdue</span>
        </div>
      </div>
      
      <div className="mb-8">
        <h3 className="flex items-center gap-2 mb-4"><LayoutDashboard size={20} color="#ff9a9e" /> My Allocated Projects</h3>
        {projects.length === 0 ? (
          <div className="glass-card"><p style={{ color: 'var(--text-secondary)' }}>You are not allocated to any active projects.</p></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
            {projects.map(project => (
              <a key={project._id} href={`/projects/${project._id}`} style={{ display: 'block' }}>
                <div className="glass-card" style={{ height: '100%' }}>
                  <div className="flex justify-between items-start mb-2">
                    <h4 style={{ margin: 0 }}>{project.name}</h4>
                    <span className={`badge ${project.status === 'Completed' ? 'badge-done' : 'badge-progress'}`}>
                      {project.status || 'Active'}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '12px' }}>
                    {project.description ? project.description.substring(0, 60) + '...' : 'No description'}
                  </p>
                  <div style={{ fontSize: '0.8rem', color: '#888' }}>
                    Team size: {project.members?.length || 0}
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="glass-card">
          <h3 className="flex items-center gap-2 mb-4"><Clock size={20} color="#fda085" /> Recent Tasks</h3>
          {myTasks.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No tasks assigned to you yet.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {myTasks.slice(0, 5).map(task => (
                <div key={task._id} style={{ padding: '12px', background: 'rgba(255,255,255,0.5)', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)' }}>
                  <div className="flex justify-between items-center mb-2">
                    <h4 style={{ margin: 0 }}>{task.title}</h4>
                    <span className={`badge ${
                      task.status === 'To Do' ? 'badge-todo' : 
                      task.status === 'In Progress' ? 'badge-progress' : 'badge-done'
                    }`}>{task.status}</span>
                  </div>
                  <div className="flex justify-between items-center" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <span>Project: {task.project?.name}</span>
                    {task.dueDate && (
                      <span className={new Date(task.dueDate) < new Date() && task.status !== 'Done' ? 'text-danger flex items-center gap-1' : 'flex items-center gap-1'}>
                        {new Date(task.dueDate) < new Date() && task.status !== 'Done' && <AlertCircle size={14} />}
                        Due: {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="glass-card">
           <h3 className="flex items-center gap-2 mb-4"><CheckCircle size={20} color="#96e6a1" /> Quick Actions</h3>
           <div className="flex flex-col gap-4">
              <p style={{ color: 'var(--text-secondary)' }}>Welcome to TaskFlow! Navigate to the Projects tab to view all your team's projects or create a new one.</p>
              {user.role === 'Admin' && (
                <div style={{ padding: '16px', background: 'rgba(254, 207, 239, 0.2)', borderRadius: '12px', border: '1px solid rgba(254, 207, 239, 0.5)' }}>
                  <h4 style={{ marginBottom: '8px', color: '#be123c' }}>Admin Privileges</h4>
                  <p style={{ fontSize: '0.9rem', color: '#881337' }}>As an Admin, you can create new projects, add tasks, assign them to members, and manage the team.</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
