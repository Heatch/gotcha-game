import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUsers } from '../api';
import ThemeToggle from '../components/ThemeToggle';
import MissionWalletCard from '../components/MissionWalletCard';
import ChatPanel from '../components/ChatPanel';
import LeaderboardPanel from '../components/LeaderboardPanel';
import IconChat from '~icons/material-symbols/chat-outline';
import IconLeaderboard from '~icons/material-symbols/leaderboard-outline';

export default function WalletPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [allNames, setAllNames] = useState<string[]>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!user) { navigate('/'); return; }
    getUsers().then(data => {
      setAllNames(data.map((u: { name: string }) => u.name));
      setLoading(false);
    });
  }, [user, navigate]);

  if (!user || loading) {
    return (
      <div className="page">
        <div className="loading">Loading&#8230;</div>
      </div>
    );
  }

  return (
    <div className="page wallet-page">
      <ThemeToggle />
      <header className="wallet-header">
        <h1>gotcha!</h1>
        <p className="wallet-score">score: {user.score || 0}</p>
      </header>

      <div className="folder-container">
        <div className="folder-tab">Mission Wallet</div>
        <div className="folder-body">
          <div className="folder-cards-stack">
            {user.missions.map((m, i) => (
              <div
                key={i}
                className={`folder-card-wrapper ${expandedIndex === i ? 'expanded' : ''}`}
                style={{
                  transform: expandedIndex === i
                    ? 'rotate(0deg)'
                    : `rotate(${i % 2 === 0 ? -1.5 : 1.5}deg)`,
                  zIndex: expandedIndex === i ? 10 : i + 1,
                }}
              >
                <MissionWalletCard
                  mission={m}
                  index={i}
                  allUserNames={allNames}
                  isExpanded={expandedIndex === i}
                  onExpandChanged={(expanded) => setExpandedIndex(expanded ? i : null)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="wallet-bottom-bar">
        <button className="icon-btn" onClick={() => setChatOpen(true)}>
          <IconChat />
        </button>
        <button className="icon-btn" onClick={() => setLeaderboardOpen(true)}>
          <IconLeaderboard />
        </button>
      </div>

      <ChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />
      <LeaderboardPanel open={leaderboardOpen} onClose={() => setLeaderboardOpen(false)} />
    </div>
  );
}
