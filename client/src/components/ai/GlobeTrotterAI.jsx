import React, { useState, useEffect, useRef } from 'react';
import { Bot, Sparkles, Send, X, Check, AlertCircle, RefreshCw, ChevronRight, ShieldCheck, Compass } from 'lucide-react';
import api from '../../services/api';
import './GlobeTrotterAI.css';

export default function GlobeTrotterAI({ isOpen, onClose, context = {} }) {
  const [messages, setMessages] = useState([
    {
      id: 'init-1',
      sender: 'agent',
      text: 'Hello! I am **GlobeTrotter AI**, your intelligent travel planning assistant. Ask me to discover destinations, search activities, analyze your budget, or optimize your itinerary!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [toolsRunning, setToolsRunning] = useState([]);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, toolsRunning]);

  if (!isOpen) return null;

  const quickPrompts = getContextualPrompts(context);

  const handleSendMessage = async (textToSend) => {
    const prompt = textToSend || inputText;
    if (!prompt || !prompt.trim() || loading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);
    setToolsRunning([]);
    setActionSuccessMsg('');

    try {
      const payload = {
        message: prompt,
        tripId: context.tripId,
        cityId: context.cityId,
        context: {
          page: context.page || 'dashboard',
          tripId: context.tripId,
          cityId: context.cityId,
        },
      };

      const res = await api.post('/agent/chat', payload);

      if (res.data && res.data.success) {
        const { message: agentMsgText, actions, metadata, requiresConfirmation } = res.data.data;

        if (metadata?.toolsUsed) {
          setToolsRunning(metadata.toolsUsed);
        }

        const agentMsg = {
          id: `agent-${Date.now()}`,
          sender: 'agent',
          text: agentMsgText,
          actions: actions || [],
          requiresConfirmation: requiresConfirmation || false,
          toolsUsed: metadata?.toolsUsed || [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, agentMsg]);
      } else {
        throw new Error(res.data?.message || 'Agent returned an error.');
      }
    } catch (err) {
      console.error('Agent chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'agent',
          text: '⚠️ **GlobeTrotter AI is operating in offline mode.** I can still search cities, activities, and calculate trip budgets directly from our database!',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
    setLoading(false);
  };

  const handleConfirmAction = async (actionId, approved) => {
    setActionSuccessMsg('');
    try {
      const res = await api.post('/agent/actions/confirm', { actionId, approved });
      if (res.data && res.data.success) {
        setActionSuccessMsg(res.data.message || 'Action executed successfully!');
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.actions) {
              return {
                ...msg,
                actions: msg.actions.map((act) =>
                  act.actionId === actionId ? { ...act, status: approved ? 'APPROVED' : 'CANCELLED' } : act
                ),
              };
            }
            return msg;
          })
        );

        if (context.onRefreshData) {
          context.onRefreshData();
        }
      } else {
        alert(res.data?.message || 'Failed to execute action.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error confirming action.');
    }
  };

  return (
    <div className="gt-ai-drawer-container">
      {/* AI Header */}
      <div className="gt-ai-header">
        <div className="flex items-center space-x-3">
          <div className="gt-ai-avatar-icon">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="gt-ai-title-text">GlobeTrotter AI</h3>
              <span className="gt-ai-badge-model">
                Agentic Groq
              </span>
            </div>
            <p className="gt-ai-subtitle-text">
              Context: <span className="capitalize">{context.page || 'Dashboard'}</span>
              {context.tripName ? ` • ${context.tripName}` : ''}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="gt-ai-close-btn"
          title="Close AI Assistant"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {actionSuccessMsg && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-200 dark:border-emerald-800 px-4 py-2 text-xs text-emerald-800 dark:text-emerald-300 font-bold flex items-center space-x-2">
          <Check className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Messages Scroll Body */}
      <div className="gt-ai-messages-body">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className={`gt-ai-msg-bubble ${msg.sender === 'user' ? 'user' : 'agent'}`}>
              <div
                className="prose prose-invert text-xs space-y-2"
                dangerouslySetInnerHTML={{
                  __html: formatMarkdown(msg.text),
                }}
              />

              {/* Display Tool Badges */}
              {msg.toolsUsed && msg.toolsUsed.length > 0 && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-1.5">
                  {msg.toolsUsed.map((tool) => (
                    <span
                      key={tool}
                      className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 dark:bg-slate-900 text-blue-700 dark:text-cyan-400 border border-blue-200 dark:border-slate-800 flex items-center gap-1"
                    >
                      <ShieldCheck className="w-3 h-3 text-blue-600 dark:text-cyan-400" />
                      <span>{tool}</span>
                    </span>
                  ))}
                </div>
              )}

              {/* Display Action Proposals */}
              {msg.actions && msg.actions.length > 0 && (
                <div className="pt-2 space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Action Proposal (Requires Confirmation)</span>
                  </div>

                  {msg.actions.map((act) => (
                    <div
                      key={act.actionId}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-amber-300 dark:border-amber-500/30 space-y-2"
                    >
                      <p className="font-bold text-slate-900 dark:text-slate-100 text-xs">{act.summary}</p>

                      {act.status === 'APPROVED' ? (
                        <span className="inline-flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                          <Check className="w-3.5 h-3.5" />
                          <span>Approved & Executed</span>
                        </span>
                      ) : act.status === 'CANCELLED' ? (
                        <span className="text-slate-500 text-xs font-semibold">Cancelled</span>
                      ) : (
                        <div className="flex items-center space-x-2 pt-1">
                          <button
                            onClick={() => handleConfirmAction(act.actionId, true)}
                            className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center justify-center space-x-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Apply Changes</span>
                          </button>
                          <button
                            onClick={() => handleConfirmAction(act.actionId, false)}
                            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-rose-600 text-xs font-semibold"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <span className="gt-ai-msg-timestamp">{msg.timestamp}</span>
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-2 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs w-fit animate-pulse">
            <RefreshCw className="w-4 h-4 text-blue-600 dark:text-cyan-400 animate-spin" />
            <span>Analyzing application data & reasoning tools...</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Contextual Quick Prompts */}
      {quickPrompts.length > 0 && (
        <div className="gt-ai-prompts-bar">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 shrink-0">Quick:</span>
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(qp)}
              disabled={loading}
              className="gt-ai-prompt-pill"
            >
              {qp}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="gt-ai-input-bar"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask GlobeTrotter AI to plan, optimize or search..."
          className="gt-ai-input-field"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || loading}
          className="gt-ai-send-btn"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

// Helpers
function getContextualPrompts(context) {
  const p = context?.page;
  if (p === 'itinerary') {
    return ['Make Day 3 less hectic', 'Detect schedule conflicts', 'Add Kyoto for two days'];
  }
  if (p === 'budget') {
    return ['Bring my trip below ₹60,000', 'Find cheaper food activities', 'Show category breakdown'];
  }
  if (p === 'cities') {
    return ['Find affordable cities in Europe', 'Recommend cities for food & culture'];
  }
  if (p === 'activities') {
    return ['Find activities under ₹2,000', 'Top photography tours in Tokyo'];
  }
  return ['Plan a 5-day Japan trip under ₹50,000', 'Find affordable cities in Europe', 'Recommend activities for me'];
}

function formatMarkdown(txt) {
  if (!txt) return '';
  return txt
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="bg-slate-100 dark:bg-slate-900 px-1 py-0.5 rounded text-blue-600 dark:text-cyan-400 font-mono">$1</code>')
    .replace(/\n/g, '<br />');
}
