import React from 'react';
import { ShieldAlert, Bell, Plus, User as UserIcon, LogOut } from 'lucide-react';
import { User } from '../types';

interface NavigationProps {
  currentTab: 'dashboard' | 'check-today' | 'video-analyzer' | 'milk-tracker' | 'cows' | 'login';
  setCurrentTab: (tab: 'dashboard' | 'check-today' | 'video-analyzer' | 'milk-tracker' | 'cows' | 'login') => void;
  currentUser: User | null;
  unreadCount: number;
  onOpenNotifications: () => void;
  onOpenRegisterCow: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  unreadCount,
  onOpenNotifications,
  onOpenRegisterCow,
  onOpenAuth,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0f1412]/95 backdrop-blur-md border-b border-[#23332b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-emerald-900/60 border border-emerald-700/50 flex items-center justify-center text-emerald-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <button
            onClick={() => setCurrentTab('dashboard')}
            className="text-left cursor-pointer group"
          >
            <span className="text-lg font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors whitespace-nowrap">
              HerdSentinel
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs font-normal text-emerald-500/80 tracking-normal">
              ONSPOT Early Warning
            </span>
          </button>
        </div>

        {/* Zone 2: 4-5 single-line clean navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`whitespace-nowrap transition-colors pb-0.5 border-b-2 cursor-pointer ${
              currentTab === 'dashboard'
                ? 'text-emerald-400 border-emerald-500 font-semibold'
                : 'text-neutral-400 border-transparent hover:text-neutral-200'
            }`}
          >
            Dashboard
          </button>

          <button
            onClick={() => setCurrentTab('check-today')}
            className={`whitespace-nowrap transition-colors pb-0.5 border-b-2 cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'check-today'
                ? 'text-amber-400 border-amber-500 font-semibold'
                : 'text-neutral-400 border-transparent hover:text-neutral-200'
            }`}
          >
            Check Today
            <span className="text-[10px] font-mono-numbers px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              3
            </span>
          </button>

          <button
            onClick={() => setCurrentTab('video-analyzer')}
            className={`whitespace-nowrap transition-colors pb-0.5 border-b-2 cursor-pointer ${
              currentTab === 'video-analyzer'
                ? 'text-emerald-400 border-emerald-500 font-semibold'
                : 'text-neutral-400 border-transparent hover:text-neutral-200'
            }`}
          >
            Track Video
          </button>

          <button
            onClick={() => setCurrentTab('milk-tracker')}
            className={`whitespace-nowrap transition-colors pb-0.5 border-b-2 cursor-pointer ${
              currentTab === 'milk-tracker'
                ? 'text-emerald-400 border-emerald-500 font-semibold'
                : 'text-neutral-400 border-transparent hover:text-neutral-200'
            }`}
          >
            Milk Tracker
          </button>

          <button
            onClick={() => setCurrentTab('cows')}
            className={`whitespace-nowrap transition-colors pb-0.5 border-b-2 cursor-pointer ${
              currentTab === 'cows'
                ? 'text-emerald-400 border-emerald-500 font-semibold'
                : 'text-neutral-400 border-transparent hover:text-neutral-200'
            }`}
          >
            Cow Herd
          </button>

          <button
            onClick={() => setCurrentTab('login')}
            className={`whitespace-nowrap transition-colors pb-0.5 border-b-2 cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'login'
                ? 'text-emerald-400 border-emerald-500 font-semibold'
                : 'text-neutral-300 hover:text-white font-medium'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span>Login / Register</span>
          </button>
        </nav>

        {/* Zone 3: 1 primary action & user controls */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Quick Register Cow button */}
          <button
            onClick={onOpenRegisterCow}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/60 border border-emerald-700/60 rounded-lg hover:bg-emerald-900/60 transition-colors whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Register Cow
          </button>

          {/* Notification Bell with unread counter */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-[#1a2620] transition-colors cursor-pointer"
            title="SMS & Alert Notifications"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-500 text-black text-[10px] font-bold flex items-center justify-center font-mono-numbers">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User profile / Auth button */}
          {currentUser ? (
            <div className="flex items-center gap-2 pl-2 border-l border-[#23332b]">
              <button
                onClick={() => setCurrentTab('login')}
                className="text-right hidden sm:block cursor-pointer hover:opacity-80 transition-opacity"
                title="Click to view/switch Login & Register page"
              >
                <div className="text-xs font-bold text-neutral-200 leading-tight truncate max-w-[140px]">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-emerald-400 font-mono-numbers flex items-center justify-end gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>{currentUser.phone}</span>
                </div>
              </button>
              <button
                onClick={onLogout}
                title={`Logged in as ${currentUser.name} (${currentUser.phone}). Click to log out.`}
                className="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setCurrentTab('login')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg transition-colors cursor-pointer shadow-md shadow-emerald-950/40"
            >
              <UserIcon className="w-3.5 h-3.5" /> Login / Register
            </button>
          )}
        </div>
      </div>

      {/* Mobile nav links */}
      <div className="md:hidden flex items-center justify-around px-2 py-2 border-t border-[#23332b] bg-[#121a16] text-xs">
        <button
          onClick={() => setCurrentTab('dashboard')}
          className={`py-1 px-2 rounded cursor-pointer ${
            currentTab === 'dashboard' ? 'text-emerald-400 font-semibold' : 'text-neutral-400'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setCurrentTab('check-today')}
          className={`py-1 px-2 rounded cursor-pointer ${
            currentTab === 'check-today' ? 'text-amber-400 font-semibold' : 'text-neutral-400'
          }`}
        >
          Check Today (3)
        </button>
        <button
          onClick={() => setCurrentTab('video-analyzer')}
          className={`py-1 px-2 rounded cursor-pointer ${
            currentTab === 'video-analyzer' ? 'text-emerald-400 font-semibold' : 'text-neutral-400'
          }`}
        >
          Video
        </button>
        <button
          onClick={() => setCurrentTab('milk-tracker')}
          className={`py-1 px-2 rounded cursor-pointer ${
            currentTab === 'milk-tracker' ? 'text-emerald-400 font-semibold' : 'text-neutral-400'
          }`}
        >
          Milk
        </button>
        <button
          onClick={() => setCurrentTab('cows')}
          className={`py-1 px-2 rounded cursor-pointer ${
            currentTab === 'cows' ? 'text-emerald-400 font-semibold' : 'text-neutral-400'
          }`}
        >
          Herd
        </button>
        <button
          onClick={() => setCurrentTab('login')}
          className={`py-1 px-2 rounded cursor-pointer ${
            currentTab === 'login' ? 'text-emerald-400 font-semibold' : 'text-neutral-300'
          }`}
        >
          Login
        </button>
      </div>
    </header>
  );
};
