
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
   * Gromina home is the default view.
   * Refresh and initial load always open the home interface.
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

  // Compare Mode state
  const [compareMode, setCompareMode] = useState(false);
  const [comparePrompt, setComparePrompt] = useState<string | null>(null);
  const [compareResponses, setCompareResponses] = useState<Record<string, string> | null>(null);

  // Authentication state
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

  // Media modals
  const [isCamModalOpen, setIsCamModalOpen] = useState(false);
  const [isVoiceOverlayOpen, setIsVoiceOverlayOpen] = useState(false);

  // Chat history
  const [chatHistory, setChatHistory] = useState<
    { id: string; title: string; view: FeatureView; date: string }[]
  >([]);

  const pushChatToHistory = (title: string, view: FeatureView) => {
    const trimmedTitle = title.trim().slice(0, 30) || 'New Conversation';

    setChatHistory(prev => {
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

  // New Chat behavior
  const handleNewChat = () => {
    setCurrentView('home');
    setHomeMessages([]);
    setCompareMode(false);
    setComparePrompt(null);
    setCompareResponses(null);
    setIsMobileMenuOpen(false);

    const newId = 'hist_' + Date.now();

    setChatHistory(prev => [
      { id: newId, title: 'New Chat', view: 'home', date: 'Today' },
      ...prev
    ]);
  };

  // Select chat history item
  const handleSelectHistoryItem = (item: {
    id: string;
    title: string;
    view: FeatureView;
    date: string;
  }) => {
    setCurrentView(item.view);
  };

  // Delete chat history item
  const handleDeleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setChatHistory(prev => prev.filter(item => item.id !== id));
  };

  // Compare updates handler
  const handleUpdateCompareResponses = (
    prompt: string,
    responses: Record<string, string>
  ) => {
    setComparePrompt(prompt);
    setCompareResponses(responses);
  };

  // Camera capture handler
  const handleCameraCapture = (attachment: ChatAttachment) => {
    const userMsg: ChatMessage = {
      id: 'att_' + Date.now(),
      sender: 'user',
      text: 'Attached photo from camera',
      attachments: [attachment],
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
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

  // Voice transcription handler
  const handleVoiceTranscribed = (text: string) => {
    const userMsg: ChatMessage = {
      id: 'v_usr_' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
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

  // Authentication success
  const handleAuthSuccess = (email: string) => {
    setIsLoggedIn(true);
    setGmailConnected(true);
    setUserEmail(email);
    setAuthMode('none');
  };

  // Logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setGmailConnected(false);
  };

  // Subscription upgrade
  const handlePlanUpgraded = (plan: 'plus' | 'pro') => {
    setUserPlan(plan);
    setIsLoggedIn(true);
    setGmailConnected(true);
  };

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] max-h-[100dvh] w-full overflow-hidden bg-[#212121] text-zinc-100 font-sans select-text [touch-action:pan-x_pan-y_pinch-zoom]">

      {/* Sidebar */}
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

      {/* Main View Area - Scroll-enabled */}
      <main className="flex-1 flex flex-col min-w-0 min-h-0 h-[100dvh] max-h-[100dvh] overflow-hidden [touch-action:pan-x_pan-y_pinch-zoom] relative bg-[#212121]">

        {/* Mobile Header */}
        <div className="md:hidden h-12 bg-[#171717] border-b border-white/10 flex items-center justify-between px-4 flex-shrink-0 z-30">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-300 cursor-pointer"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <span className="font-bold text-sm tracking-tight text-white">
            Gromina
          </span>

          <div className="w-5" />
        </div>

        {/* Home View */}
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
              setHomeMessages(prev =>
                prev.map(m => (m.id === id ? { ...m, text } : m))
              );
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

        {/* Teacher View */}
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
              setTeacherMessages(prev =>
                prev.map(m => (m.id === id ? { ...m, text } : m))
              );
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

        {/* Business View */}
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
              setBusinessMessages(prev =>
                prev.map(m => (m.id === id ? { ...m, text } : m))
              );
            }}
            onOpenVoiceOverlay={() => setIsVoiceOverlayOpen(true)}
            onOpenCamModal={() => setIsCamModalOpen(true)}
          />
        )}

        {/* Website View */}
        {currentView === 'website' && <WebsiteView />}

        {/* Codex View */}
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
              setCodexMessages(prev =>
                prev.map(m => (m.id === id ? { ...m, text } : m))
              );
            }}
            onOpenVoiceOverlay={() => setIsVoiceOverlayOpen(true)}
            onOpenCamModal={() => setIsCamModalOpen(true)}
          />
        )}
      </main>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authMode !== 'none'}
        initialMode={authMode === 'none' ? 'login' : authMode}
        gmailConnected={gmailConnected}
        onConnectGmail={() => setGmailConnected(true)}
        onClose={() => setAuthMode('none')}
        onSuccess={handleAuthSuccess}
      />

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={showSubscription}
        onClose={() => setShowSubscription(false)}
        currentPlan={userPlan}
        onPlanUpgraded={handlePlanUpgraded}
      />

      {/* Camera Modal */}
      <CameraModal
        isOpen={isCamModalOpen}
        onClose={() => setIsCamModalOpen(false)}
        onCapture={handleCameraCapture}
      />

      {/* Voice Overlay */}
      <VoiceOverlay
        isOpen={isVoiceOverlayOpen}
        onClose={() => setIsVoiceOverlayOpen(false)}
        onSpeechTranscribed={handleVoiceTranscribed}
      />
    </div>
  );
}
