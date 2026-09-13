import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 5);
    const newToast = { id, message, type };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container" aria-live="polite">
        {toasts.map((t) => {
          let Icon = CheckCircle2;
          let color = '#10B981';
          let border = '#A7F3D0';

          if (t.type === 'error') {
            Icon = AlertCircle;
            color = '#EF4444';
            border = '#FECACA';
          } else if (t.type === 'warning') {
            Icon = AlertTriangle;
            color = '#F59E0B';
            border = '#FDE68A';
          } else if (t.type === 'info') {
            Icon = Info;
            color = '#3B82F6';
            border = '#BFDBFE';
          }

          return (
            <div
              key={t.id}
              className="toast"
              style={{ borderLeft: `4px solid ${color}` }}
            >
              <Icon size={20} color={color} style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, fontSize: '0.875rem', fontWeight: 500 }}>
                {t.message}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                style={{
                  color: '#94A3B8',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
