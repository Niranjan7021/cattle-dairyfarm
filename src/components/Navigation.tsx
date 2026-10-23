import React from 'react';
import { ShieldAlert, Bell, Plus, User as UserIcon, LogOut, Sun, Moon } from 'lucide-react';
import { User } from '../types';
import { useTheme } from '../context/ThemeContext';

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
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#0f1412]/95 backdrop-blur-md border-b border-neutral-200 dark:border-[#23332b] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700/50 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <button
            onClick={() => setCurrentTab('dashboard')}
            className="text-left cursor-pointer group"
          >
            <span className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors whitespace-nowrap">
              HerdSentinel
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs font-normal text-emerald-600 dark:text-emerald-500/80 tracking-normal">
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
                ? 'text-emerald-600 dark:text-emerald-400 border-emerald-600 dark:border-emerald-500 font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 border-transparent hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            Dashboard
          </button>

          <button
            onClick={() => setCurrentTab('check-today')}
            className={`whitespace-nowrap transition-colors pb-0.5 border-b-2 cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'check-today'
                ? 'text-amber-600 dark:text-amber-400 border-amber-600 dark:border-amber-500 font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 border-transparent hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            Check Today
            <span className="text-[10px] font-mono-numbers px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30">
              3
            </span>
          </button>

          <button
            onClick={() => setCurrentTab('video-analyzer')}
            className={`whitespace-nowrap transition-colors pb-0.5 border-b-2 cursor-pointer ${
              currentTab === 'video-analyzer'
                ? 'text-emerald-600 dark:text-emerald-400 border-emerald-600 dark:border-emerald-500 font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 border-transparent hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            Track Video
          </button>

          <button
            onClick={() => setCurrentTab('milk-tracker')}
            className={`whitespace-nowrap transition-colors pb-0.5 border-b-2 cursor-pointer ${
              currentTab === 'milk-tracker'
                ? 'text-emerald-600 dark:text-emerald-400 border-emerald-600 dark:border-emerald-500 font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 border-transparent hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            Milk Tracker
          </button>

          <button
            onClick={() => setCurrentTab('cows')}
            className={`whitespace-nowrap transition-colors pb-0.5 border-b-2 cursor-pointer ${
              currentTab === 'cows'
                ? 'text-emerald-600 dark:text-emerald-400 border-emerald-600 dark:border-emerald-500 font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 border-transparent hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            Cow Herd
          </button>

          <button
            onClick={() => setCurrentTab('login')}
            className={`whitespace-nowrap transition-colors pb-0.5 border-b-2 cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'login'
                ? 'text-emerald-600 dark:text-emerald-400 border-emerald-600 dark:border-emerald-500 font-semibold'
                : 'text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white font-medium'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Login / Register</span>
          </button>
        </nav>

        {/* Zone 3: 1 primary action & user controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Theme Toggle Button (Light/Dark mode) */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-emerald-700 dark:hover:text-emerald-400 bg-neutral-100 dark:bg-[#1a2620] hover:bg-neutral-200 dark:hover:bg-[#23332b] transition-colors cursor-pointer flex items-center justify-center border border-neutral-200 dark:border-transparent"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle light and dark mode"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-emerald-700" />
            )}
          </button>

          {/* Quick Register Cow button */}
          <button
            onClick={onOpenRegisterCow}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700/60 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Register Cow
          </button>

          {/* Notification Bell with unread counter */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 bg-neutral-100 dark:bg-transparent hover:bg-neutral-200 dark:hover:bg-[#1a2620] transition-colors cursor-pointer border border-neutral-200 dark:border-transparent"
            title="SMS & Alert Notifications"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-amber-500 text-black text-[10px] font-bold flex items-center justify-center font-mono-numbers">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User profile / Auth button */}
          {currentUser ? (
            <div className="flex items-center gap-2 pl-2 border-l border-neutral-200 dark:border-[#23332b]">
              <button
                onClick={() => setCurrentTab('login')}
                className="text-right hidden sm:block cursor-pointer hover:opacity-80 transition-opacity"
                title="Click to view/switch Login & Register page"
              >
                <div className="text-xs font-bold text-neutral-800 dark:text-neutral-200 leading-tight truncate max-w-[140px]">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono-numbers flex items-center justify-end gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span>
                  <span>{currentUser.phone}</span>
                </div>
              </button>
              <button
                onClick={onLogout}
                title={`Logged in as ${currentUser.name} (${currentUser.phone}). Click to log out.`}
                className="p-1.5 text-neutral-500 dark:text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setCurrentTab('login')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 rounded-lg transition-colors cursor-pointer shadow-sm"
            >
              <UserIcon className="w-3.5 h-3.5" /> Login / Register
            </button>
          )}
        </div>
      </div>

      {/* Mobile nav links */}
      <div className="md:hidden flex items-center justify-around px-2 py-2 border-t border-neutral-200 dark:border-[#23332b] bg-neutral-50 dark:bg-[#121a16] text-xs">
        <button
          onClick={() => setCurrentTab('dashboard')}
          className={`py-1 px-2 rounded cursor-pointer ${
            currentTab === 'dashboard' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-neutral-600 dark:text-neutral-400'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setCurrentTab('check-today')}
          className={`py-1 px-2 rounded cursor-pointer ${
            currentTab === 'check-today' ? 'text-amber-600 dark:text-amber-400 font-semibold' : 'text-neutral-600 dark:text-neutral-400'
          }`}
        >
          Check Today (3)
        </button>
        <button
          onClick={() => setCurrentTab('video-analyzer')}
          className={`py-1 px-2 rounded cursor-pointer ${
            currentTab === 'video-analyzer' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-neutral-600 dark:text-neutral-400'
          }`}
        >
          Video
        </button>
        <button
          onClick={() => setCurrentTab('milk-tracker')}
          className={`py-1 px-2 rounded cursor-pointer ${
            currentTab === 'milk-tracker' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-neutral-600 dark:text-neutral-400'
          }`}
        >
          Milk
        </button>
        <button
          onClick={() => setCurrentTab('cows')}
          className={`py-1 px-2 rounded cursor-pointer ${
            currentTab === 'cows' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-neutral-600 dark:text-neutral-400'
          }`}
        >
          Herd
        </button>
        <button
          onClick={() => setCurrentTab('login')}
          className={`py-1 px-2 rounded cursor-pointer ${
            currentTab === 'login' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-neutral-700 dark:text-neutral-300'
          }`}
        >
          Login
        </button>
      </div>
    </header>
  );
};
