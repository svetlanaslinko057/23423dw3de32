import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API } from '@/App';
import axios from 'axios';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Play,
  Clock,
  AlertCircle,
  CheckCircle2,
  Search,
  Loader2,
  X,
  Send,
  Timer,
  ChevronRight
} from 'lucide-react';

// Constants
const ALLOWED_TRANSITIONS = {
  assigned: ['in_progress'],
  in_progress: ['review'],
  revision: ['in_progress'],
  review: [],
  submitted: [],
  validation: [],
  done: [],
  completed: [],
};

const COLUMNS = [
  { id: 'assigned', title: 'Assigned' },
  { id: 'in_progress', title: 'In Progress' },
  { id: 'review', title: 'Review' },
  { id: 'revision', title: 'Revision' },
  { id: 'completed', title: 'Done' },
];

const STATUS_MAP = {
  assigned: 'assigned',
  in_progress: 'in_progress',
  submitted: 'review',
  review: 'review',
  validation: 'review',
  revision: 'revision',
  completed: 'completed',
  done: 'completed',
};

const ExecutorBoard = () => {
  const navigate = useNavigate();
  const [workUnits, setWorkUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [submissionModal, setSubmissionModal] = useState({ open: false, unitId: null });
  const [submissionData, setSubmissionData] = useState({ summary: '', links: '' });
  const [submitting, setSubmitting] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const fetchWorkUnits = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/developer/work-units`, { withCredentials: true });
      setWorkUnits(res.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkUnits();
  }, [fetchWorkUnits]);

  const getColumnUnits = (columnId) => {
    return workUnits.filter(unit => {
      const mappedStatus = STATUS_MAP[unit.status] || unit.status;
      if (mappedStatus !== columnId) return false;
      if (searchQuery && !unit.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  };

  const stats = {
    assigned: workUnits.filter(u => u.status === 'assigned').length,
    in_progress: workUnits.filter(u => u.status === 'in_progress').length,
    review: workUnits.filter(u => ['submitted', 'review', 'validation'].includes(u.status)).length,
    revision: workUnits.filter(u => u.status === 'revision').length,
  };

  const handleDragStart = (event) => setActiveId(event.active.id);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const unit = workUnits.find(u => u.unit_id === active.id);
    if (!unit) return;

    const currentColumn = STATUS_MAP[unit.status] || unit.status;
    const targetColumn = over.id;
    if (currentColumn === targetColumn) return;

    const allowedTargets = ALLOWED_TRANSITIONS[unit.status] || [];
    let targetStatus = targetColumn;
    if (targetColumn === 'review') targetStatus = 'submitted';
    if (targetColumn === 'completed') return;

    if (!allowedTargets.includes(targetStatus)) return;

    if (unit.status === 'in_progress' && targetStatus === 'submitted') {
      setSubmissionModal({ open: true, unitId: unit.unit_id });
      return;
    }

    await executeTransition(unit.unit_id, targetStatus);
  };

  const executeTransition = async (unitId, newStatus) => {
    try {
      if (newStatus === 'in_progress') {
        await axios.post(`${API}/developer/work-units/${unitId}/start`, {}, { withCredentials: true });
      } else {
        await axios.patch(`${API}/work-units/${unitId}/status`, { status: newStatus }, { withCredentials: true });
      }
      await fetchWorkUnits();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async () => {
    if (!submissionData.summary.trim()) return;
    setSubmitting(true);
    try {
      const links = submissionData.links.split('\n').map(l => l.trim()).filter(l => l);
      await axios.post(`${API}/work-units/${submissionModal.unitId}/submit`, 
        { summary: submissionData.summary, links, attachments: [] },
        { withCredentials: true }
      );
      setSubmissionModal({ open: false, unitId: null });
      setSubmissionData({ summary: '', links: '' });
      await fetchWorkUnits();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const activeUnit = activeId ? workUnits.find(u => u.unit_id === activeId) : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-white/40" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col" data-testid="executor-board">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-medium tracking-tight">Work Board</h1>
            <p className="text-sm text-white/40 mt-1">Execution pipeline</p>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="input pl-10 w-64"
              data-testid="search-input"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <StatCard label="Assigned" value={stats.assigned} />
          <StatCard label="In Progress" value={stats.in_progress} />
          <StatCard label="Review" value={stats.review} />
          <StatCard label="Revision" value={stats.revision} highlight={stats.revision > 0} />
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto p-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 min-w-max h-full">
            {COLUMNS.map(column => (
              <BoardColumn
                key={column.id}
                column={column}
                units={getColumnUnits(column.id)}
                onOpenUnit={(unitId) => navigate(`/developer/work/${unitId}`)}
                onStartWork={(unitId) => executeTransition(unitId, 'in_progress')}
              />
            ))}
          </div>
          
          <DragOverlay>
            {activeUnit && <TaskCard unit={activeUnit} isDragging />}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Submission Modal */}
      {submissionModal.open && (
        <div className="modal-overlay flex items-center justify-center">
          <div className="w-full max-w-lg mx-4 card" data-testid="submission-modal">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium">Submit for Review</h2>
                <p className="text-sm text-white/40">Describe completed work</p>
              </div>
              <button
                onClick={() => {
                  setSubmissionModal({ open: false, unitId: null });
                  setSubmissionData({ summary: '', links: '' });
                }}
                className="p-2 text-white/40 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-label block mb-2">Summary *</label>
                <textarea
                  value={submissionData.summary}
                  onChange={(e) => setSubmissionData({ ...submissionData, summary: e.target.value })}
                  placeholder="What was completed..."
                  rows={4}
                  className="input resize-none"
                  data-testid="submission-summary"
                />
              </div>

              <div>
                <label className="text-label block mb-2">Links (one per line)</label>
                <textarea
                  value={submissionData.links}
                  onChange={(e) => setSubmissionData({ ...submissionData, links: e.target.value })}
                  placeholder="https://..."
                  rows={3}
                  className="input resize-none font-mono text-sm"
                  data-testid="submission-links"
                />
              </div>
            </div>

            <div className="p-6 border-t border-white/10 flex justify-end gap-3">
              <button
                onClick={() => {
                  setSubmissionModal({ open: false, unitId: null });
                  setSubmissionData({ summary: '', links: '' });
                }}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!submissionData.summary.trim() || submitting}
                className="btn btn-primary"
                data-testid="submit-btn"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, highlight }) => (
  <div className={`stat-card ${highlight ? 'border-white/40' : ''}`}>
    <div className="stat-value">{value}</div>
    <div className="stat-label">{label}</div>
  </div>
);

const BoardColumn = ({ column, units, onOpenUnit, onStartWork }) => {
  const { setNodeRef } = useSortable({ id: column.id, data: { type: 'column' } });

  return (
    <div
      ref={setNodeRef}
      className="kanban-column w-[280px] flex flex-col"
      data-testid={`column-${column.id}`}
    >
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <span className="text-sm font-medium">{column.title}</span>
        <span className="badge badge-mono">{units.length}</span>
      </div>

      <div className="flex-1 p-3 space-y-2 overflow-y-auto">
        <SortableContext items={units.map(u => u.unit_id)} strategy={verticalListSortingStrategy}>
          {units.map(unit => (
            <SortableCard
              key={unit.unit_id}
              unit={unit}
              onOpen={() => onOpenUnit(unit.unit_id)}
              onStart={() => onStartWork(unit.unit_id)}
            />
          ))}
        </SortableContext>
        
        {units.length === 0 && (
          <div className="text-center py-8 text-white/30 text-sm">No tasks</div>
        )}
      </div>
    </div>
  );
};

const SortableCard = ({ unit, onOpen, onStart }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: unit.unit_id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard unit={unit} onOpen={onOpen} onStart={onStart} />
    </div>
  );
};

const TaskCard = ({ unit, onOpen, onStart, isDragging }) => {
  const isRevision = unit.status === 'revision';
  
  return (
    <div
      className={`kanban-card ${isDragging ? 'border-white/30 shadow-lg' : ''} ${isRevision ? 'border-white/30' : ''}`}
      data-testid={`task-${unit.unit_id}`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <h4 className="font-medium text-sm">{unit.title}</h4>
        <StatusIcon status={unit.status} />
      </div>

      <p className="text-xs text-white/40 mb-3">{unit.project_name || 'Project'}</p>

      <div className="flex items-center gap-4 text-mono text-xs text-white/40 mb-3">
        <span className="flex items-center gap-1">
          <Timer className="w-3 h-3" />
          {unit.estimated_hours || 0}h
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {unit.actual_hours || 0}h
        </span>
      </div>

      {isRevision && (
        <div className="p-2 rounded-[6px] border border-white/20 bg-white/5 text-xs text-white/60 mb-3">
          <AlertCircle className="w-3 h-3 inline mr-1" />
          Revision required
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); onOpen?.(); }}
          className="btn btn-primary btn-sm flex-1 justify-center"
          data-testid={`open-${unit.unit_id}`}
        >
          Open
        </button>
        {unit.status === 'assigned' && (
          <button
            onClick={(e) => { e.stopPropagation(); onStart?.(); }}
            className="btn btn-secondary btn-sm"
            data-testid={`start-${unit.unit_id}`}
          >
            Start
          </button>
        )}
      </div>
    </div>
  );
};

const StatusIcon = ({ status }) => {
  const icons = {
    assigned: Play,
    in_progress: Play,
    submitted: Clock,
    review: Clock,
    revision: AlertCircle,
    completed: CheckCircle2,
  };
  
  const Icon = icons[status] || Play;
  
  return (
    <div className="w-6 h-6 rounded-[4px] bg-white/10 flex items-center justify-center">
      <Icon className="w-3 h-3" />
    </div>
  );
};

export default ExecutorBoard;
