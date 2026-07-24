import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { selectMission } from '../api';
import { useAuth } from '../context/AuthContext';
import MissionCard from './MissionCard';
import ProgressBar from './ProgressBar';

interface Card {
  id: number;
  mission: string;
}

interface Props {
  initialCards: Card[];
  initialSelected: number;
  total?: number;
  refillMode?: boolean;
}

export default function MissionSelector({ initialCards, initialSelected, total = 5, refillMode = false }: Props) {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [cards, setCards] = useState<Card[]>(initialCards);
  const [selected, setSelected] = useState(initialSelected);
  const [selecting, setSelecting] = useState(false);

  async function handleSelect(missionId: number) {
    if (selecting) return;
    setSelecting(true);
    const result = await selectMission(user!.name, missionId, refillMode);

    if (refillMode && result.user) {
      setUser(result.user);
      navigate('/wallet');
      return;
    }

    if (result.user) {
      setUser(result.user);
    }

    if (result.complete) {
      navigate('/wallet');
    } else {
      setTimeout(() => {
        setCards(result.nextPool);
        setSelected((s: number) => s + 1);
        setSelecting(false);
      }, 400);
    }
  }

  return (
    <div className="mission-selector">
      <ProgressBar selected={selected} total={total} />
      <AnimatePresence mode="wait">
        <div className="cards-container" key={cards.map((c: Card) => c.id).join('-')}>
          {cards.map((card: Card, i: number) => (
            <div key={card.id}>
              {i === 1 && <div className="card-divider">OR</div>}
              <MissionCard
                mission={card.mission}
                onClick={() => handleSelect(card.id)}
                index={i}
              />
            </div>
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
}
