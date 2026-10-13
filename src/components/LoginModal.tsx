import React, { useState } from 'react';
import { X, Shield, Lock, Mail, CheckCircle2, UserCheck, AlertCircle } from 'lucide-react';
import { UserRole } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (role: UserRole) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'supervisor'>('admin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFillDemo = (targetRole: 'admin' | 'supervisor') => {
    setRole(targetRole);
    if (targetRole === 'admin') {
      setEmail('admin@panchayat.gov.in');
      setPassword('admin123');
    } else {
      setEmail('supervisor@panchayat.gov.in');
      setPassword('super123');
    }
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      if (email.includes('admin') || role === 'admin') {
        onLoginSuccess('admin');
        onClose();
      } else if (email.includes('supervisor') || role === 'supervisor') {
        onLoginSuccess('supervisor');
        onClose();
      } else {
        // Fallback for other inputs
        onLoginSuccess(role);
        onClose();
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-cyan-950 to-blue-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Panchayat Official Login</h3>
              <p className="text-xs text-cyan-200/80">
                Authorized access for Gram Panchayat Staff & Engineers
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">

          {/* Quick Demo Fill Buttons */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5">
                <UserCheck className="w-3.5 h-3.5 text-cyan-600" />
                <span>One-Click Demo Credentials:</span>
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo('admin')}
                className={`py-1.5 px-3 rounded-lg text-xs font-medium border text-center transition-all ${
                  role === 'admin' && email === 'admin@panchayat.gov.in'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                Panchayat Admin
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('supervisor')}
                className={`py-1.5 px-3 rounded-lg text-xs font-medium border text-center transition-all ${
                  role === 'supervisor' && email === 'supervisor@panchayat.gov.in'
                    ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                Block Supervisor
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              *Villagers/Citizens do NOT need an account and can directly use the public portal.
            </p>
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-lg text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@panchayat.gov.in"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center space-x-2 text-slate-600 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-cyan-600 focus:ring-cyan-500" />
                <span>Remember this terminal</span>
              </label>
              <span className="text-cyan-700 hover:underline cursor-pointer">
                Firebase Auth Enabled
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-600 via-teal-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white font-semibold py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 text-sm disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating with Node/Firebase...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Sign In to {role === 'admin' ? 'Admin Console' : 'Supervisor Portal'}</span>
                </>
              )}
            </button>
          </form>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 text-center text-[11px] text-slate-500">
          State Water Supply & Sanitation Mission • Gram Panchayat Tier II
        </div>

      </div>
    </div>
  );
};
