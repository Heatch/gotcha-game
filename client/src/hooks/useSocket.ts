import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export interface ChatMessage {
  type: 'user' | 'system' | 'system_fail';
  text: string;
  sender?: string;
  comment?: string;
  timestamp: string;
}

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const url = import.meta.env.PROD ? undefined : 'http://localhost:3001';
    const socket = io(url, { transports: ['polling', 'websocket'] });
    socketRef.current = socket;

    socket.on('connect', () => { setConnected(true); console.log('[socket] connected', socket.id); });
    socket.on('disconnect', (reason) => { setConnected(false); console.log('[socket] disconnected', reason); });
    socket.on('connect_error', (err) => { console.log('[socket] connect_error', err.message); });
    socket.on('chat_history', (msgs: ChatMessage[]) => setMessages(msgs));
    socket.on('chat_message', (msg: ChatMessage) => {
      setMessages(prev => [...prev.slice(-199), msg]);
    });

    return () => { socket.disconnect(); };
  }, []);

  const sendMessage = useCallback((text: string, sender: string) => {
    if (socketRef.current) {
      socketRef.current.emit('chat_message', { type: 'user', text, sender });
    }
  }, []);

  return { messages, connected, sendMessage };
}
