import { useState, useCallback, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, API } from '@/App';
import { ClientRealtimeBridge } from '@/components/RealtimeBridge';
import axios from 'axios';
import {
  LayoutDashboard,
  FolderKanban,
  Package,
  LifeBuoy,
  LogOut,
  Plus,
  User
} from 'lucide-react';

const ClientLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [projectIds, setProjectIds] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleRefresh = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

  // Fetch project IDs for realtime rooms
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get(`${API}/projects/mine`, { withCredentials: true });
        setProjectIds(res.data.map(p => p.project_id));
      } catch (e) {}
    };
    fetchProjects();
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/client/dashboard' },
    { id: 'projects', label: 'Projects', icon: FolderKanban, path: '/client/projects' },
    { id: 'deliverables', label: 'Deliverables', icon: Package, path: '/client/deliverables' },
    { id: 'support', label: 'Support', icon: LifeBuoy, path: '/client/support' },
  ];

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div className="min-h-screen bg-black text-white flex" data-testid="client-layout">
      {/* Realtime Bridge */}
      {user?.user_id && (
        <ClientRealtimeBridge 
          userId={user.user_id} 
          projectIds={projectIds}
          onRefresh={handleRefresh} 
        />
      )}
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 flex flex-col sticky top-0 h-screen">
        {/* Logo */}
        <div className="h-16 border-b border-white/10 px-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-[6px] flex items-center justify-center">
            <span className="text-black font-bold text-sm">D</span>
          </div>
          <div>
            <span className="font-medium tracking-tight">Dev OS</span>
            <span className="text-white/40 text-xs block">Client</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`sidebar-nav-item w-full ${isActive(item.path) ? 'active' : ''}`}
                data-testid={`nav-${item.id}`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* New Request Button */}
          <div className="mt-6">
            <button
              onClick={() => navigate('/client/request/new')}
              className="btn btn-primary w-full justify-center"
              data-testid="new-request-btn"
            >
              <Plus className="w-4 h-4" />
              New Request
            </button>
          </div>
        </nav>

        {/* User */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 p-3 rounded-[8px] bg-white/5">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <User className="w-4 h-4 text-white/60" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || 'Client'}</p>
              <p className="text-xs text-white/40 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-white/40 hover:text-white transition-colors"
              data-testid="logout-btn"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default ClientLayout;
