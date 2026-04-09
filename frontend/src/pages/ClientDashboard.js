import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, API } from '@/App';
import axios from 'axios';
import {
  LayoutDashboard,
  FolderKanban,
  Package,
  LifeBuoy,
  LogOut,
  Plus,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Bell,
  Sparkles,
  GitBranch
} from 'lucide-react';

const ClientDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [requests, setRequests] = useState([]);
  const [deliverables, setDeliverables] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, requestsRes] = await Promise.all([
          axios.get(`${API}/projects/mine`, { withCredentials: true }),
          axios.get(`${API}/requests`, { withCredentials: true })
        ]);
        setProjects(projectsRes.data);
        setRequests(requestsRes.data);
        
        // Fetch deliverables for each project
        const allDeliverables = [];
        for (const project of projectsRes.data) {
          try {
            const dlvRes = await axios.get(`${API}/projects/${project.project_id}/deliverables`, { withCredentials: true });
            allDeliverables.push(...dlvRes.data.map(d => ({ ...d, project_name: project.name })));
          } catch (e) {
            // ignore
          }
        }
        setDeliverables(allDeliverables);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getStageProgress = (stage) => {
    const stages = ['discovery', 'scope', 'design', 'development', 'qa', 'delivery', 'support'];
    const index = stages.indexOf(stage);
    return Math.round(((index + 1) / stages.length) * 100);
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      completed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
    };
    return styles[status] || 'bg-white/5 text-white/50 border-white/10';
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white" data-testid="client-dashboard">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <span className="text-lg font-bold tracking-tight">Dev OS</span>
            <nav className="hidden md:flex items-center gap-6">
              <button className="text-white text-sm font-medium">Dashboard</button>
              <button className="text-white/50 text-sm hover:text-white transition-colors">Projects</button>
              <button className="text-white/50 text-sm hover:text-white transition-colors">Deliverables</button>
              <button className="text-white/50 text-sm hover:text-white transition-colors">Support</button>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="w-9 h-9 flex items-center justify-center text-white/50 hover:text-white transition-colors">
              <Bell className="w-5 h-5" strokeWidth={1.5} />
            </button>
            <div className="flex items-center gap-3">
              {user?.picture ? (
                <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full" />
              ) : (
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-sm">
                  {user?.name?.[0]}
                </div>
              )}
              <button 
                onClick={handleLogout}
                className="text-white/50 hover:text-white transition-colors"
                data-testid="logout-btn"
              >
                <LogOut className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-white/50 mt-1">Here's what's happening with your projects</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <button
                onClick={() => navigate('/client/request/new')}
                className="group p-6 border border-white/10 rounded-2xl hover:border-white/20 hover:bg-white/5 transition-all flex items-center gap-4"
                data-testid="new-request-btn"
              >
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                  <Plus className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <div className="text-left">
                  <div className="font-medium">New Request</div>
                  <div className="text-sm text-white/40">Start a project</div>
                </div>
              </button>

              <div className="p-6 border border-white/10 rounded-2xl bg-white/[0.02]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/50 text-sm">Active Projects</span>
                  <FolderKanban className="w-4 h-4 text-white/30" strokeWidth={1.5} />
                </div>
                <div className="text-3xl font-bold">{projects.filter(p => p.status === 'active').length}</div>
              </div>

              <div className="p-6 border border-white/10 rounded-2xl bg-white/[0.02]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/50 text-sm">Pending Approval</span>
                  <Package className="w-4 h-4 text-amber-400" strokeWidth={1.5} />
                </div>
                <div className="text-3xl font-bold">{deliverables.filter(d => d.status === 'pending').length}</div>
              </div>

              <div className="p-6 border border-white/10 rounded-2xl bg-white/[0.02]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/50 text-sm">Completed</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
                </div>
                <div className="text-3xl font-bold">{projects.filter(p => p.status === 'completed').length}</div>
              </div>
            </div>

            {/* Pending Deliverables - URGENT */}
            {deliverables.filter(d => d.status === 'pending').length > 0 && (
              <div className="border border-amber-500/30 rounded-2xl bg-amber-500/5 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg font-semibold text-amber-400">Deliveries Awaiting Your Approval</h2>
                </div>
                <div className="space-y-3">
                  {deliverables.filter(d => d.status === 'pending').map(dlv => (
                    <button
                      key={dlv.deliverable_id}
                      onClick={() => navigate(`/client/deliverable/${dlv.deliverable_id}`)}
                      className="w-full text-left border border-white/10 rounded-xl p-4 hover:border-amber-500/30 hover:bg-white/5 transition-all group"
                      data-testid={`deliverable-${dlv.deliverable_id}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="font-medium">{dlv.title}</h3>
                            <span className="px-2 py-0.5 text-xs rounded-lg border bg-amber-500/10 text-amber-400 border-amber-500/20">
                              {dlv.version}
                            </span>
                          </div>
                          <p className="text-white/50 text-sm mt-1">{dlv.project_name}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-amber-400 transition-colors" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Your Projects</h2>
              </div>

              {projects.length === 0 && requests.length === 0 ? (
                <div className="border border-white/10 border-dashed p-12 text-center">
                  <div className="w-16 h-16 bg-white/5 mx-auto mb-4 flex items-center justify-center">
                    <FolderKanban className="w-8 h-8 text-white/30" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No projects yet</h3>
                  <p className="text-white/50 text-sm mb-6">Start by creating your first project request</p>
                  <button
                    onClick={() => navigate('/client/request/new')}
                    className="bg-white text-black px-6 py-3 font-medium hover:bg-white/90 transition-all"
                    data-testid="create-first-project-btn"
                  >
                    Create Your First Project
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Active Projects */}
                  {projects.map((project) => (
                    <div
                      key={project.project_id}
                      onClick={() => navigate(`/projects/${project.project_id}`)}
                      className="group border border-white/10 p-6 hover:border-white/20 hover:bg-white/[0.02] transition-all cursor-pointer"
                      data-testid={`project-${project.project_id}`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg group-hover:text-white transition-colors">
                            {project.name}
                          </h3>
                          <div className="flex items-center gap-3 mt-2">
                            <span className={`px-2 py-1 text-xs border ${getStatusBadge(project.status)}`}>
                              {project.status}
                            </span>
                            <span className="text-white/40 text-sm capitalize">{project.current_stage}</span>
                          </div>
                        </div>
                        <ArrowUpRight className="w-5 h-5 text-white/30 group-hover:text-white transition-colors" />
                      </div>
                      
                      <div className="mt-6">
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="text-white/40">Progress</span>
                          <span className="text-white/40">{getStageProgress(project.current_stage)}%</span>
                        </div>
                        <div className="h-1 bg-white/10 overflow-hidden">
                          <div 
                            className="h-full bg-white transition-all"
                            style={{ width: `${getStageProgress(project.current_stage)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Pending Requests */}
                  {requests.filter(r => r.status === 'pending').map((request) => (
                    <div
                      key={request.request_id}
                      className="border border-white/10 border-dashed p-6 bg-white/[0.01]"
                      data-testid={`request-${request.request_id}`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">{request.title}</h3>
                          <p className="text-white/40 text-sm mt-1 line-clamp-1">{request.business_idea}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs border ${getStatusBadge(request.status)}`}>
                          {request.status}
                        </span>
                      </div>
                      <div className="mt-4 flex items-center gap-2 text-white/40 text-sm">
                        <Clock className="w-4 h-4" strokeWidth={1.5} />
                        <span>Being processed by our team</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Updates */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Recent Updates</h2>
              <div className="border border-white/10 p-6 text-center text-white/40">
                <p className="text-sm">No updates yet</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ClientDashboard;
