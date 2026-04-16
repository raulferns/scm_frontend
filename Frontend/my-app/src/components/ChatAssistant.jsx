import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

/**
 * FEATURE: Conversational Assistant UI
 * Objective: Provide an interactive chat interface for users to query shipment insights.
 */

const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hello! How can I help you with your shipments today?" },
  ]);
  const [loading, setLoading] = useState(false);
  
  // Ref for auto-scrolling to the latest message
  const scrollRef = useRef(null);

  // Auto-scroll logic
  useEffect(() => {
    if (isOpen) {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!query.trim() || loading) return;

    const userMessage = { role: "user", text: query };
    setMessages((prev) => [...prev, userMessage]);
    setQuery("");
    setLoading(true);

    try {
      // ✅ API INTEGRATION: Endpoint POST /api/v1/ai/query
      const response = await axios.post("/api/v1/ai/query", { query });
      
      const aiResponse = { 
        role: "ai", 
        text: response.data.answer || "I couldn't find an answer for that." 
      };
      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Sorry, I'm having trouble connecting to the server." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      {/* --- Floating Chat Panel --- */}
      {isOpen && (
        <div className="mb-4 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          {/* Header */}
          <div className="p-4 bg-indigo-600 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              <h3 className="font-semibold text-sm">Shipment AI Assistant</h3>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="hover:bg-indigo-500 rounded p-1 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Scrollable Message History */}
          <div className="h-96 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-tr-none"
                      : "bg-white text-slate-700 border border-slate-200 rounded-tl-none shadow-sm"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            
            {/* Loading Indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          {/* Input Field */}
          <div className="p-3 bg-white border-t border-slate-100 flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask about shipment risks..."
              disabled={loading} // UX: Disable while processing
              className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={loading || !query.trim()}
              className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 disabled:bg-slate-300 transition-colors shadow-md"
            >
              🚀
            </button>
          </div>
        </div>
      )}

      {/* --- Floating Toggle Button --- */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-xl transition-all duration-300 ${
          isOpen ? "bg-slate-800 rotate-90" : "bg-indigo-600 hover:scale-110"
        } text-white`}
      >
        {isOpen ? "✕" : "💬"}
      </button>
    </div>
  );
};

export default ChatAssistant;