import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth, API } from '@/App';
import axios from 'axios';
import {
  ArrowLeft,
  Package,
  CheckCircle2,
  XCircle,
  ExternalLink,
  MessageSquare,
  Clock,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  FileText,
  Download
} from 'lucide-react';

const ClientDeliverable = () => {
  const { deliverableId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [deliverable, setDeliverable] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [projectsRes] = await Promise.all([
        axios.get(`${API}/projects/mine`, { withCredentials: true })
      ]);
      
      // Find the deliverable in projects
      for (const proj of projectsRes.data) {
        try {
          const delRes = await axios.get(`${API}/projects/${proj.project_id}/deliverables`, { withCredentials: true });
          const found = delRes.data.find(d => d.deliverable_id === deliverableId);
          if (found) {
            setDeliverable(found);
            setProject(proj);
            break;
          }
        } catch (e) {
          // Continue searching
        }
      }
    } catch (error) {
      console.error('Error fetching deliverable:', error);
    } finally {
      setLoading(false);
    }
  }, [deliverableId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await axios.post(`${API}/deliverables/${deliverableId}/approve`, {
        feedback: feedback || 'Approved'
      }, { withCredentials: true });
      
      await fetchData();
      setShowFeedback(false);
    } catch (error) {
      console.error('Error approving:', error);
      alert('Failed to approve deliverable');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!feedback.trim()) {
      alert('Please provide feedback for rejection');
      return;
    }
    
    setActionLoading(true);
    try {
      await axios.post(`${API}/deliverables/${deliverableId}/reject`, {
        feedback: feedback.trim()
      }, { withCredentials: true });
      
      await fetchData();
      setShowFeedback(false);
    } catch (error) {
      console.error('Error rejecting:', error);
      alert('Failed to reject deliverable');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!deliverable) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center">
        <div className="text-center">
          <Package className="w-12 h-12 text-white/30 mx-auto mb-4" />
          <p className="text-white/50 mb-4">Deliverable not found</p>
          <button onClick={() => navigate('/client/dashboard')} className="text-white underline">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isPending = deliverable.status === 'pending';
  const isApproved = deliverable.status === 'approved';

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white" data-testid="client-deliverable">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <span className="text-lg font-bold tracking-tight">Dev OS</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Status Banner */}
        {isApproved && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 mb-8 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            <div>
              <span className="font-medium text-emerald-400">Approved</span>
              <p className="text-white/60 text-sm">This deliverable has been accepted</p>
            </div>
          </div>
        )}
        
        {deliverable.status === 'rejected' && (
          <div className="bg-red-500/10 border border-red-500/30 p-4 mb-8 flex items-center gap-3">
            <XCircle className="w-6 h-6 text-red-400" />
            <div>
              <span className="font-medium text-red-400">Changes Requested</span>
              <p className="text-white/60 text-sm">Your feedback has been sent to the team</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div>
              <div className="text-white/50 text-sm mb-2">{project?.name}</div>
              <h1 className="text-3xl font-bold tracking-tight">{deliverable.title}</h1>
            </div>

            {/* Description */}
            <div className="border border-white/10 p-6 bg-white/[0.02]">
              <h2 className="text-sm text-white/50 mb-3">Description</h2>
              <p className="text-white/80 leading-relaxed">
                {deliverable.description || 'No description provided'}
              </p>
            </div>

            {/* Resources */}
            {deliverable.links?.length > 0 && (
              <div className="border border-white/10 p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-white/50" />
                  Resources
                </h2>
                <div className="space-y-3">
                  {deliverable.links.map((link, i) => (
                    <a
                      key={i}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all group"
                    >
                      <ExternalLink className="w-5 h-5 text-blue-400" />
                      <span className="flex-1 text-white/80 group-hover:text-white truncate">{link}</span>
                      <Download className="w-4 h-4 text-white/30 group-hover:text-white/60" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Feedback Section */}
            {deliverable.client_feedback && (
              <div className="border border-white/10 p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-white/50" />
                  Your Feedback
                </h2>
                <p className="text-white/70">{deliverable.client_feedback}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Card */}
            {isPending && (
              <div className="border border-emerald-500/30 bg-emerald-500/5 p-6">
                <h3 className="font-semibold mb-2">Review Required</h3>
                <p className="text-white/60 text-sm mb-4">
                  Please review this deliverable and let us know if it meets your expectations.
                </p>

                {!showFeedback ? (
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        setShowFeedback(false);
                        handleApprove();
                      }}
                      disabled={actionLoading}
                      className="w-full bg-emerald-500 text-white p-3 font-medium flex items-center justify-center gap-2 hover:bg-emerald-600 disabled:opacity-50 transition-all"
                    >
                      {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><ThumbsUp className="w-5 h-5" /> Approve</>}
                    </button>
                    <button
                      onClick={() => setShowFeedback(true)}
                      className="w-full border border-white/20 p-3 font-medium flex items-center justify-center gap-2 hover:bg-white/5 transition-all"
                    >
                      <ThumbsDown className="w-5 h-5" />
                      Request Changes
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="What changes would you like to see?"
                      className="w-full bg-white/5 border border-white/10 p-3 text-white h-24 resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowFeedback(false)}
                        className="flex-1 border border-white/20 p-2 text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleReject}
                        disabled={actionLoading || !feedback.trim()}
                        className="flex-1 bg-amber-500 text-black p-2 text-sm font-medium disabled:opacity-50"
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Info */}
            <div className="border border-white/10 p-6">
              <h3 className="font-semibold mb-4">Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/50">Status</span>
                  <span className={`capitalize ${
                    isApproved ? 'text-emerald-400' : 
                    deliverable.status === 'rejected' ? 'text-red-400' : 
                    'text-amber-400'
                  }`}>
                    {deliverable.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Resources</span>
                  <span>{deliverable.links?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Delivered</span>
                  <span>{new Date(deliverable.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Support */}
            <div className="border border-white/10 p-6">
              <h3 className="font-semibold mb-3">Need Help?</h3>
              <p className="text-white/50 text-sm mb-4">
                Questions about this deliverable?
              </p>
              <button 
                onClick={() => navigate(`/client/projects/${project?.project_id}`)}
                className="w-full border border-white/20 p-3 text-sm hover:bg-white/5 transition-all flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientDeliverable;
