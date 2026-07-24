import { motion, AnimatePresence } from 'framer-motion';
import IconClose from '~icons/material-symbols/close';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function InfoPanel({ open, onClose }: Props) {
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
            className="info-panel"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="leaderboard-header">
              <h3>How to Play</h3>
              <button className="chat-close" onClick={onClose}><IconClose /></button>
            </div>
            <div className="info-content">
              <div className="info-section">
                <h4>Goal</h4>
                <p>Each player gets a collection of secret missions. Complete them by getting other players to do the thing without them realising it's a mission. Most completions wins.</p>
              </div>
              <div className="info-section">
                <h4>Completing a mission</h4>
                <p>When someone does the thing, tap the pencil on that card, choose SUCCESS, pick who you "gotted" (or "Group"), and optionally add how you pulled it off.</p>
              </div>
              <div className="info-section">
                <h4>Failing a mission</h4>
                <p>If someone catches on and calls you out, or the attempt just doesn't work out, you MUST mark the mission as failed. Tap the pencil and choose FAIL. This can't be undone.</p>
              </div>
              <div className="info-section">
                <h4>Gotted rule</h4>
                <p>You can't pick the same player twice until you've gotted everyone once. "Group" is always available.</p>
              </div>
              <div className="info-section">
                <h4>Chat</h4>
                <p>See mission results in real time as they happen. Send messages to the group.</p>
              </div>
              <div className="info-section">
                <h4>Honour system</h4>
                <p>This game runs on trust &mdash; play honestly to keep it fun for everyone.</p>
              </div>
              <div className="info-section">
                <h4>Secrets</h4>
                <p>Don't show anyone your mission list! The surprise is the whole point.</p>
              </div>
              <p className="info-footer">Names on the leaderboard are random pseudonyms &mdash; the winner is revealed at the very end!</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
