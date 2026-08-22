import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function ForbiddenPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8 flex flex-col items-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
          <ShieldAlert size={32} />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">403 — Access Denied</h1>
        <p className="text-slate-600 mb-6 text-sm">
          You don't have permission to access this page. This section is restricted to platform administrators only.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
        >
          <ArrowLeft size={18} />
          <span>Go to Dashboard</span>
        </button>
      </div>
    </div>
  );
}
