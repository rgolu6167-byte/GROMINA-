import React from 'react';
import {
  GraduationCap,
  Briefcase,
  Globe,
  Code2,
  Plus,
  MessageSquare,
  X,
  User,
  Trash2,
  Star,
  LogOut
} from 'lucide-react';
import { FeatureView } from '../types';

interface SidebarProps {
  currentView: FeatureView;
  onSelectView: (view: FeatureView) => void;
  onNewChat: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  chatHistory: { id: string; title: string; view: FeatureView; date: string }[];
  onSelectHistoryItem: (item: { id: string; title: string; view: FeatureView; date: string }) => void;
  onDeleteHistoryItem: (id: string, e: React.MouseEvent) => void;
  isLoggedIn: boolean;
  userEmail: string;
  userPlan: 'free' | 'plus' | 'pro';
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onLogout: () => void;
  onOpenSubscription: () => void;
}

export default function Sidebar({
  currentView,
  onSelectView,
  onNewChat,
  isOpenMobile,
  onCloseMobile,
  chatHistory,
  onSelectHistoryItem,
  onDeleteHistoryItem,
  isLoggedIn,
  userEmail,
  userPlan,
  onOpenAuth,
  onLogout,
  onOpenSubscription
}: SidebarProps) {
  const features = [
    {
      id: 'teacher' as FeatureView,
      name: 'My Teacher',
      icon: GraduationCap,
    },
    {
      id: 'business' as FeatureView,
      name: 'Grow your Business with AI',
      icon: Briefcase,
    },
    {
      id: 'website' as FeatureView,
      name: 'Build your website with AI',
      icon: Globe,
    },
    {
      id: 'codex' as FeatureView,
      name: 'Gromina Codex',
      icon: Code2,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 md:z-40 w-[280px] min-h-[100dvh] md:min-h-0 md:h-full bg-[#171717] border-r border-white/10 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top: Gromina logo */}
        <div className="p-4 flex items-center justify-between">
          <button
            onClick={() => {
              onSelectView('home');
              if (isOpenMobile) onCloseMobile();
            }}
            className="flex items-center gap-3 text-left group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md text-lg group-hover:scale-105 transition-transform">
              G
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight text-white group-hover:text-zinc-200">
                Gromina
              </span>
            </div>
          </button>

          {/* Close button for mobile */}
          <button
            onClick={onCloseMobile}
            className="md:hidden w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Below: New Chat button */}
        <div className="px-4 pb-4">
          <button
            onClick={() => {
              onNewChat();
              if (isOpenMobile) onCloseMobile();
            }}
            className="w-full py-2.5 px-4 rounded-full bg-[#2f2f2f] hover:bg-white/10 text-white font-medium text-sm flex items-center justify-center gap-2 border border-white/10 transition shadow-xs active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Features Section (4 items only, in order) */}
        <div className="px-3 py-2">
          <p className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">
            FEATURES
          </p>
          <nav className="space-y-1">
            {features.map(f => {
              const Icon = f.icon;
              const isActive = currentView === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => {
                    onSelectView(f.id);
                    if (isOpenMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm font-medium transition cursor-pointer ${
                    isActive
                      ? 'bg-[#2f2f2f] text-white rounded-xl shadow-xs border border-white/10'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5 rounded-xl'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 ${
                      isActive ? 'text-sky-400' : 'text-zinc-400'
                    }`}
                  />
                  <span className="truncate">{f.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Divider */}
        <div className="my-2 border-t border-white/10" />

        {/* Chat History Section */}
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto px-3">
          <div className="flex items-center justify-between px-3 py-1.5">
            <span className="text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">
              CHAT HISTORY
            </span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-1 pr-1 py-1">
            {chatHistory.length === 0 ? (
              <div className="h-full min-h-[140px] flex flex-col items-center justify-center text-center p-4 text-zinc-500 select-none">
                <MessageSquare className="w-5 h-5 mb-2 text-zinc-500 stroke-[1.5]" />
                <span className="text-xs text-zinc-500 font-medium">No chat history yet</span>
              </div>
            ) : (
              chatHistory.map(item => (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectHistoryItem(item);
                    if (isOpenMobile) onCloseMobile();
                  }}
                  className="group flex items-center justify-between w-full px-3 py-2 text-xs text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg cursor-pointer transition"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 text-zinc-500 group-hover:text-zinc-300" />
                    <span className="truncate">{item.title}</span>
                  </div>
                  <button
                    onClick={e => onDeleteHistoryItem(item.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 text-zinc-500 hover:text-red-400 transition"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="p-3 border-t border-white/10 space-y-2">
          {/* Upgrade to Plus button with Star icon above */}
          <button
            onClick={onOpenSubscription}
            className="w-full py-2.5 px-3 rounded-full bg-[#2f2f2f] hover:bg-white/10 text-white font-medium text-xs flex items-center justify-center gap-2 border border-white/10 transition cursor-pointer shadow-xs active:scale-[0.98]"
          >
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>{userPlan === 'free' ? 'Upgrade to Plus' : `Plan: ${userPlan.toUpperCase()}`}</span>
          </button>

          {!isLoggedIn ? (
            /* Log in & Sign up buttons if not logged in */
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => onOpenAuth('login')}
                className="flex-1 py-2 px-3 border border-white/20 hover:bg-white/10 text-white text-xs font-semibold rounded-full text-center transition cursor-pointer"
              >
                Log in
              </button>
              <button
                onClick={() => onOpenAuth('signup')}
                className="flex-1 py-2 px-3 bg-white hover:bg-zinc-200 text-black text-xs font-semibold rounded-full text-center transition cursor-pointer shadow-xs"
              >
                Sign up
              </button>
            </div>
          ) : (
            /* User profile with logout if logged in */
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#1e1e1e] border border-white/5">
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white flex-shrink-0 text-xs font-bold">
                  {userEmail.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col truncate">
                  <span className="text-xs font-semibold text-white truncate max-w-[125px]">
                    {userEmail}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                    <span className="text-[10px] text-emerald-400 font-medium">Gmail Connected</span>
                  </div>
                </div>
              </div>

              <button
                onClick={onLogout}
                className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-red-400 transition cursor-pointer"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
