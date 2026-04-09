import { useState, useEffect } from 'react';
import { useAuth, API } from '@/App';
import axios from 'axios';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  TrendingUp,
  Loader2
} from 'lucide-react';

const DeveloperPerformance = () => {
  const { user } = useAuth();
  const [workUnits, setWorkUnits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API}/developer/work-units`, { withCredentials: true });
        setWorkUnits(res.data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const completedUnits = workUnits.filter(u => u.status === 'completed');
  const revisionUnits = workUnits.filter(u => u.status === 'revision');
  
  // Calculate metrics
  const totalCompleted = completedUnits.length;
  const totalRevisions = revisionUnits.length;
  const successRate = workUnits.length > 0 
    ? Math.round((totalCompleted / (totalCompleted + totalRevisions || 1)) * 100) 
    : 100;
  
  const totalHours = workUnits.reduce((sum, u) => sum + (u.actual_hours || 0), 0);
  const avgTime = totalCompleted > 0 
    ? (completedUnits.reduce((sum, u) => sum + (u.actual_hours || 0), 0) / totalCompleted).toFixed(1)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl" data-testid="developer-performance">
      <h1 className="text-2xl font-semibold mb-6">Performance</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="border border-zinc-800 rounded-xl p-6 bg-[#111]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-zinc-500 text-sm">Completed Tasks</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-4xl font-bold">{totalCompleted}</div>
        </div>

        <div className="border border-zinc-800 rounded-xl p-6 bg-[#111]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-zinc-500 text-sm">Success Rate</span>
            <TrendingUp className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-4xl font-bold">{successRate}%</div>
        </div>

        <div className="border border-zinc-800 rounded-xl p-6 bg-[#111]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-zinc-500 text-sm">Revisions</span>
            <AlertCircle className="w-5 h-5 text-red-400" />
          </div>
          <div className="text-4xl font-bold">{totalRevisions}</div>
        </div>

        <div className="border border-zinc-800 rounded-xl p-6 bg-[#111]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-zinc-500 text-sm">Avg Time</span>
            <Clock className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="text-4xl font-bold">{avgTime}h</div>
        </div>
      </div>

      {/* Total Hours */}
      <div className="border border-zinc-800 rounded-xl p-6 bg-[#111] mb-8">
        <div className="text-zinc-500 text-sm mb-2">Total Hours Logged</div>
        <div className="text-5xl font-bold">{totalHours}h</div>
      </div>

      {/* Recent Completed */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Recently Completed</h2>
        {completedUnits.length === 0 ? (
          <div className="border border-zinc-800 border-dashed rounded-xl p-8 text-center">
            <p className="text-zinc-500 text-sm">No completed tasks yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {completedUnits.slice(0, 10).map((unit) => (
              <div 
                key={unit.unit_id}
                className="border border-zinc-800 rounded-xl p-4 flex items-center justify-between bg-[#111]"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{unit.title}</span>
                </div>
                <span className="text-zinc-500 text-sm">{unit.actual_hours || 0}h</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeveloperPerformance;
