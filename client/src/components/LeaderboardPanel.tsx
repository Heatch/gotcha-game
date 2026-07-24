import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getUsers } from '../api';
import IconClose from '~icons/material-symbols/close';

interface LeaderboardUser {
  name: string;
  pseudonym: string;
  score: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function LeaderboardPanel({ open, onClose }: Props) {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);

  useEffect(() => {
    if (open) {
      getUsers().then(data => setUsers(data));
    }
  }, [open]);

  const sorted = [...users].sort((a, b) => b.score - a.score);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="leaderboard-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="leaderboard-panel"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="leaderboard-header">
              <h3>Leaderboard</h3>
              <button className="chat-close" onClick={onClose}><IconClose /></button>
            </div>
            <div className="leaderboard-list">
              {sorted.map((u, i) => (
                <div key={u.name} className={`leaderboard-row ${i < 3 ? `pos-${i + 1}` : ''}`}>
                  <span className="lb-rank">#{i + 1}</span>
                  <span className="lb-name">{u.pseudonym}</span>
                  <span className="lb-score">{u.score} pts</span>
                </div>
              ))}
              {sorted.length === 0 && (
                <p className="lb-empty">No players yet.</p>
              )}
            </div>
            <p className="lb-anon-note">Names are anonymous &mdash; keep it secret!</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
