import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, API } from '@/App';
import axios from 'axios';
import {
  FolderKanban,
  Plus,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  Search,
  Filter
} from 'lucide-react';

const ClientProjects = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [projects, setProjects] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, requestsRes] = await Promise.all([
          axios.get(`${API}/projects/mine`, { withCredentials: true }),
          axios.get(`${API}/requests`, { withCredentials: true })
        ]);
        setProjects(projectsRes.data);
        setRequests(requestsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStageProgress = (stage) => {
    const stages = ['discovery', 'scope', 'design', 'development', 'qa', 'delivery', 'support'];
    const index = stages.indexOf(stage);
    return Math.round(((index + 1) / stages.length) * 100);
  };

  const filteredProjects = projects
    .filter(p => filter === 'all' || p.status === filter)
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const pendingRequests = requests.filter(r => r.status === 'pending');

  return (
    <div className="p-8" data-testid="client-projects">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-white/50 mt-1">Manage and track your projects</p>
        </div>
        <button
          onClick={() => navigate('/client/request/new')}
          className="flex items-center gap-2 px-4 py-2.5 bg-white text-black rounded-xl font-medium hover:bg-white/90 transition-all"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-white/30"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'active', 'completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2.5 rounded-xl text-sm capitalize transition-all ${
                filter === f
                  ? 'bg-white text-black font-medium'
                  : 'border border-white/10 text-white/50 hover:text-white hover:border-white/20'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin" />
        </div>
      ) : filteredProjects.length === 0 && pendingRequests.length === 0 ? (
        <div className="border border-white/10 border-dashed rounded-2xl p-12 text-center">
          <FolderKanban className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No projects yet</h3>
          <p className="text-white/50 text-sm mb-6">Start by creating your first project request</p>
          <button
            onClick={() => navigate('/client/request/new')}
            className="px-6 py-3 bg-white text-black rounded-xl font-medium hover:bg-white/90 transition-all"
          >
            Create Your First Project
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Pending Requests */}
          {filter === 'all' && pendingRequests.map((request) => (
            <div
              key={request.request_id}
              className="border border-amber-500/20 border-dashed rounded-xl p-5 bg-amber-500/5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">{request.title}</h3>
                    <span className="px-2 py-1 text-xs bg-amber-500/20 text-amber-400 rounded-lg">
                      Pending Review
                    </span>
                  </div>
                  <p className="text-white/50 text-sm line-clamp-2">{request.business_idea}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-amber-400/70 text-sm">
                <Clock className="w-4 h-4" />
                <span>Being processed by our team</span>
              </div>
            </div>
          ))}

          {/* Projects */}
          {filteredProjects.map((project) => (
            <div
              key={project.project_id}
              onClick={() => navigate(`/client/projects/${project.project_id}`)}
              className="group border border-white/10 rounded-xl p-6 hover:border-white/20 hover:bg-white/[0.02] transition-all cursor-pointer"
              data-testid={`project-card-${project.project_id}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold group-hover:text-white transition-colors">
                      {project.name}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-lg ${
                      project.status === 'active' 
                        ? 'bg-emerald-500/10 text-emerald-400' 
                        : project.status === 'completed'
                        ? 'bg-blue-500/10 text-blue-400'
                        : 'bg-white/5 text-white/50'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  <p className="text-white/50 text-sm capitalize">Stage: {project.current_stage}</p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-white/30 group-hover:text-white transition-colors" />
              </div>
              
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-white/40">Progress</span>
                  <span className="text-white/60">{getStageProgress(project.current_stage)}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      project.status === 'completed' ? 'bg-emerald-400' : 'bg-white'
                    }`}
                    style={{ width: `${getStageProgress(project.current_stage)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientProjects;
