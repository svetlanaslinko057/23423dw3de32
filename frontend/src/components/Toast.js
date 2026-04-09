import { useState, useCallback, createContext, useContext } from 'react';
import { X, Bell, AlertCircle, CheckCircle2, Info } from 'lucide-react';

// Context
const ToastContext = createContext(null);

// Toast types
const TOAST_TYPES = {
  info: { icon: Info, class: 'border-white/20 bg-white/5' },
  success: { icon: CheckCircle2, class: 'border-emerald-500/30 bg-emerald-500/10' },
  warning: { icon: Bell, class: 'border-amber-500/30 bg-amber-500/10' },
  error: { icon: AlertCircle, class: 'border-red-500/30 bg-red-500/10' },
};

// Toast Provider
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-[100] space-y-3 max-w-sm">
        {toasts.map(toast => (
          <ToastItem 
            key={toast.id} 
            toast={toast} 
            onClose={() => removeToast(toast.id)} 
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// Toast Item Component
function ToastItem({ toast, onClose }) {
  const config = TOAST_TYPES[toast.type] || TOAST_TYPES.info;
  const Icon = config.icon;

  return (
    <div 
      className={`flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl animate-slide-up ${config.class}`}
      data-testid="toast"
    >
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <p className="text-sm flex-1">{toast.message}</p>
      <button 
        onClick={onClose}
        className="text-white/40 hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// Hook to use toast
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

export default ToastProvider;
