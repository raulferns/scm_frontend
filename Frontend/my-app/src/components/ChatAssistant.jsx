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
    <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 9999, display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
      {/* --- Floating Chat Panel --- */}
      {isOpen && (
        <div style={{
          marginBottom: "16px", width: "360px",
          background: "#0a0f1a", borderRadius: "16px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
          border: "1px solid rgba(255,255,255,0.08)",
          overflow: "hidden", display: "flex", flexDirection: "column",
        }}>
          {/* Header */}
          <div style={{
            padding: "16px", background: "rgba(124,58,237,0.9)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            borderBottom: "1px solid rgba(139,92,246,0.3)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "8px", height: "8px", background: "#34d399", borderRadius: "50%", display: "inline-block" }} />
              <h3 style={{ fontWeight: 600, fontSize: "14px", color: "#f9fafb", margin: 0 }}>Shipment AI Assistant</h3>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              style={{
                background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "6px",
                padding: "4px 8px", color: "#f9fafb", cursor: "pointer", fontSize: "14px",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
            >
              ✕
            </button>
          </div>

          {/* Scrollable Message History */}
          <div style={{ height: "384px", overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "12px", background: "#080d16" }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: "80%", padding: "10px 14px", borderRadius: "14px", fontSize: "14px",
                  ...(msg.role === "user"
                    ? { background: "rgba(124,58,237,0.85)", color: "#f9fafb", borderTopRightRadius: "4px" }
                    : { background: "rgba(255,255,255,0.06)", color: "#d1d5db", border: "1px solid rgba(255,255,255,0.08)", borderTopLeftRadius: "4px" }
                  ),
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
            
            {/* Loading Indicator */}
            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div style={{
                  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
                  padding: "12px 16px", borderRadius: "14px", borderTopLeftRadius: "4px",
                  display: "flex", gap: "4px",
                }}>
                  {[0, 0.2, 0.4].map((d, i) => (
                    <span key={i} style={{
                      width: "6px", height: "6px", background: "#6b7280", borderRadius: "50%",
                      display: "inline-block", animation: `chatBounce 1.4s ease-in-out ${d}s infinite`,
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          {/* Input Field */}
          <div style={{
            padding: "12px", background: "#0a0f1a",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            display: "flex", gap: "8px",
          }}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask about shipment risks..."
              disabled={loading} // UX: Disable while processing
              style={{
                flex: 1, background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px",
                padding: "8px 14px", fontSize: "14px", color: "#f9fafb",
                outline: "none", fontFamily: "inherit",
                opacity: loading ? 0.5 : 1,
              }}
            />
            <button
              onClick={handleSend}
              disabled={loading || !query.trim()}
              style={{
                background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                border: "none", borderRadius: "10px", padding: "8px 14px",
                color: "white", cursor: loading || !query.trim() ? "not-allowed" : "pointer",
                opacity: loading || !query.trim() ? 0.5 : 1,
                fontSize: "16px", transition: "opacity 0.15s",
              }}
            >
              🚀
            </button>
          </div>
        </div>
      )}

      {/* --- Floating Toggle Button --- */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "52px", height: "52px", borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "22px", border: "1px solid rgba(139,92,246,0.4)",
          background: isOpen
            ? "rgba(30,20,60,0.95)"
            : "linear-gradient(135deg, #7c3aed, #6d28d9)",
          color: "white", cursor: "pointer",
          boxShadow: "0 0 20px rgba(124,58,237,0.4)",
          transition: "all 0.25s ease",
          transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.boxShadow = "0 0 30px rgba(124,58,237,0.6)";
          e.currentTarget.style.transform = isOpen ? "rotate(90deg) scale(1.05)" : "scale(1.05)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.boxShadow = "0 0 20px rgba(124,58,237,0.4)";
          e.currentTarget.style.transform = isOpen ? "rotate(90deg)" : "rotate(0deg)";
        }}
      >
        {isOpen ? "✕" : "💬"}
      </button>

      <style>{`
        @keyframes chatBounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40%            { transform: scale(1);   opacity: 1;   }
        }
      `}</style>
    </div>
  );
};

export default ChatAssistant;