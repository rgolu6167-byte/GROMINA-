import React, { useState } from 'react';
import { X, Check, Star, ShieldCheck, CreditCard, Sparkles } from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan?: 'free' | 'plus' | 'pro';
  onPlanUpgraded: (plan: 'plus' | 'pro') => void;
}

export default function SubscriptionModal({
  isOpen,
  onClose,
  currentPlan = 'free',
  onPlanUpgraded
}: SubscriptionModalProps) {
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<'plus' | 'pro' | null>(null);

  // Payment form state
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [name, setName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleOpenPayment = (plan: 'plus' | 'pro') => {
    setSelectedPlanForPayment(plan);
  };

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanForPayment) return;

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const plan = selectedPlanForPayment;
      setSelectedPlanForPayment(null);
      onPlanUpgraded(plan);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0a] overflow-y-auto flex flex-col text-white">
      {/* Top Header */}
      <div className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md text-sm">
            G
          </div>
          <span className="font-bold text-base tracking-tight text-white">Gromina</span>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-zinc-300 hover:text-white transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">
            Upgrade your plan
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base">
            Choose the plan that fits your needs
          </p>
        </div>

        {/* 3 Pricing Cards */}
        <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 p-2">
          {/* Free Plan */}
          <div className="bg-[#171717] border border-white/10 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Free</h3>
              </div>
              <div className="mb-6">
                <span className="text-3xl font-bold text-white">$0</span>
                <span className="text-zinc-400 text-sm ml-1">/ month</span>
              </div>
              <ul className="space-y-3 text-xs text-zinc-300 mb-8">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Access to Gromina Chat</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>My Teacher</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Limited business employees</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Limited website builds</span>
                </li>
              </ul>
            </div>

            <button
              disabled
              className="w-full py-3 rounded-full bg-white/10 text-zinc-400 font-semibold text-xs cursor-not-allowed border border-white/5"
            >
              Current plan
            </button>
          </div>

          {/* Plus Plan (Highlighted) */}
          <div className="relative bg-[#1f1f1f] border-2 border-white rounded-2xl p-6 flex flex-col justify-between shadow-2xl scale-[1.02]">
            {/* Popular Badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-black text-[11px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-md flex items-center gap-1">
              <Star className="w-3 h-3 fill-black" />
              <span>Popular</span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Plus</h3>
              </div>
              <div className="mb-6">
                <span className="text-3xl font-bold text-white">$20</span>
                <span className="text-zinc-400 text-sm ml-1">/ month</span>
              </div>
              <ul className="space-y-3 text-xs text-zinc-200 mb-8">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-sky-400 flex-shrink-0" />
                  <span className="font-semibold text-white">Everything in Free</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-sky-400 flex-shrink-0" />
                  <span>Unlimited My Teacher voice</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-sky-400 flex-shrink-0" />
                  <span>Unlimited AI employees</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-sky-400 flex-shrink-0" />
                  <span>Unlimited website builds</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-sky-400 flex-shrink-0" />
                  <span>Access to Gromina Codex</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-sky-400 flex-shrink-0" />
                  <span>Priority support</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleOpenPayment('plus')}
              className="w-full py-3 rounded-full bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition cursor-pointer shadow-lg active:scale-95"
            >
              Upgrade to Plus
            </button>
          </div>

          {/* Pro Plan */}
          <div className="bg-[#171717] border border-white/10 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Pro</h3>
              </div>
              <div className="mb-6">
                <span className="text-3xl font-bold text-white">$200</span>
                <span className="text-zinc-400 text-sm ml-1">/ month</span>
              </div>
              <ul className="space-y-3 text-xs text-zinc-300 mb-8">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <span className="font-semibold text-white">Everything in Plus</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <span>Advanced Codex with terminal</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <span>Team collaboration</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <span>API access</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleOpenPayment('pro')}
              className="w-full py-3 rounded-full bg-white/15 hover:bg-white/25 text-white font-semibold text-xs border border-white/10 transition cursor-pointer"
            >
              Upgrade to Pro
            </button>
          </div>
        </div>
      </div>

      {/* Payment Modal Overlay */}
      {selectedPlanForPayment && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#2f2f2f] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <button
              onClick={() => setSelectedPlanForPayment(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <CreditCard className="w-5 h-5 text-sky-400" />
              <h3 className="text-lg font-bold text-white">Complete payment</h3>
            </div>
            <p className="text-xs text-zinc-400 mb-5">
              Subscribe to Gromina {selectedPlanForPayment === 'plus' ? 'Plus ($20/month)' : 'Pro ($200/month)'}
            </p>

            <form onSubmit={handleProcessPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Card number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={e => setCardNumber(e.target.value)}
                  placeholder="4242 •••• •••• 4242"
                  required
                  className="w-full bg-[#1f1f1f] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-zinc-500 text-xs outline-none focus:border-white/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Expiry</label>
                  <input
                    type="text"
                    value={expiry}
                    onChange={e => setExpiry(e.target.value)}
                    placeholder="MM / YY"
                    required
                    className="w-full bg-[#1f1f1f] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-zinc-500 text-xs outline-none focus:border-white/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">CVC</label>
                  <input
                    type="text"
                    value={cvc}
                    onChange={e => setCvc(e.target.value)}
                    placeholder="123"
                    required
                    className="w-full bg-[#1f1f1f] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-zinc-500 text-xs outline-none focus:border-white/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Name on card</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Jane Doe"
                  required
                  className="w-full bg-[#1f1f1f] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-zinc-500 text-xs outline-none focus:border-white/30"
                />
              </div>

              <div className="flex items-center gap-2 pt-1 text-[11px] text-zinc-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Encrypted 256-bit secure checkout</span>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3 rounded-full bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition cursor-pointer shadow-lg mt-2 flex items-center justify-center gap-2"
              >
                {isProcessing
                  ? 'Processing...'
                  : `Pay $${selectedPlanForPayment === 'plus' ? '20' : '200'}`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
