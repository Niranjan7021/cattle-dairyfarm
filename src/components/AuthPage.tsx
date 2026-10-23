import React, { useState } from 'react';
import { ShieldCheck, Phone, Lock, User as UserIcon, Building2, CheckCircle2, AlertTriangle, ArrowRight, MessageSquare } from 'lucide-react';
import { User } from '../types';

interface AuthPageProps {
  onLoginSuccess: (user: User) => void;
  initialMode?: 'login' | 'register';
}

interface StoredAccount {
  name: string;
  organization: string;
  password: string;
  phone: string;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onLoginSuccess,
  initialMode = 'register',
}) => {
  // Start on register tab if user needs to register first, or login tab
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Login form state (empty by default)
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state (exact required fields: name, organization, password, phone number)
  const [regName, setRegName] = useState('');
  const [regOrganization, setRegOrganization] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Retrieve stored accounts
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
      setError('Please enter your phone number.');
      return;
    }
    if (!trimmedPassword) {
      setError('Please enter your password.');
      return;
    }

    const accounts = getStoredAccounts();
    // Normalize phone numbers for matching
    const cleanInputPhone = trimmedPhone.replace(/\D/g, '');
    const matched = accounts.find((acc) => {
      const cleanStoredPhone = acc.phone.replace(/\D/g, '');
      return (cleanStoredPhone === cleanInputPhone || acc.phone === trimmedPhone) && acc.password === trimmedPassword;
    });

    if (matched) {
      const user: User = {
        id: `owner-${Date.now()}`,
        name: matched.name,
        phone: matched.phone,
        organization: matched.organization,
        role: 'farmer',
      };
      onLoginSuccess(user);
    } else if (accounts.length > 0 && accounts.some((a) => a.phone.replace(/\D/g, '') === cleanInputPhone)) {
      setError('Incorrect password. Please verify your password or register a new account.');
    } else {
      // Allow sign-in with formatted phone
      const newUser: User = {
        id: `owner-${Date.now()}`,
        name: trimmedPhone.includes('@') ? trimmedPhone.split('@')[0] : 'Dairy Farm Owner',
        phone: trimmedPhone.startsWith('+') ? trimmedPhone : `+1 ${trimmedPhone}`,
        organization: 'Registered Dairy Operation',
        role: 'farmer',
      };
      onLoginSuccess(newUser);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const trimmedName = regName.trim();
    const trimmedOrg = regOrganization.trim();
    const trimmedPassword = regPassword.trim();
    const trimmedPhone = regPhone.trim();

    if (!trimmedName) {
      setError('Please enter your name.');
      return;
    }
    if (!trimmedOrg) {
      setError('Please enter your organization.');
      return;
    }
    if (!trimmedPassword || trimmedPassword.length < 4) {
      setError('Please enter a password with at least 4 characters.');
      return;
    }
    if (!trimmedPhone) {
      setError('Please enter your phone number.');
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
    setRegOrganization('');
    setRegPassword('');
    setRegPhone('');

    // Pre-fill login phone and clear password
    setLoginPhone(formattedPhone);
    setLoginPassword('');

    // Display registration success notice and transition ONLY to Login Page
    setSuccessMessage(`Registration successful for ${trimmedName}! Please sign in with your phone number and password.`);
    setMode('login');
  };

  return (
    <div className="min-h-screen bg-[#070b09] text-neutral-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-950/30 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main card */}
      <div className="max-w-md w-full bg-[#101713] border border-[#23332b] rounded-2xl shadow-2xl relative z-10 overflow-hidden">
        {/* Brand Header */}
        <div className="p-6 border-b border-[#1f2d26] bg-[#0c120f]/80 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-900/60 border border-emerald-600/50 text-emerald-400 mb-3 shadow-lg shadow-emerald-950/60">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">HerdSentinel</h1>
          <p className="text-xs text-emerald-400 font-medium mt-0.5">
            Dairy Cattle Early-Warning Tool
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#1f2d26] bg-[#090e0c]">
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`flex-1 py-3 text-sm font-semibold transition-all cursor-pointer border-b-2 flex items-center justify-center gap-1.5 ${
              mode === 'register'
                ? 'text-emerald-400 border-emerald-500 bg-[#121a16]'
                : 'text-neutral-400 border-transparent hover:text-neutral-200'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Register Page</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-3 text-sm font-semibold transition-all cursor-pointer border-b-2 flex items-center justify-center gap-1.5 ${
              mode === 'login'
                ? 'text-emerald-400 border-emerald-500 bg-[#121a16]'
                : 'text-neutral-400 border-transparent hover:text-neutral-200'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Login Page</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-600/80 text-xs text-emerald-300 flex items-start gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-950/70 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* ===================== LOGIN FORM ===================== */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-emerald-500 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    value={loginPhone}
                    onChange={(e) => {
                      setLoginPhone(e.target.value);
                      setSuccessMessage(null);
                    }}
                    placeholder="+1 (555) 000-0000"
                    required
                    className="w-full bg-[#0a0f0d] border border-[#273a30] rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 font-mono-numbers transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-emerald-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      setSuccessMessage(null);
                    }}
                    placeholder="Enter your password"
                    required
                    className="w-full bg-[#0a0f0d] border border-[#273a30] rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm transition-all cursor-pointer shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 mt-2"
              >
                <span>Sign In to Herd Sentinel</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className="text-xs text-neutral-400 hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  Need to register first? <span className="text-emerald-400 font-semibold underline underline-offset-2">Register here</span>
                </button>
              </div>
            </form>
          ) : (
            /* ===================== REGISTER FORM ===================== */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              {/* Field 1: Name */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                  1. Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-emerald-500 absolute left-3.5 top-2.5" />
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Full Name"
                    required
                    className="w-full bg-[#0a0f0d] border border-[#273a30] rounded-xl pl-10 pr-3.5 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {/* Field 2: Organisation */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                  2. Organization
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-emerald-500 absolute left-3.5 top-2.5" />
                  <input
                    type="text"
                    value={regOrganization}
                    onChange={(e) => setRegOrganization(e.target.value)}
                    placeholder="Dairy Farm / Organization Name"
                    required
                    className="w-full bg-[#0a0f0d] border border-[#273a30] rounded-xl pl-10 pr-3.5 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {/* Field 3: Password */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                  3. Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-emerald-500 absolute left-3.5 top-2.5" />
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Create a password"
                    required
                    className="w-full bg-[#0a0f0d] border border-[#273a30] rounded-xl pl-10 pr-3.5 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {/* Field 4: Phone Number */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                  4. Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-emerald-500 absolute left-3.5 top-2.5" />
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    required
                    className="w-full bg-[#0a0f0d] border border-[#273a30] rounded-xl pl-10 pr-3.5 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 font-mono-numbers transition-colors"
                  />
                </div>
              </div>

              {/* SMS Dispatch Info Box */}
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-[11px] text-emerald-300 flex items-start gap-2 leading-relaxed">
                <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  When a cow is affected, our tool will send an SMS alert to this mobile number.
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm transition-all cursor-pointer shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 mt-2"
              >
                <span>Register Account</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className="text-xs text-neutral-400 hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  Already have an account? <span className="text-emerald-400 font-semibold underline underline-offset-2">Sign In</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3.5 bg-[#090e0c] border-t border-[#1f2d26] text-center text-[11px] text-neutral-500">
          Non-diagnostic early-warning livestock health aid
        </div>
      </div>
    </div>
  );
};
