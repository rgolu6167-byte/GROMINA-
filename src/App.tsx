/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { FeatureView, ChatMessage, BusinessConfig, ChatAttachment } from './types';
import Sidebar from './components/Sidebar';
import HomeView from './views/HomeView';
import TeacherView from './views/TeacherView';
import BusinessView from './views/BusinessView';
import WebsiteView from './views/WebsiteView';
import CodexView from './views/CodexView';
import CameraModal from './components/CameraModal';
import VoiceOverlay from './components/VoiceOverlay';
import AuthModal from './components/AuthModal';
import SubscriptionModal from './components/SubscriptionModal';

export default function App() {
  /**
   * Fix 3: Main interface Gromina always first:
   * On app initial load activeView must be home Gromina main interface, not teacher or any feature.
   * Set useEffect on mount setActiveView home. Refresh also lands on home. Features open only on tap.
   * New Chat button always goes to home with empty chat. No feature opens by default.
   */
  const [currentView, setCurrentView] = useState<FeatureView>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setCurrentView('home');
  }, []);

  // Messages per view
  const [homeMessages, setHomeMessages] = useState<ChatMessage[]>([]);
  const [teacherMessages, setTeacherMessages] = useState<ChatMessage[]>([]);
  const [businessMessages, setBusinessMessages] = useState<ChatMessage[]>([]);
  const [codexMessages, setCodexMessages] = useState<ChatMessage[]>([]);

  // AI Fiesta Compare Mode state (available in Gromina main and My Teacher only)
  const [compareMode, setCompareMode] = useState(false);
  const [comparePrompt, setComparePrompt] = useState<string | null>(null);
  const [compareResponses, setCompareResponses] = useState<Record<string, string> | null>(null);

  /**
   * Fix 1: Real Sign Up Gmail required:
   * Auth flow must require Gmail connect before login allowed.
   * State gmailConnected boolean false initially isLoggedIn false authMode none signup login.
   */
  const [authMode, setAuthMode] = useState<'none' | 'signup' | 'login'>('none');
  const [gmailConnected, setGmailConnected] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('rgolu6167@gmail.com');
  const [userPlan, setUserPlan] = useState<'free' | 'plus' | 'pro'>('free');
  const [showSubscription, setShowSubscription] = useState(false);

  // Business state
  const [businessConfig, setBusinessConfig] = useState<BusinessConfig>({
    name: '',
    category: '',
    description: ''
  });
  const [isBusinessCreated, setIsBusinessCreated] = useState(false);

  // Media Modals
  const [isCamModalOpen, setIsCamModalOpen] = useState(false);
  const [isVoiceOverlayOpen, setIsVoiceOverlayOpen] = useState(false);

  // Chat History list - initially empty for new user
  const [chatHistory, setChatHistory] = useState<
    { id: string; title: string; view: FeatureView; date: string }[]
  >([]);

  const pushChatToHistory = (title: string, view: FeatureView) => {
    const trimmedTitle = title.trim().slice(0, 30) || 'New Conversation';
    setChatHistory(prev => {
      // If previous entry was 'New Chat', update its title
      if (prev.length > 0 && prev[0].title === 'New Chat') {
        return [{ ...prev[0], title: trimmedTitle, view }, ...prev.slice(1)];
      }
      return [
        {
          id: 'hist_' + Date.now(),
          title: trimmedTitle,
          view,
          date: 'Today'
        },
        ...prev
      ];
    });
  };

  /**
   * 1. New Chat behavior:
   * Must setActiveView to home, setMessages to empty array, clear compare states,
   * close mobile drawer, and push new chat to history dynamically.
   */
  const handleNewChat = () => {
    setCurrentView('home');
    setHomeMessages([]);
    setCompareMode(false);
    setComparePrompt(null);
    setCompareResponses(null);
    setIsMobileMenuOpen(false);

    // Push real new chat to history dynamically
    const newId = 'hist_' + Date.now();
    setChatHistory(prev => [
      { id: newId, title: 'New Chat', view: 'home', date: 'Today' },
      ...prev
    ]);
  };

  const handleSelectHistoryItem = (item: {
    id: string;
    title: string;
    view: FeatureView;
    date: string;
  }) => {
    setCurrentView(item.view);
  };

  const handleDeleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setChatHistory(prev => prev.filter(item => item.id !== id));
  };

  // Compare updates handler
  const handleUpdateCompareResponses = (prompt: string, responses: Record<string, string>) => {
    setComparePrompt(prompt);
    setCompareResponses(responses);
  };

  // When camera snaps a photo, attach to active conversation
  const handleCameraCapture = (attachment: ChatAttachment) => {
    const userMsg: ChatMessage = {
      id: 'att_' + Date.now(),
      sender: 'user',
      text: 'Attached photo from camera',
      attachments: [attachment],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    if (currentView === 'home') {
      setHomeMessages(prev => [...prev, userMsg]);
    } else if (currentView === 'teacher') {
      setTeacherMessages(prev => [...prev, userMsg]);
    } else if (currentView === 'business') {
      setBusinessMessages(prev => [...prev, userMsg]);
    } else if (currentView === 'codex') {
      setCodexMessages(prev => [...prev, userMsg]);
    }
  };

  // Voice overlay transcribed text handler
  const handleVoiceTranscribed = (text: string) => {
    const userMsg: ChatMessage = {
      id: 'v_usr_' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    if (currentView === 'home') {
      setHomeMessages(prev => [...prev, userMsg]);
    } else if (currentView === 'teacher') {
      setTeacherMessages(prev => [...prev, userMsg]);
    } else if (currentView === 'business') {
      setBusinessMessages(prev => [...prev, userMsg]);
    } else if (currentView === 'codex') {
      setCodexMessages(prev => [...prev, userMsg]);
    }
  };

  const handleAuthSuccess = (email: string) => {
    setIsLoggedIn(true);
    setGmailConnected(true);
    setUserEmail(email);
    setAuthMode('none');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setGmailConnected(false);
  };

  const handlePlanUpgraded = (plan: 'plus' | 'pro') => {
    setUserPlan(plan);
    setIsLoggedIn(true);
    setGmailConnected(true);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[100dvh] h-auto w-full overflow-x-auto overflow-y-auto [touch-action:auto] bg-[#212121] text-zinc-100 font-sans select-text">
      {/* Sidebar 280px desktop, drawer on mobile */}
      <Sidebar
        currentView={currentView}
        onSelectView={view => {
          setCurrentView(view);
          setCompareMode(false);
        }}
        onNewChat={handleNewChat}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        chatHistory={chatHistory}
        onSelectHistoryItem={handleSelectHistoryItem}
        onDeleteHistoryItem={handleDeleteHistoryItem}
        isLoggedIn={isLoggedIn}
        userEmail={userEmail}
        userPlan={userPlan}
        onOpenAuth={mode => setAuthMode(mode)}
        onLogout={handleLogout}
        onOpenSubscription={() => setShowSubscription(true)}
      />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-[#212121] overflow-x-auto overflow-y-auto [touch-action:pan-x_pan-y_pinch-zoom] [-webkit-overflow-scrolling:touch]">
        {/* Mobile Header Bar */}
        <div className="md:hidden h-12 bg-[#171717] border-b border-white/10 flex items-center justify-between px-4 flex-shrink-0 z-30">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-300 cursor-pointer"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-bold text-sm tracking-tight text-white">Gromina</span>
          <div className="w-5" />
        </div>

        {/* View switching: Gromina home is default */}
        {currentView === 'home' && (
          <HomeView
            messages={homeMessages}
            onSendMessage={msg => {
              setHomeMessages(prev => {
                if (prev.length === 0 && msg.sender === 'user') {
                  pushChatToHistory(msg.text, 'home');
                }
                return [...prev, msg];
              });
            }}
            onUpdateMessage={(id, text) => {
              setHomeMessages(prev => prev.map(m => (m.id === id ? { ...m, text } : m)));
            }}
            onOpenVoiceOverlay={() => setIsVoiceOverlayOpen(true)}
            onOpenCamModal={() => setIsCamModalOpen(true)}
            compareMode={compareMode}
            onToggleCompare={() => setCompareMode(prev => !prev)}
            comparePrompt={comparePrompt}
            compareResponses={compareResponses}
            onUpdateCompareResponses={handleUpdateCompareResponses}
          />
        )}

        {currentView === 'teacher' && (
          <TeacherView
            messages={teacherMessages}
            onSendMessage={msg => {
              setTeacherMessages(prev => {
                if (prev.length === 0 && msg.sender === 'user') {
                  pushChatToHistory(msg.text, 'teacher');
                }
                return [...prev, msg];
              });
            }}
            onUpdateMessage={(id, text) => {
              setTeacherMessages(prev => prev.map(m => (m.id === id ? { ...m, text } : m)));
            }}
            onOpenVoiceOverlay={() => setIsVoiceOverlayOpen(true)}
            onOpenCamModal={() => setIsCamModalOpen(true)}
            compareMode={compareMode}
            onToggleCompare={() => setCompareMode(prev => !prev)}
            comparePrompt={comparePrompt}
            compareResponses={compareResponses}
            onUpdateCompareResponses={handleUpdateCompareResponses}
          />
        )}

        {currentView === 'business' && (
          <BusinessView
            businessConfig={businessConfig}
            onUpdateConfig={setBusinessConfig}
            isCreated={isBusinessCreated}
            setIsCreated={setIsBusinessCreated}
            messages={businessMessages}
            onSendMessage={msg => {
              setBusinessMessages(prev => {
                if (prev.length === 0 && msg.sender === 'user') {
                  pushChatToHistory(msg.text, 'business');
                }
                return [...prev, msg];
              });
            }}
            onUpdateMessage={(id, text) => {
              setBusinessMessages(prev => prev.map(m => (m.id === id ? { ...m, text } : m)));
            }}
            onOpenVoiceOverlay={() => setIsVoiceOverlayOpen(true)}
            onOpenCamModal={() => setIsCamModalOpen(true)}
          />
        )}

        {currentView === 'website' && <WebsiteView />}

        {currentView === 'codex' && (
          <CodexView
            messages={codexMessages}
            onSendMessage={msg => {
              setCodexMessages(prev => {
                if (prev.length === 0 && msg.sender === 'user') {
                  pushChatToHistory(msg.text, 'codex');
                }
                return [...prev, msg];
              });
            }}
            onUpdateMessage={(id, text) => {
              setCodexMessages(prev => prev.map(m => (m.id === id ? { ...m, text } : m)));
            }}
            onOpenVoiceOverlay={() => setIsVoiceOverlayOpen(true)}
            onOpenCamModal={() => setIsCamModalOpen(true)}
          />
        )}
      </div>

      {/* Auth Modal (Sign up / Log in with required Gmail connect) */}
      <AuthModal
        isOpen={authMode !== 'none'}
        initialMode={authMode === 'none' ? 'login' : authMode}
        gmailConnected={gmailConnected}
        onConnectGmail={() => setGmailConnected(true)}
        onClose={() => setAuthMode('none')}
        onSuccess={handleAuthSuccess}
      />

      {/* Subscription Full-screen Page & Payment Modal */}
      <SubscriptionModal
        isOpen={showSubscription}
        onClose={() => setShowSubscription(false)}
        currentPlan={userPlan}
        onPlanUpgraded={handlePlanUpgraded}
      />

      {/* Camera Capture Modal */}
      <CameraModal
        isOpen={isCamModalOpen}
        onClose={() => setIsCamModalOpen(false)}
        onCapture={handleCameraCapture}
      />

      {/* Voice Assistant Overlay */}
      <VoiceOverlay
        isOpen={isVoiceOverlayOpen}
        onClose={() => setIsVoiceOverlayOpen(false)}
        onSpeechTranscribed={handleVoiceTranscribed}
      />
    </div>
  );
}
