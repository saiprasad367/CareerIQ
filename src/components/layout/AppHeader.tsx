import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, LogOut, Settings, User, Sparkles, Info } from 'lucide-react';
import { api } from '@/services/api';
import { storage } from '@/lib/storage';

const notifications = [
  { id: '1', title: 'Interview Scheduled', description: 'Groww Backend round 2 on Oct 28.', time: '2h ago', read: false },
  { id: '2', title: 'New Match Found', description: 'ML Platform Engineer at Ola Electric — 76% match.', time: '1d ago', read: false },
  { id: '3', title: 'Roadmap Reminder', description: 'Docker course: you\'re 0% done. Start today?', time: '2d ago', read: true },
];

export function AppHeader() {
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();
  const unread = notifications.filter(n => !n.read).length;
  const user = storage.getUser() || { name: 'Candidate User', email: 'candidate@careeriq.dev' };
  const isConnected = !!storage.getToken();

  const handleLogout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // Continue cleanup
    }
    navigate('/login');
  };

  return (
    <header className="h-14 border-b border-[#EAEAEA] bg-white flex items-center justify-between px-4 md:px-6 flex-shrink-0 sticky top-0 z-30">
      {/* Left: Mobile logo */}
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2 md:hidden">
          <div className="w-6 h-6 rounded-md bg-[#111111] flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-bold text-[#111111]">CareerIQ</span>
        </Link>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Connection status badge */}
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium hidden sm:inline-flex items-center gap-1.5 ${isConnected ? 'bg-[#E8F6EE] text-[#1a6b3a]' : 'bg-[#FFF3D9] text-[#92400e]'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-[#1a6b3a]' : 'bg-[#92400e]'}`} />
          {isConnected ? 'Database Live' : 'Demo Mode'}
        </span>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotif(!showNotif); setShowProfile(false); }}
            className="relative btn-ghost p-2 rounded-lg"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#111111] text-white text-[10px] rounded-full flex items-center justify-center font-medium">
                {unread}
              </span>
            )}
          </button>

          {showNotif && (
            <div className="absolute right-0 top-full mt-2 w-80 card shadow-card-hover z-50 overflow-hidden">
              <div className="p-3 border-b border-[#EAEAEA]">
                <h3 className="text-sm font-semibold text-[#111111]">Notifications</h3>
              </div>
              <div className="divide-y divide-[#EAEAEA] max-h-72 overflow-y-auto scroll-area">
                {notifications.map(n => (
                  <div
                    key={n.id}
                    className={`p-3 cursor-pointer hover:bg-[#F7F8FA] transition-colors ${!n.read ? 'bg-[#EAF3FF]/30' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#111111]">{n.title}</p>
                        <p className="text-xs text-[#666666] mt-0.5 leading-snug">{n.description}</p>
                      </div>
                      {!n.read && <span className="w-1.5 h-1.5 bg-[#111111] rounded-full mt-1 flex-shrink-0" />}
                    </div>
                    <p className="text-[10px] text-[#858585] mt-1">{n.time}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile menu */}
        <div className="relative">
          <button
            onClick={() => { setShowProfile(!showProfile); setShowNotif(false); }}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-[#F7F8FA] transition-colors"
            aria-label="Profile menu"
          >
            <div className="w-7 h-7 rounded-full bg-[#EAF3FF] flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-[#1a5fb4]">
                {user.name.charAt(0)}
              </span>
            </div>
            <span className="text-sm font-medium text-[#111111] hidden sm:block max-w-28 truncate">
              {user.name}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#858585] hidden sm:block" />
          </button>

          {showProfile && (
            <div className="absolute right-0 top-full mt-2 w-52 card shadow-card-hover z-50 overflow-hidden py-1">
              <div className="px-3 py-2 border-b border-[#EAEAEA] mb-1">
                <p className="text-xs font-semibold text-[#111111] truncate">{user.name}</p>
                <p className="text-xs text-[#858585] truncate">{user.email}</p>
              </div>
              <Link
                to="/app/settings"
                onClick={() => setShowProfile(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-[#666666] hover:bg-[#F7F8FA] hover:text-[#111111] transition-colors"
              >
                <Settings className="w-3.5 h-3.5" /> Settings
              </Link>
              <Link
                to="/app/settings"
                onClick={() => setShowProfile(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-[#666666] hover:bg-[#F7F8FA] hover:text-[#111111] transition-colors"
              >
                <User className="w-3.5 h-3.5" /> Profile
              </Link>
              <div className="border-t border-[#EAEAEA] mt-1 pt-1">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#666666] hover:bg-[#F7F8FA] hover:text-[#111111] transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside handler */}
      {(showNotif || showProfile) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => { setShowNotif(false); setShowProfile(false); }}
        />
      )}
    </header>
  );
}
