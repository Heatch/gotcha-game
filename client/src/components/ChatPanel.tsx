import { useState, useRef, useEffect, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket, type ChatMessage } from '../hooks/useSocket';
import { useAuth } from '../context/AuthContext';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ChatPanel({ open, onClose }: Props) {
  const { user } = useAuth();
  const { messages, sendMessage } = useSocket();
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleSend(e: FormEvent) {
    e.preventDefault();
    if (!text.trim() || !user) return;
    sendMessage(text.trim(), user.name);
    setText('');
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="chat-panel"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        >
          <div className="chat-header">
            <h3>Chat</h3>
            <button className="chat-close" onClick={onClose}>&#10005;</button>
          </div>
          <div className="chat-messages">
            {messages.map((m: ChatMessage, i: number) => (
              <ChatBubble key={i} msg={m} />
            ))}
            <div ref={bottomRef} />
          </div>
          <form className="chat-input-bar" onSubmit={handleSend}>
            <input
              type="text"
              placeholder="Type a message..."
              value={text}
              onChange={e => setText(e.target.value)}
              autoComplete="off"
            />
            <button type="submit" className="chat-send-btn">Send</button>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ChatBubble({ msg }: { msg: ChatMessage }) {
  if (msg.type === 'system') {
    return (
      <div className="chat-bubble system">
        <p>{msg.text}</p>
        {msg.comment && <p className="chat-comment">{msg.comment}</p>}
      </div>
    );
  }
  if (msg.type === 'system_fail') {
    return (
      <div className="chat-bubble system-fail">
        <p>{msg.text}</p>
      </div>
    );
  }
  return (
    <div className="chat-bubble user">
      <span className="chat-sender">{msg.sender}</span>
      <p>{msg.text}</p>
    </div>
  );
}
