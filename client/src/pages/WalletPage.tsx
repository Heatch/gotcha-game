import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, type WalletEntry } from '../context/AuthContext';
import { getUsers, checkRefill, refreshUser } from '../api';
import ThemeToggle from '../components/ThemeToggle';
import MissionWalletCard from '../components/MissionWalletCard';
import ChatPanel from '../components/ChatPanel';
import LeaderboardPanel from '../components/LeaderboardPanel';
import InfoPanel from '../components/InfoPanel';
import IconChat from '~icons/material-symbols/chat-outline';
import IconLeaderboard from '~icons/material-symbols/leaderboard-outline';
import IconInfo from '~icons/material-symbols/info-outline';

interface DisplayCard {
  mission: string;
  status: string;
  last_edit: string;
  gotted: string;
  comments: string;
  slotIndex: number | null;
}

export default function WalletPage() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [allNames, setAllNames] = useState<string[]>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [refillEligible, setRefillEligible] = useState(false);
  const [countdown, setCountdown] = useState<string | null>(null);
  const initialLoadDone = useRef(false);

  useEffect(() => {
    if (!user) { navigate('/'); return; }

    refreshUser(user.name)
      .then(data => { if (data.name) setUser(data); })
      .catch(() => {})
      .finally(() => setLoading(false));

    getUsers()
      .then(data => { if (Array.isArray(data)) setAllNames(data.map((u: { name: string }) => u.name)); })
      .catch(() => {});

    initialLoadDone.current = true;
  }, []);

  useEffect(() => {
    if (!user || !initialLoadDone.current) return;
    const hasNullSlots = (user.missions || []).some(m => m === null);
    if (hasNullSlots) {
      checkRefill(user.name)
        .then(data => { if (data.eligible) setRefillEligible(true); })
        .catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    if (!user || refillEligible) return;
    const cd = user.slot_cooldowns;
    const ms = user.missions;
    if (!cd || !ms) return;

    function update() {
      const now = Date.now();
      let earliest: number | null = null;
      let hasExpired = false;
      for (let i = 0; i < 5; i++) {
        if (ms[i] === null) {
          const cdi = cd[i];
          if (!cdi) {
            hasExpired = true;
          } else {
            const t = new Date(cdi).getTime();
            if (t <= now) {
              hasExpired = true;
            } else if (earliest === null || t < earliest) {
              earliest = t;
            }
          }
        }
      }
      if (hasExpired) {
        setRefillEligible(true);
        setCountdown(null);
        return;
      }
      if (earliest === null) {
        setCountdown(null);
        return;
      }
      const diff = earliest - now;
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${m}m ${s.toString().padStart(2, '0')}s`);
    }

    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, [user, refillEligible]);

  if (!user || loading) {
    return (
      <div className="page">
        <div className="loading">Loading&#8230;</div>
      </div>
    );
  }

  const activeCards: DisplayCard[] = (user.missions || [])
    .filter((m): m is NonNullable<typeof m> => m !== null)
    .map(m => ({ ...m, slotIndex: (user.missions || []).indexOf(m) }));

  const walletCards: DisplayCard[] = (user.wallet || []).map((w: WalletEntry) => ({
    mission: w.mission,
    status: w.status,
    last_edit: w.timestamp,
    gotted: w.gotted,
    comments: w.comments,
    slotIndex: null,
  }));

  const allCards: DisplayCard[] = [...walletCards.reverse(), ...activeCards];

  return (
    <div className="page wallet-page">
      <ThemeToggle />
      <button className="info-btn" onClick={() => setInfoOpen(true)} aria-label="How to play">
        <IconInfo />
      </button>
      <header className="wallet-header">
        <h1>gotcha!</h1>
        <p className="wallet-score">score: {user.completed_count ?? 0}</p>
      </header>

      <div className="folder-container">
        <div className="folder-tab">Mission Wallet</div>
        <div className="folder-body wallet-scroll">
          <div className="folder-cards-stack">
            {allCards.map((c, i) => (
              <div
                key={c.slotIndex !== null ? `slot-${c.slotIndex}` : `wallet-${i}-${c.mission.slice(0, 10)}`}
                className={`folder-card-wrapper ${expandedIndex === i ? 'expanded' : ''}`}
                style={{
                  transform: expandedIndex === i
                    ? 'rotate(0deg)'
                    : `rotate(${i % 2 === 0 ? -1.5 : 1.5}deg)`,
                  zIndex: expandedIndex === i ? 10 : i + 1,
                }}
              >
                <MissionWalletCard
                  mission={c}
                  index={c.slotIndex !== null ? c.slotIndex : -1}
                  allUserNames={allNames}
                  isExpanded={expandedIndex === i}
                  onExpandChanged={(expanded) => setExpandedIndex(expanded ? i : null)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="refill-section">
        {refillEligible && (
          <div className="refill-banner" onClick={() => navigate('/missions?refill=true')}>
            New mission available — tap to pick!
          </div>
        )}
        {!refillEligible && countdown && (
          <div className="countdown-banner">
            Next mission in {countdown}
          </div>
        )}
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
      <InfoPanel open={infoOpen} onClose={() => setInfoOpen(false)} />
    </div>
  );
}
