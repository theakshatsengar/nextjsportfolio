'use client';

import { useState, useRef, useEffect } from 'react';

export default function Chat() {
  const [messages, setMessages] = useState([
    { sender: 'cisco', text: 'hi, how can i help you?' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setInput('');
    setLoading(true);

    // Append user message to UI immediately
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);

    try {
      // Prepare pastMessages for API format
      const pastMessages = messages.map((msg) => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text,
      }));

      const res = await fetch('/api/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, pastMessages }),
      });

      const data = await res.json();
      const botResponse = data.response;

      setMessages((prev) => [...prev, { sender: 'cisco', text: botResponse }]);
    } catch {
      setMessages((prev) => [...prev, { sender: 'cisco', text: 'Failed to connect to AI.' }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

  return (
    <section>
      <h1 className="mb-2 text-2xl font-semibold tracking-tighter">chat with cisco.</h1>
      <p className="mb-8">feel free to ask anything or chat.</p>

      <div
        ref={scrollRef}
        className="overflow-y-auto max-h-[60vh] mb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style>{`div::-webkit-scrollbar { display: none; }`}</style>

        {messages.map((msg, idx) => {
          const next = messages[idx + 1];
          const isUser = msg.sender === 'user';
          const nextIsCisco = next?.sender === 'cisco';

          return (
            <p key={idx} className={isUser && nextIsCisco ? 'mb-1' : 'mb-6'}>
              <span className="font-medium">{msg.sender}:</span> {msg.text}
            </p>
          );
        })}

        {loading && (
          <p className="mb-6">
            <span className="font-medium">cisco:</span> typing...
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mb-0">
        <div className="flex items-center text-base"> 
          <span className="font-medium mr-2">user:</span>
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} className="flex-1 bg-transparent outline-none border-none focus:outline-none" autoFocus /> 
        </div>
      </form>
    </section>
  );
}
