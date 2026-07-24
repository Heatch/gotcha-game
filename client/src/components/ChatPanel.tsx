import { useState, useRef, useEffect, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket, type ChatMessage } from '../hooks/useSocket';
import { useAuth } from '../context/AuthContext';
import { getUsers } from '../api';
import { colorForSender } from '../pseudonymColors';
import IconClose from '~icons/material-symbols/close';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ChatPanel({ open, onClose }: Props) {
  const { user } = useAuth();
  const { messages, sendMessage } = useSocket();
  const [text, setText] = useState('');
  const [pseudonymByName, setPseudonymByName] = useState<Map<string, string>>(new Map());
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    getUsers()
      .then((data: { name: string; pseudonym: string }[]) => {
        setPseudonymByName(new Map(data.map(u => [u.name, u.pseudonym])));
      })
      .catch(() => {});
  }, []);

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
            <button className="chat-close" onClick={onClose}><IconClose /></button>
          </div>
          <div className="chat-messages">
            {messages.map((m: ChatMessage, i: number) => (
              <ChatBubble key={i} msg={m} isOwn={m.sender === user?.name} pseudonymByName={pseudonymByName} />
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

function ChatBubble({
  msg,
  isOwn,
  pseudonymByName,
}: {
  msg: ChatMessage;
  isOwn: boolean;
  pseudonymByName: Map<string, string>;
}) {
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
  const senderColor = !isOwn && msg.sender ? colorForSender(msg.sender, pseudonymByName) : null;
  return (
    <div
      className={`chat-bubble user ${isOwn ? 'own' : 'other'}`}
      style={senderColor ? { borderLeftColor: senderColor } : undefined}
    >
      <span className="chat-sender" style={senderColor ? { color: senderColor } : undefined}>
        {msg.sender}
      </span>
      <p>{msg.text}</p>
    </div>
  );
}
