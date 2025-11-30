// components/Chat.tsx
"use client";
import { useState } from "react";


const BACKEND_URL = 'http://localhost:8000/api/chat';

export default function Chat() {
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
    <div>
      {messages.map((m, i) => (
        <div key={i}>
          <div><b>You:</b> {m.user}</div>
          <div><b>Bot:</b> {m.bot}</div>
        </div>
      ))}
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Ask anything..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
