import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { ToastType } from '../../utils/ToastContext';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    error: 'bg-rose-50 border-rose-200 text-rose-800',
    info: 'bg-indigo-50 border-indigo-200 text-indigo-800',
  };

  const icons = {
    success: <CheckCircle size={18} className="text-emerald-600" />,
    error: <AlertCircle size={18} className="text-rose-600" />,
    info: <Info size={18} className="text-indigo-600" />,
  };

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg animate-fade-in-up min-w-[300px] ${styles[type]}`}>
      {icons[type]}
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button onClick={onClose} className="p-1 hover:bg-black/5 rounded-full transition-colors">
        <X size={14} />
      </button>
    </div>
  );
};
