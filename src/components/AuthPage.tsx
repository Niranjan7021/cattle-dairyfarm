import React, { useState } from 'react';
import { ShieldCheck, Lock, User as UserIcon, Building2, CheckCircle2, AlertTriangle, ArrowRight, MessageSquare } from 'lucide-react';
import { User } from '../types';
import { PhoneInputWithCountry } from './PhoneInputWithCountry';
import { signInWithGoogle } from '../lib/firebase';

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
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Login form state
  const [loginPhone, setLoginPhone] = useState('+91 ');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regOrganization, setRegOrganization] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('+91 ');

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

    if (!trimmedPhone || trimmedPhone.length < 5) {
      setError('Please enter your mobile phone number with country code.');
      return;
    }
    if (!trimmedPassword) {
      setError('Please enter your password.');
      return;
    }

    const accounts = getStoredAccounts();
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
      const newUser: User = {
        id: `owner-${Date.now()}`,
        name: trimmedPhone.includes('@') ? trimmedPhone.split('@')[0] : 'Dairy Farm Owner',
        phone: trimmedPhone.startsWith('+') ? trimmedPhone : `+91 ${trimmedPhone}`,
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
    if (!trimmedPhone || trimmedPhone.length < 5) {
      setError('Please enter your mobile phone number.');
      return;
    }

    const formattedPhone = trimmedPhone.startsWith('+') ? trimmedPhone : `+91 ${trimmedPhone}`;

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

    setRegName('');
    setRegOrganization('');
    setRegPassword('');
    setRegPhone('');

    setLoginPhone(formattedPhone);
    setLoginPassword('');

    setSuccessMessage(`Registration successful for ${trimmedName}! Please sign in with your phone number and password.`);
    setMode('login');
  };

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden bg-[var(--bg-app)] text-[var(--text-primary)] transition-colors">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-100/40 dark:bg-emerald-950/30 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main card */}
      <div className="max-w-md w-full bg-white dark:bg-[#101713] border border-neutral-200 dark:border-[#23332b] rounded-2xl shadow-xl relative z-10 overflow-hidden transition-colors">
        {/* Brand Header */}
        <div className="p-6 border-b border-neutral-200 dark:border-[#1f2d26] bg-neutral-50/80 dark:bg-[#0c120f]/80 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-600/50 text-emerald-700 dark:text-emerald-400 mb-3 shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-extrabold text-neutral-900 dark:text-white tracking-tight">HerdSentinel</h1>
          <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium mt-0.5">
            Dairy Cattle Early-Warning Tool
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-neutral-200 dark:border-[#1f2d26] bg-neutral-100/70 dark:bg-[#090e0c]">
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`flex-1 py-3 text-sm font-semibold transition-all cursor-pointer border-b-2 flex items-center justify-center gap-1.5 ${
              mode === 'register'
                ? 'text-emerald-700 dark:text-emerald-400 border-emerald-600 dark:border-emerald-500 bg-white dark:bg-[#121a16]'
                : 'text-neutral-500 dark:text-neutral-400 border-transparent hover:text-neutral-900 dark:hover:text-neutral-200'
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
                ? 'text-emerald-700 dark:text-emerald-400 border-emerald-600 dark:border-emerald-500 bg-white dark:bg-[#121a16]'
                : 'text-neutral-500 dark:text-neutral-400 border-transparent hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Login Page</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-600/80 text-xs text-emerald-900 dark:text-emerald-300 flex items-start gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-100 dark:bg-rose-950/70 border border-rose-300 dark:border-rose-800 text-xs text-rose-900 dark:text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* ===================== LOGIN FORM ===================== */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <PhoneInputWithCountry
                label="Owner Mobile Phone Number"
                value={loginPhone}
                onChange={(val) => {
                  setLoginPhone(val);
                  setSuccessMessage(null);
                }}
                required
              />

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      setSuccessMessage(null);
                    }}
                    placeholder="Enter your password"
                    required
                    className="w-full bg-neutral-50 dark:bg-[#0a0f0d] border border-neutral-300 dark:border-[#273a30] rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {/* Firebase Google Sign-In Option */}
              <button
                type="button"
                onClick={async () => {
                  try {
                    setError(null);
                    const fbUser = await signInWithGoogle();
                    if (fbUser) {
                      onLoginSuccess({
                        id: fbUser.uid,
                        name: fbUser.displayName || 'Dairy Farmer',
                        phone: fbUser.email || '+91 9876543210',
                        organization: 'Firebase Authenticated Farm',
                        role: 'farmer',
                      });
                    }
                  } catch (err: any) {
                    setError(err.message || 'Google Sign-In failed.');
                  }
                }}
                className="w-full py-2.5 px-4 bg-neutral-100 dark:bg-[#18261e] hover:bg-neutral-200 dark:hover:bg-[#22362a] border border-neutral-300 dark:border-[#2e4738] text-neutral-900 dark:text-white rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm mb-3"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12s.7 2.3 1.9 4.7l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
                  />
                </svg>
                <span>Continue with Google (Firebase Auth)</span>
              </button>

              <div className="flex items-center my-3 text-[11px] text-neutral-500 uppercase tracking-wider">
                <div className="flex-1 border-t border-neutral-200 dark:border-[#1f2d26]"></div>
                <span className="px-2">or phone credentials</span>
                <div className="flex-1 border-t border-neutral-200 dark:border-[#1f2d26]"></div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2 mt-2"
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
                  className="text-xs text-neutral-600 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  Need to register first? <span className="text-emerald-600 dark:text-emerald-400 font-semibold underline underline-offset-2">Register here</span>
                </button>
              </div>
            </form>
          ) : (
            /* ===================== REGISTER FORM ===================== */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              {/* Field 1: Name */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                  1. Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-500 absolute left-3.5 top-2.5" />
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Full Name"
                    required
                    className="w-full bg-neutral-50 dark:bg-[#0a0f0d] border border-neutral-300 dark:border-[#273a30] rounded-xl pl-10 pr-3.5 py-2 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {/* Field 2: Organisation */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                  2. Organization
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-500 absolute left-3.5 top-2.5" />
                  <input
                    type="text"
                    value={regOrganization}
                    onChange={(e) => setRegOrganization(e.target.value)}
                    placeholder="Dairy Farm / Organization Name"
                    required
                    className="w-full bg-neutral-50 dark:bg-[#0a0f0d] border border-neutral-300 dark:border-[#273a30] rounded-xl pl-10 pr-3.5 py-2 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {/* Field 3: Password */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                  3. Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-500 absolute left-3.5 top-2.5" />
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Create a password"
                    required
                    className="w-full bg-neutral-50 dark:bg-[#0a0f0d] border border-neutral-300 dark:border-[#273a30] rounded-xl pl-10 pr-3.5 py-2 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {/* Field 4: Phone Number with Country Code */}
              <PhoneInputWithCountry
                label="4. Mobile Phone Number (All Countries)"
                value={regPhone}
                onChange={(val) => setRegPhone(val)}
                required
              />

              {/* SMS Dispatch Info Box */}
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-[11px] text-emerald-900 dark:text-emerald-300 flex items-start gap-2 leading-relaxed">
                <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  When a cow is affected, our tool will send an SMS alert to this mobile number.
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2 mt-2"
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
                  className="text-xs text-neutral-600 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  Already have an account? <span className="text-emerald-600 dark:text-emerald-400 font-semibold underline underline-offset-2">Sign In</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3.5 bg-neutral-50 dark:bg-[#090e0c] border-t border-neutral-200 dark:border-[#1f2d26] text-center text-[11px] text-neutral-500">
          Non-diagnostic early-warning livestock health aid
        </div>
      </div>
    </div>
  );
};
