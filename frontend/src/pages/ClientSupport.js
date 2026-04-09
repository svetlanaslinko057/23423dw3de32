import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, API } from '@/App';
import axios from 'axios';
import {
  LifeBuoy,
  Plus,
  Bug,
  Lightbulb,
  HelpCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight,
  MessageSquare,
  X
} from 'lucide-react';

const ClientSupport = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    ticket_type: 'bug',
    priority: 'medium',
    project_id: ''
  });
  
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ticketsRes, projectsRes] = await Promise.all([
        axios.get(`${API}/client/support-tickets`, { withCredentials: true }),
        axios.get(`${API}/projects/mine`, { withCredentials: true })
      ]);
      setTickets(ticketsRes.data);
      setProjects(projectsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newTicket.title.trim() || !newTicket.description.trim()) {
      alert('Please fill in all required fields');
      return;
    }
    
    setCreating(true);
    try {
      await axios.post(`${API}/client/support-tickets`, newTicket, { withCredentials: true });
      setShowCreate(false);
      setNewTicket({ title: '', description: '', ticket_type: 'bug', priority: 'medium', project_id: '' });
      fetchData();
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert('Failed to create ticket');
    } finally {
      setCreating(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'bug': return Bug;
      case 'improvement': return Lightbulb;
      case 'question': return HelpCircle;
      default: return MessageSquare;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'in_progress':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'resolved':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'closed':
        return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
      default:
        return 'bg-white/5 text-white/50 border-white/10';
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/10 text-red-400';
      case 'medium':
        return 'bg-amber-500/10 text-amber-400';
      case 'low':
        return 'bg-zinc-500/10 text-zinc-400';
      default:
        return 'bg-white/5 text-white/50';
    }
  };

  const filteredTickets = activeTab === 'all' 
    ? tickets 
    : tickets.filter(t => t.status === activeTab);

  const openCount = tickets.filter(t => t.status === 'open').length;
  const inProgressCount = tickets.filter(t => t.status === 'in_progress').length;
  const resolvedCount = tickets.filter(t => t.status === 'resolved').length;

  return (
    <div className="p-8" data-testid="client-support">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Support</h1>
          <p className="text-white/50 mt-1">Get help with your projects</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-white text-black rounded-xl font-medium hover:bg-white/90 transition-all"
          data-testid="new-ticket-btn"
        >
          <Plus className="w-4 h-4" />
          New Ticket
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="border border-white/10 rounded-xl p-5 bg-white/[0.02]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/50 text-sm">Total Tickets</span>
            <LifeBuoy className="w-4 h-4 text-white/30" />
          </div>
          <div className="text-3xl font-bold">{tickets.length}</div>
        </div>
        <div className="border border-amber-500/20 rounded-xl p-5 bg-amber-500/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-amber-400/70 text-sm">Open</span>
            <AlertCircle className="w-4 h-4 text-amber-400/50" />
          </div>
          <div className="text-3xl font-bold text-amber-400">{openCount}</div>
        </div>
        <div className="border border-blue-500/20 rounded-xl p-5 bg-blue-500/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-400/70 text-sm">In Progress</span>
            <Clock className="w-4 h-4 text-blue-400/50" />
          </div>
          <div className="text-3xl font-bold text-blue-400">{inProgressCount}</div>
        </div>
        <div className="border border-emerald-500/20 rounded-xl p-5 bg-emerald-500/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-emerald-400/70 text-sm">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400/50" />
          </div>
          <div className="text-3xl font-bold text-emerald-400">{resolvedCount}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {['all', 'open', 'in_progress', 'resolved'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm transition-all ${
              activeTab === tab
                ? 'bg-white text-black font-medium'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab === 'all' ? 'All' : tab === 'in_progress' ? 'In Progress' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tickets List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-white/30" />
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="border border-white/10 border-dashed rounded-2xl p-12 text-center">
          <LifeBuoy className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No tickets yet</h3>
          <p className="text-white/50 text-sm mb-6">Create a support ticket if you need help</p>
          <button
            onClick={() => setShowCreate(true)}
            className="px-6 py-3 bg-white text-black rounded-xl font-medium hover:bg-white/90 transition-all"
          >
            Create Your First Ticket
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTickets.map((ticket) => {
            const TypeIcon = getTypeIcon(ticket.ticket_type);
            return (
              <div
                key={ticket.ticket_id}
                className="border border-white/10 rounded-xl p-5 hover:border-white/20 hover:bg-white/[0.02] transition-all cursor-pointer group"
                data-testid={`ticket-${ticket.ticket_id}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      ticket.ticket_type === 'bug' ? 'bg-red-500/10' :
                      ticket.ticket_type === 'improvement' ? 'bg-blue-500/10' :
                      'bg-white/5'
                    }`}>
                      <TypeIcon className={`w-5 h-5 ${
                        ticket.ticket_type === 'bug' ? 'text-red-400' :
                        ticket.ticket_type === 'improvement' ? 'text-blue-400' :
                        'text-white/50'
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium">{ticket.title}</h3>
                        <span className={`px-2 py-0.5 text-xs rounded-lg border ${getStatusBadge(ticket.status)}`}>
                          {ticket.status === 'in_progress' ? 'In Progress' : ticket.status}
                        </span>
                        <span className={`px-2 py-0.5 text-xs rounded ${getPriorityBadge(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                      </div>
                      <p className="text-white/50 text-sm mt-1 line-clamp-1">{ticket.description}</p>
                      {ticket.project_name && (
                        <span className="text-white/30 text-xs mt-2 block">Project: {ticket.project_name}</span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white/50 transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Ticket Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-zinc-900 border border-white/10 rounded-2xl">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-semibold">New Support Ticket</h2>
              <button
                onClick={() => setShowCreate(false)}
                className="text-white/50 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              {/* Type Selection */}
              <div>
                <label className="block text-sm text-white/60 mb-3">Type</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'bug', label: 'Bug', icon: Bug, color: 'red' },
                    { id: 'improvement', label: 'Improvement', icon: Lightbulb, color: 'blue' },
                    { id: 'question', label: 'Question', icon: HelpCircle, color: 'zinc' }
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setNewTicket(prev => ({ ...prev, ticket_type: type.id }))}
                      className={`p-4 rounded-xl border text-center transition-all ${
                        newTicket.ticket_type === type.id
                          ? `border-${type.color}-500/50 bg-${type.color}-500/10`
                          : 'border-white/10 hover:border-white/20'
                      }`}
                    >
                      <type.icon className={`w-6 h-6 mx-auto mb-2 ${
                        newTicket.ticket_type === type.id ? `text-${type.color}-400` : 'text-white/40'
                      }`} />
                      <span className="text-sm">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Project */}
              {projects.length > 0 && (
                <div>
                  <label className="block text-sm text-white/60 mb-2">Project (optional)</label>
                  <select
                    value={newTicket.project_id}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, project_id: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30"
                  >
                    <option value="">General</option>
                    {projects.map(p => (
                      <option key={p.project_id} value={p.project_id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-sm text-white/60 mb-2">Title</label>
                <input
                  type="text"
                  value={newTicket.title}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Brief summary of the issue..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-white/30"
                  data-testid="ticket-title-input"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm text-white/60 mb-2">Description</label>
                <textarea
                  value={newTicket.description}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the issue in detail..."
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 resize-none"
                  data-testid="ticket-description-input"
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm text-white/60 mb-2">Priority</label>
                <div className="flex gap-3">
                  {['low', 'medium', 'high'].map((p) => (
                    <button
                      key={p}
                      onClick={() => setNewTicket(prev => ({ ...prev, priority: p }))}
                      className={`flex-1 py-2.5 rounded-xl text-sm capitalize transition-all ${
                        newTicket.priority === p
                          ? p === 'high' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                            p === 'medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                            'bg-zinc-500/20 text-zinc-400 border border-zinc-500/30'
                          : 'border border-white/10 text-white/50 hover:border-white/20'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-white/10 flex gap-3">
              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 py-3 border border-white/20 rounded-xl text-white/60 hover:text-white transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || !newTicket.title.trim() || !newTicket.description.trim()}
                className="flex-1 py-3 bg-white text-black rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                data-testid="submit-ticket-btn"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Ticket'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientSupport;
