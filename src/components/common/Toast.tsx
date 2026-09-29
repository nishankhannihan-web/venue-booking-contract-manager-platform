import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: () => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 3200);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  return (
    <div className="pointer-events-auto p-3.5 bg-[#0D2440] text-white rounded-xl shadow-lg border border-[#7BA4D0]/30 flex items-center justify-between gap-3 animate-in slide-in-from-bottom-3 duration-200">
      <div className="flex items-center gap-2.5 text-xs font-medium">
        {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
        {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
        {toast.type === 'info' && <Info className="w-4 h-4 text-[#7BA4D0] shrink-0" />}
        <span>{toast.message}</span>
      </div>

      <button
        onClick={onDismiss}
        className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
