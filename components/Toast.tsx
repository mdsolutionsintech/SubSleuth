import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { ToastMessage } from '../types';

interface ToastProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 dark:text-rose-400" />,
    info: <Info className="w-5 h-5 text-blue-500 dark:text-blue-400" />
  };

  const bgColors = {
    success: 'bg-white dark:bg-slate-800 border-green-100 dark:border-green-900',
    error: 'bg-white dark:bg-slate-800 border-rose-100 dark:border-rose-900',
    info: 'bg-white dark:bg-slate-800 border-blue-100 dark:border-blue-900'
  };

  return (
    <div className={`pointer-events-auto flex items-center gap-3 min-w-[300px] p-4 rounded-xl shadow-lg border ${bgColors[toast.type]} animate-in slide-in-from-right-full duration-300`}>
      {icons[toast.type]}
      <p className="text-sm font-medium text-slate-800 dark:text-slate-100 flex-1">{toast.message}</p>
      <button onClick={() => onRemove(toast.id)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};