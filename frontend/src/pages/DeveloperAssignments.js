import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, API } from '@/App';
import axios from 'axios';
import {
  Play,
  Clock,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Loader2
} from 'lucide-react';

const DeveloperAssignments = () => {
  const navigate = useNavigate();
  const [workUnits, setWorkUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API}/developer/work-units`, { withCredentials: true });
        setWorkUnits(res.data);
      } catch (error) {
        console.error('Error fetching work units:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const tabs = [
    { id: 'active', label: 'Active', filter: u => ['assigned', 'in_progress'].includes(u.status) },
    { id: 'review', label: 'In Review', filter: u => ['submitted', 'validation'].includes(u.status) },
    { id: 'revision', label: 'Revision', filter: u => u.status === 'revision' },
    { id: 'completed', label: 'Completed', filter: u => u.status === 'completed' },
  ];

  const currentTab = tabs.find(t => t.id === activeTab);
  const filteredUnits = workUnits.filter(currentTab.filter);

  // Sort: revision first, then by priority
  const sortedUnits = [...filteredUnits].sort((a, b) => {
    if (a.status === 'revision' && b.status !== 'revision') return -1;
    if (b.status === 'revision' && a.status !== 'revision') return 1;
    return 0;
  });

  const revisionCount = workUnits.filter(u => u.status === 'revision').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div className="p-6" data-testid="developer-assignments">
      <h1 className="text-2xl font-semibold mb-6">Assignments</h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-zinc-800">
        {tabs.map((tab) => {
          const count = workUnits.filter(tab.filter).length;
          const isRevision = tab.id === 'revision' && count > 0;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-white text-white'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className={`ml-2 px-1.5 py-0.5 text-xs rounded ${
                  isRevision ? 'bg-red-500 text-white' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* List */}
      {sortedUnits.length === 0 ? (
        <div className="border border-zinc-800 border-dashed rounded-xl p-12 text-center">
          <p className="text-zinc-500 text-sm">No tasks in this category</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedUnits.map((unit) => (
            <AssignmentCard 
              key={unit.unit_id} 
              unit={unit} 
              onClick={() => navigate(`/developer/work/${unit.unit_id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const AssignmentCard = ({ unit, onClick }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'assigned':
        return { icon: Play, color: 'text-zinc-400', bg: 'bg-zinc-800', label: 'New' };
      case 'in_progress':
        return { icon: Play, color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'In Progress' };
      case 'submitted':
        return { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/20', label: 'Submitted' };
      case 'validation':
        return { icon: Clock, color: 'text-purple-400', bg: 'bg-purple-500/20', label: 'Validating' };
      case 'revision':
        return { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/20', label: 'Fix Required' };
      case 'completed':
        return { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/20', label: 'Done' };
      default:
        return { icon: Clock, color: 'text-zinc-400', bg: 'bg-zinc-800', label: status };
    }
  };

  const config = getStatusConfig(unit.status);
  const Icon = config.icon;
  const isRevision = unit.status === 'revision';

  return (
    <button
      onClick={onClick}
      className={`w-full text-left border rounded-xl p-4 flex items-center justify-between transition-all group ${
        isRevision 
          ? 'border-red-500/30 bg-red-500/5 hover:bg-red-500/10' 
          : 'border-zinc-800 bg-[#111] hover:border-zinc-700'
      }`}
      data-testid={`assignment-${unit.unit_id}`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.bg}`}>
          <Icon className={`w-5 h-5 ${config.color}`} />
        </div>
        <div>
          <div className="font-medium">{unit.title}</div>
          <div className="text-xs text-zinc-500 mt-0.5">
            {unit.project_name || 'Project'} · {unit.unit_type || 'Task'} · {unit.estimated_hours}h
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <span className={`px-2 py-1 text-xs rounded-lg ${config.bg} ${config.color}`}>
          {config.label}
        </span>
        <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
      </div>
    </button>
  );
};

export default DeveloperAssignments;
