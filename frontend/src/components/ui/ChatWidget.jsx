import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import api from '../../utils/api';

// ─── Simple markdown renderer (no external lib needed) ───────────────────────
const renderMarkdown = (text) => {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="bg-gray-100 dark:bg-gray-700 px-1 rounded text-xs font-mono">$1</code>')
    .replace(/^### (.*$)/gm, '<h3 class="font-bold text-sm mt-2 mb-1">$1</h3>')
    .replace(/^## (.*$)/gm, '<h3 class="font-bold text-sm mt-2 mb-1">$1</h3>')
    .replace(/^- (.*$)/gm, '<li class="ml-3 list-disc">$1</li>')
    .replace(/(<li.*<\/li>\n?)+/g, '<ul class="space-y-0.5 my-1">$&</ul>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>')
    .replace(/---/g, '<hr class="border-gray-200 dark:border-gray-600 my-2"/>');
};

// ─── Suggested quick prompts ─────────────────────────────────────────────────
const SUGGESTIONS = [
  { label: '📊 Explain my assessment', prompt: 'Can you explain my latest breast health assessment results?' },
  { label: '🩸 Next period date', prompt: 'When is my next period predicted?' },
  { label: '🔍 Self-exam guide', prompt: 'How do I perform a breast self-examination?' },
  { label: '🥗 Healthy diet tips', prompt: 'What foods are good for breast health?' },
  { label: '💪 Exercise tips', prompt: 'What exercises are recommended for breast health?' },
  { label: '💊 What do my results mean?', prompt: 'What does my risk score mean and what should I do?' },
];

// ─── Single message bubble ────────────────────────────────────────────────────
const MessageBubble = memo(({ msg, onCopy }) => {
  const isUser = msg.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content).then(() => {
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const time = msg.timestamp
    ? new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className={`flex gap-2 group ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      {!isUser && (
        <div className="w-7 h-7 rounded-full gradient-rose flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-1">
          I
        </div>
      )}

      <div className={`max-w-[85%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div
          className={`px-3 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? 'bg-rose-600 text-white rounded-tr-sm'
              : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-tl-sm shadow-sm'
          }`}
        >
          {isUser ? (
            <span>{msg.content}</span>
          ) : (
            <div
              className="prose-sm"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
            />
          )}
        </div>

        {/* Timestamp + copy */}
        <div className={`flex items-center gap-2 px-1 opacity-0 group-hover:opacity-100 transition-opacity ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="text-[10px] text-gray-400">{time}</span>
          {!isUser && (
            <button
              onClick={handleCopy}
              className="text-[10px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              title="Copy message"
            >
              {copied ? '✓ Copied' : '⧉ Copy'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

// ─── Typing animation ─────────────────────────────────────────────────────────
const TypingIndicator = () => (
  <div className="flex gap-2 items-center">
    <div className="w-7 h-7 rounded-full gradient-rose flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
      I
    </div>
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
      <div className="flex gap-1 items-center">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  </div>
);

// ─── Main ChatWidget ──────────────────────────────────────────────────────────
export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setUnread(0);
    }
  }, [open]);

  // Welcome message on first open
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: "Hi! I'm **INDU**, your personal breast health assistant 💗\n\nI have access to your health profile, assessment results, and period data — so you never need to repeat yourself.\n\nHow can I help you today?",
        timestamp: new Date().toISOString(),
      }]);
    }
  }, [open, messages.length]);

  const sendMessage = useCallback(async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg || loading) return;

    setInput('');
    setError('');
    setShowSuggestions(false);

    const userMessage = {
      role: 'user',
      content: userMsg,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      // Build history (exclude welcome message from API history)
      const history = messages
        .filter(m => m.role === 'user' || (m.role === 'assistant' && messages.indexOf(m) > 0))
        .slice(-10)
        .map(m => ({ role: m.role, content: m.content }));

      const { data } = await api.post('/chat/message', {
        message: userMsg,
        history,
      });

      const assistantMessage = {
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toISOString(),
        is_emergency: data.is_emergency,
        is_fallback: data.is_fallback,
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Increment unread if chat is closed
      if (!open) setUnread(u => u + 1);
    } catch (err) {
      setError(err.response?.data?.message || 'INDU is temporarily unavailable. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, open]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearConversation = () => {
    setMessages([]);
    setShowSuggestions(true);
    setError('');
  };

  const regenerateLast = async () => {
    const lastUser = [...messages].reverse().find(m => m.role === 'user');
    if (!lastUser) return;
    // Remove last assistant response then resend
    setMessages(prev => {
      const idx = [...prev].reverse().findIndex(m => m.role === 'assistant');
      if (idx === -1) return prev;
      const copy = [...prev];
      copy.splice(prev.length - 1 - idx, 1);
      return copy;
    });
    await sendMessage(lastUser.content);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 gradient-rose rounded-full shadow-lg hover:shadow-rose-300 dark:hover:shadow-rose-900 hover:scale-105 transition-all duration-200 flex items-center justify-center"
        aria-label="Open INDU health assistant"
      >
        {open ? (
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
        {/* Unread badge */}
        {unread > 0 && !open && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full text-white text-xs font-bold flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-24px)] h-[520px] max-h-[calc(100vh-120px)] flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 animate-slide-up overflow-hidden">

          {/* Header */}
          <div className="gradient-rose px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-sm">
                I
              </div>
              <div>
                <div className="text-white font-bold text-sm leading-tight">INDU</div>
                <div className="text-rose-200 text-xs">AI Health Assistant · Online</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={regenerateLast}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white/70 hover:text-white"
                title="Regenerate last response"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button
                onClick={clearConversation}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white/70 hover:text-white"
                title="Clear conversation"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white/70 hover:text-white"
                title="Close"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gray-50 dark:bg-gray-950">
            {messages.map((msg, i) => (
              <MessageBubble key={i} msg={msg} />
            ))}
            {loading && <TypingIndicator />}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 text-xs rounded-xl px-3 py-2">
                {error}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          {showSuggestions && messages.length <= 1 && (
            <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 flex-shrink-0">
              <div className="text-xs text-gray-400 dark:text-gray-500 mb-2 px-1">Quick questions</div>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s.label}
                    onClick={() => sendMessage(s.prompt)}
                    className="text-xs bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800 px-2.5 py-1 rounded-full hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors whitespace-nowrap"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Safety disclaimer */}
          <div className="px-4 py-1.5 bg-amber-50 dark:bg-amber-900/10 border-t border-amber-100 dark:border-amber-800/30 flex-shrink-0">
            <p className="text-[10px] text-amber-600 dark:text-amber-400 text-center leading-relaxed">
              For educational purposes only. Not a substitute for professional medical advice.
            </p>
          </div>

          {/* Input area */}
          <div className="px-3 py-3 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 flex-shrink-0">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask INDU anything about your health..."
                rows={1}
                className="flex-1 resize-none input-field py-2.5 text-sm min-h-[42px] max-h-[100px]"
                style={{ height: 'auto' }}
                onInput={e => {
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
                }}
                disabled={loading}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className="w-10 h-10 gradient-rose rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40 hover:opacity-90 transition-opacity active:scale-95"
                aria-label="Send message"
              >
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5 text-center">
              Press Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>
      )}
    </>
  );
}
