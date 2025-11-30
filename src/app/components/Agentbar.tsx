"use client";
import { useState } from "react";

const BACKEND_URL = 'http://localhost:8000/api/chat';

export default function Agentbar() {
  const [messages, setMessages] = useState<{user: string, bot: string}[]>([]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: input }),
    });
    const data = await res.json();
    setMessages([...messages, { user: input, bot: data.response }]);
    setInput('');
  };

  return (
    <div className="agentbar">
      <input
        className="agentbar-input"
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Ask anything..."
      />
      <button className="agentbar-button" onClick={sendMessage}>&#8593;</button>
    </div>
  );
}
