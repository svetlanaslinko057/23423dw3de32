import { useEffect } from 'react';
import { useRealtimeEvents, useRealtimeSetup } from '../hooks/useRealtime';
import { useToast } from './Toast';

/**
 * Executor Realtime Bridge
 * Handles real-time events for developers
 */
export function ExecutorRealtimeBridge({ userId, onRefresh }) {
  const { addToast } = useToast();

  // Setup rooms
  useRealtimeSetup(userId, 'executor');

  // Handle events
  useRealtimeEvents({
    'workunit.assigned': (payload) => {
      addToast(`New task assigned: ${payload.title}`, 'warning');
      onRefresh?.();
    },
    
    'workunit.revision_requested': (payload) => {
      addToast(`Revision required: ${payload.title}`, 'error');
      onRefresh?.();
    },
    
    'submission.reviewed': (payload) => {
      const msg = payload.result === 'approved' 
        ? `Task approved!${payload.feedback ? ` - ${payload.feedback}` : ''}`
        : `Task needs revision: ${payload.feedback}`;
      addToast(msg, payload.result === 'approved' ? 'success' : 'warning');
      onRefresh?.();
    },
  });

  return null;
}

/**
 * Tester Realtime Bridge
 */
export function TesterRealtimeBridge({ userId, onRefresh }) {
  const { addToast } = useToast();

  useRealtimeSetup(userId, 'tester');

  useRealtimeEvents({
    'validation.created': (payload) => {
      addToast(`New validation task: ${payload.title}`, 'warning');
      onRefresh?.();
    },
  });

  return null;
}

/**
 * Client Realtime Bridge
 */
export function ClientRealtimeBridge({ userId, projectIds = [], onRefresh }) {
  const { addToast } = useToast();

  useRealtimeSetup(userId, 'client', projectIds.map(id => `project:${id}`));

  useRealtimeEvents({
    'deliverable.created': (payload) => {
      addToast(`New deliverable ready: ${payload.title} (${payload.version})`, 'success');
      onRefresh?.();
    },
    
    'project.updated': (payload) => {
      addToast(`Project updated: ${payload.name || payload.project_id}`, 'info');
      onRefresh?.();
    },
    
    'support.updated': (payload) => {
      addToast(`Support ticket updated`, 'info');
      onRefresh?.();
    },
  });

  return null;
}

/**
 * Admin Realtime Bridge
 */
export function AdminRealtimeBridge({ userId, onRefresh }) {
  const { addToast } = useToast();

  useRealtimeSetup(userId, 'admin');

  useRealtimeEvents({
    'submission.created': (payload) => {
      addToast(`New submission: ${payload.title}`, 'warning');
      onRefresh?.();
    },
    
    'validation.created': (payload) => {
      addToast(`New validation task`, 'info');
      onRefresh?.();
    },
    
    'alert.created': (payload) => {
      addToast(`Alert: ${payload.message}`, 'error');
      onRefresh?.();
    },
  });

  return null;
}

export default ExecutorRealtimeBridge;
