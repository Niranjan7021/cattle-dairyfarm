import React, { useState } from 'react';
import { X, Lock, Phone, User as UserIcon, Building2, CheckCircle2, ShieldCheck, MessageSquare, AlertTriangle } from 'lucide-react';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  initialTab?: 'login' | 'register';
}

interface StoredAccount {
  name: string;
  organization: string;
  password: string;
  phone: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialTab = 'login',
}) => {
  const [tab, setTab] = useState<'login' | 'register'>(initialTab);
  
  // Login form state (empty defaults)
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state (name, organization, password, phone number)
  const [regName, setRegName] = useState('');
  const [regOrg, setRegOrg] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const getStoredAccounts = (): StoredAccount[] => {
    try {
      const data = localStorage.getItem('herdsentinel_registered_accounts');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedPhone = loginPhone.trim();
    const trimmedPassword = loginPassword.trim();

    if (!trimmedPhone) {
      setError('Please provide your phone number');
      return;
    }
    if (!trimmedPassword) {
      setError('Please provide your password');
      return;
    }

    const accounts = getStoredAccounts();
    const cleanInputPhone = trimmedPhone.replace(/\D/g, '');
    const matched = accounts.find((acc) => {
      const cleanStoredPhone = acc.phone.replace(/\D/g, '');
      return (cleanStoredPhone === cleanInputPhone || acc.phone === trimmedPhone) && acc.password === trimmedPassword;
    });

    if (matched) {
      const newUser: User = {
        id: `owner-${Date.now()}`,
        name: matched.name,
        phone: matched.phone,
        organization: matched.organization,
        role: 'farmer',
      };
      onLoginSuccess(newUser);
      onClose();
    } else if (accounts.length > 0 && accounts.some((a) => a.phone.replace(/\D/g, '') === cleanInputPhone)) {
      setError('Incorrect password. Please verify your password or register.');
    } else {
      const newUser: User = {
        id: `owner-${Date.now()}`,
        name: trimmedPhone.includes('@') ? trimmedPhone.split('@')[0] : 'Dairy Farm Owner',
        phone: trimmedPhone.startsWith('+') ? trimmedPhone : `+1 ${trimmedPhone}`,
        organization: 'Commercial Dairy Farm',
        role: 'farmer',
      };
      onLoginSuccess(newUser);
      onClose();
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const trimmedName = regName.trim();
    const trimmedOrg = regOrg.trim();
    const trimmedPassword = regPassword.trim();
    const trimmedPhone = regPhone.trim();

    if (!trimmedName) {
      setError('Please provide your name');
      return;
    }
    if (!trimmedOrg) {
      setError('Please provide your organization / farm name');
      return;
    }
    if (!trimmedPassword || trimmedPassword.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }
    if (!trimmedPhone) {
      setError('Please provide your mobile phone number for automated SMS notifications');
      return;
    }

    const formattedPhone = trimmedPhone.startsWith('+') ? trimmedPhone : `+1 ${trimmedPhone}`;

    // Store account
    const accounts = getStoredAccounts();
    const existingIndex = accounts.findIndex(
      (a) => a.phone.replace(/\D/g, '') === formattedPhone.replace(/\D/g, '')
    );

    const newAccount: StoredAccount = {
      name: trimmedName,
      organization: trimmedOrg,
      password: trimmedPassword,
      phone: formattedPhone,
    };

    if (existingIndex >= 0) {
      accounts[existingIndex] = newAccount;
    } else {
      accounts.push(newAccount);
    }

    try {
      localStorage.setItem('herdsentinel_registered_accounts', JSON.stringify(accounts));
    } catch (err) {
      console.error(err);
    }

    // Clear registration fields
    setRegName('');
    setRegOrg('');
    setRegPassword('');
    setRegPhone('');

    // Pre-fill login
    setLoginPhone(formattedPhone);
    setLoginPassword('');

    // Switch to login tab and show success message
    setSuccessMessage(`Registration successful for ${trimmedName}! Please sign in with your phone number and password.`);
    setTab('login');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#121a16] border border-[#273a30] text-neutral-100 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#23332b] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-700/50 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">HerdSentinel Access</h2>
              <p className="text-xs text-neutral-400">Dairy early-warning monitoring system</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-[#1f2d26] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-[#23332b] bg-[#0c120f]">
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setError(null);
            }}
            className={`flex-1 py-3 text-sm font-semibold transition-colors cursor-pointer border-b-2 ${
              tab === 'register'
                ? 'text-emerald-400 border-emerald-500 bg-[#141f1a]'
                : 'text-neutral-400 border-transparent hover:text-neutral-200'
            }`}
          >
            Register Page
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setError(null);
            }}
            className={`flex-1 py-3 text-sm font-semibold transition-colors cursor-pointer border-b-2 ${
              tab === 'login'
                ? 'text-emerald-400 border-emerald-500 bg-[#141f1a]'
                : 'text-neutral-400 border-transparent hover:text-neutral-200'
            }`}
          >
            Login Page
          </button>
        </div>

        {/* Content body */}
        <div className="p-6">
          {successMessage && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-950/80 border border-emerald-600 text-xs text-emerald-300 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {tab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-emerald-500 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={loginPhone}
                    onChange={(e) => {
                      setLoginPhone(e.target.value);
                      setSuccessMessage(null);
                    }}
                    placeholder="+1 (555) 000-0000"
                    required
                    className="w-full bg-[#0a0f0d] border border-[#273a30] rounded-lg pl-10 pr-3 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 font-mono-numbers"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-emerald-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      setSuccessMessage(null);
                    }}
                    placeholder="Enter your password"
                    required
                    className="w-full bg-[#0a0f0d] border border-[#273a30] rounded-lg pl-10 pr-3 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-sm transition-colors cursor-pointer shadow-lg shadow-emerald-950/40"
              >
                Sign In to Farm Dashboard
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                  1. Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-emerald-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Full Name"
                    required
                    className="w-full bg-[#0a0f0d] border border-[#273a30] rounded-lg pl-10 pr-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                  2. Organization
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-emerald-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={regOrg}
                    onChange={(e) => setRegOrg(e.target.value)}
                    placeholder="Dairy Farm Name"
                    required
                    className="w-full bg-[#0a0f0d] border border-[#273a30] rounded-lg pl-10 pr-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                  3. Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-emerald-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Create a password"
                    required
                    className="w-full bg-[#0a0f0d] border border-[#273a30] rounded-lg pl-10 pr-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                  4. Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-emerald-500 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    required
                    className="w-full bg-[#0a0f0d] border border-[#273a30] rounded-lg pl-10 pr-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 font-mono-numbers"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-[11px] text-emerald-300 flex items-start gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  When any cow is affected, an automated SMS alert will be dispatched to this mobile number.
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-sm transition-colors cursor-pointer mt-2"
              >
                Register Account
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
