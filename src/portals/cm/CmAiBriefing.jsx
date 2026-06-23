import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, MessageSquare } from 'lucide-react';
import { statePulse } from '../../mock/cm';
import districtsData from '../../mock/cm/districts.json';
import ministersData from '../../mock/cm/ministers.json';
import grievancesData from '../../mock/cm/grievances.json';
import singapenneData from '../../mock/cm/singapenne.json';
import crisisData from '../../mock/cm/crisis.json';

const QUICK_PROMPTS = [
  "Brief me on Tamil Nadu's top 3 governance priorities this week.",
  "What districts need urgent intervention and why?",
  "Review effectiveness of Kalaignar Magalir Urimai Thittam.",
  "Status of Singapenne women safety initiative — what should we escalate?",
  "Which ministers are underperforming and what corrective actions?"
];

export default function CmAiBriefing() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Welcome, Hon. Chief Minister. Ask for a briefing on any governance pillar — districts, schemes, women's safety, grievances, ministers or crisis signals."
    }
  ]);
  const [inputStr, setInputStr] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (textToProcess) => {
    const userMessage = textToProcess.trim();
    if (!userMessage || isLoading) return;

    // Add user message immediately
    const updatedMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(updatedMessages);
    setInputStr('');
    setIsLoading(true);

    try {
      // System prompt injection mapping local state to context
      const systemPrompt = `You are the TN Governance Briefing Analyst for the Chief Minister's Office.
Respond decisively, confidently, and keep it brief unless asked for details. Use the following live mock data to ground your answers:
State Pulse: ${JSON.stringify(statePulse)}
Districts: ${JSON.stringify(districtsData.map(d=>({name: d.name, score: d.performanceScore, crisis: d.activeCrisisSignals})))}
Ministers: ${JSON.stringify(ministersData.map(m=>({name: m.name, grade: m.grade, portfolio: m.portfolio})))}
Grievances: ${JSON.stringify(grievancesData.kpis)}
Singapenne: ${JSON.stringify(singapenneData.kpis)}
Crisis Signals: ${JSON.stringify(crisisData.map(c=>({dist: c.district, title: c.title, sev: c.severity})))}`;

      // Format history for Anthropic API
      const apiMessages = updatedMessages.filter(m => m.role !== 'system').map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'MISSING_API_KEY_PROXY_REQUIRED', // Replace with real key/proxy
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20240620',
          max_tokens: 1024,
          system: systemPrompt,
          messages: apiMessages
        })
      });

      if (!res.ok) {
        throw new Error(`API returned ${res.status}`);
      }

      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.content[0].text }]);
      
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Error connecting to the intelligence network: ${err.message}. Please configure the API proxy endpoint or provide a valid API key to resume live synthesis.` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(inputStr);
    }
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500 h-full flex flex-col">
      
      {/* PAGE HEADER */}
      <header className="shrink-0">
        <p className="text-[10px] font-black tracking-widest uppercase text-slate-500 mb-1">
          Powered By Claude
        </p>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-[#8B1A1A]" />
          Executive AI Briefing
        </h1>
        <p className="text-sm font-medium text-slate-600 mt-2 max-w-2xl leading-relaxed">
          On-demand intelligence synthesis for the Chief Minister's Office. Streaming. Confidential. Decisive.
        </p>
      </header>

      {/* TWO COLUMNS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[600px]">
        
        {/* LEFT: Chat Panel */}
        <div className="lg:col-span-2 bg-white border border-slate-200 shadow-sm rounded-2xl flex flex-col overflow-hidden h-full">
          {/* Header Bar */}
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-rose-600 flex items-center justify-center text-white shadow-sm">
                <Bot className="w-5 h-5" />
              </div>
              <h2 className="font-bold text-slate-800">CM Briefing Assistant</h2>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Online · Secure
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
            {messages.map((m, i) => {
              const isAssistant = m.role === 'assistant';
              const isFirst = i === 0;

              return (
                <div key={i} className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-5 py-4 shadow-sm text-sm leading-relaxed ${
                    isAssistant 
                      ? isFirst 
                        ? 'bg-amber-50 border border-amber-200 text-amber-900 rounded-tl-sm' 
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'
                      : 'bg-[#8B1A1A] text-white rounded-tr-sm shadow-md'
                  }`}>
                    {m.content}
                  </div>
                </div>
              );
            })}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce delay-75" />
                    <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce delay-150" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-4 bg-white border-t border-slate-200 shrink-0">
            <div className="relative flex items-end gap-2">
              <textarea
                value={inputStr}
                onChange={(e) => setInputStr(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Ask for a briefing..."
                className="flex-1 max-h-32 min-h-[44px] bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 resize-none transition-all"
                rows={1}
              />
              <button 
                onClick={() => handleSend(inputStr)}
                disabled={!inputStr.trim() || isLoading}
                className="bg-[#8B1A1A] hover:bg-[#701515] disabled:opacity-50 disabled:hover:bg-[#8B1A1A] text-white px-5 py-3 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 h-[44px] shrink-0"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: Quick Prompts */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl flex flex-col h-[600px] lg:h-auto overflow-hidden">
          <div className="p-6 border-b border-slate-100 shrink-0">
             <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">✦ Quick Prompts</p>
          </div>
          <div className="flex-1 p-4 space-y-3 overflow-y-auto bg-slate-50/50">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <div 
                key={idx}
                onClick={() => handleSend(prompt)}
                className="bg-white border border-slate-200 p-4 rounded-xl cursor-pointer hover:border-rose-300 hover:shadow-sm transition-all group flex items-start gap-3"
              >
                <MessageSquare className="w-4 h-4 mt-0.5 text-slate-400 group-hover:text-rose-500 shrink-0 transition-colors" />
                <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 leading-snug">
                  {prompt}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
