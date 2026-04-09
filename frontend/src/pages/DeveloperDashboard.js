import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, API } from '@/App';
import axios from 'axios';
import {
  LayoutDashboard,
  ClipboardList,
  Clock,
  CheckCircle2,
  LogOut,
  ArrowUpRight,
  Bell,
  Play,
  FileText,
  Timer,
  TrendingUp
} from 'lucide-react';

const DeveloperDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [workUnits, setWorkUnits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assignmentsRes, workUnitsRes] = await Promise.all([
          axios.get(`${API}/developer/assignments`, { withCredentials: true }),
          axios.get(`${API}/developer/work-units`, { withCredentials: true })
        ]);
        setAssignments(assignmentsRes.data);
        setWorkUnits(workUnitsRes.data);
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

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-white/5 text-white/50 border-white/10',
      assigned: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      in_progress: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      submitted: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      review: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      validation: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    };
    return styles[status] || 'bg-white/5 text-white/50 border-white/10';
  };

  const activeUnits = workUnits.filter(u => ['assigned', 'in_progress'].includes(u.status));
  const submittedUnits = workUnits.filter(u => ['submitted', 'review', 'validation'].includes(u.status));
  const completedUnits = workUnits.filter(u => u.status === 'completed');

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white" data-testid="developer-dashboard">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <span className="text-lg font-bold tracking-tight">Dev OS</span>
            <div className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs border border-blue-500/20">
              Developer
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="w-9 h-9 flex items-center justify-center text-white/50 hover:text-white transition-colors">
              <Bell className="w-5 h-5" strokeWidth={1.5} />
            </button>
            <div className="flex items-center gap-3">
              <span className="text-sm text-white/70">{user?.name}</span>
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
          <h1 className="text-2xl font-bold tracking-tight">Developer Hub</h1>
          <p className="text-white/50 mt-1">Your assignments and work units</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-6 border border-white/10 bg-white/[0.02]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/50 text-sm">Active Tasks</span>
                  <Play className="w-4 h-4 text-blue-400" strokeWidth={1.5} />
                </div>
                <div className="text-3xl font-bold">{activeUnits.length}</div>
              </div>

              <div className="p-6 border border-white/10 bg-white/[0.02]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/50 text-sm">In Review</span>
                  <FileText className="w-4 h-4 text-amber-400" strokeWidth={1.5} />
                </div>
                <div className="text-3xl font-bold">{submittedUnits.length}</div>
              </div>

              <div className="p-6 border border-white/10 bg-white/[0.02]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/50 text-sm">Completed</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
                </div>
                <div className="text-3xl font-bold">{completedUnits.length}</div>
              </div>

              <div className="p-6 border border-white/10 bg-white/[0.02]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/50 text-sm">Total Hours</span>
                  <Timer className="w-4 h-4 text-purple-400" strokeWidth={1.5} />
                </div>
                <div className="text-3xl font-bold">
                  {workUnits.reduce((acc, u) => acc + (u.actual_hours || 0), 0)}h
                </div>
              </div>
            </div>

            {/* Active Work Units */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Active Assignments</h2>
              
              {activeUnits.length === 0 ? (
                <div className="border border-white/10 border-dashed rounded-2xl p-12 text-center">
                  <div className="w-16 h-16 bg-white/5 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                    <ClipboardList className="w-8 h-8 text-white/30" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No active assignments</h3>
                  <p className="text-white/50 text-sm">New tasks will appear here when assigned</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeUnits.map((unit) => (
                    <div
                      key={unit.unit_id}
                      onClick={() => navigate(`/developer/work/${unit.unit_id}`)}
                      className="group border border-white/10 rounded-2xl p-5 hover:border-white/20 hover:bg-white/[0.02] transition-all cursor-pointer"
                      data-testid={`work-unit-${unit.unit_id}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-medium">{unit.title}</h3>
                            <span className={`px-2 py-0.5 text-xs rounded-lg border ${getStatusBadge(unit.status)}`}>
                              {unit.status.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-white/40 text-sm mt-1 line-clamp-1">{unit.description}</p>
                        </div>
                        <div className="text-right text-sm">
                          <div className="text-white/40">{unit.estimated_hours}h est.</div>
                          <div className="text-white/60">{unit.actual_hours}h logged</div>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex items-center gap-3">
                        <button 
                          onClick={(e) => { e.stopPropagation(); navigate(`/developer/work/${unit.unit_id}`); }}
                          className="px-4 py-2 bg-white text-black text-sm font-medium rounded-xl hover:bg-white/90 transition-all"
                        >
                          {unit.status === 'assigned' ? 'Start Work' : 'Continue'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submitted */}
            {submittedUnits.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">In Review</h2>
                <div className="space-y-3">
                  {submittedUnits.map((unit) => (
                    <div
                      key={unit.unit_id}
                      className="border border-white/10 p-5 bg-white/[0.01]"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium">{unit.title}</h3>
                          <span className={`px-2 py-0.5 text-xs border ${getStatusBadge(unit.status)}`}>
                            {unit.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="text-white/40 text-sm">{unit.actual_hours}h logged</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Performance */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Performance</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-white/10 p-5">
                  <div className="text-white/50 text-sm mb-1">Rating</div>
                  <div className="text-2xl font-bold">{user?.rating || 5.0}</div>
                </div>
                <div className="border border-white/10 p-5">
                  <div className="text-white/50 text-sm mb-1">Completed Tasks</div>
                  <div className="text-2xl font-bold">{user?.completed_tasks || 0}</div>
                </div>
                <div className="border border-white/10 p-5">
                  <div className="text-white/50 text-sm mb-1">Level</div>
                  <div className="text-2xl font-bold capitalize">{user?.level || 'Junior'}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DeveloperDashboard;
