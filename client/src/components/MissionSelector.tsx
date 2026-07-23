import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
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
}

export default function MissionSelector({ initialCards, initialSelected }: Props) {
  const { user, setUser } = useAuth();
  const [cards, setCards] = useState<Card[]>(initialCards);
  const [selected, setSelected] = useState(initialSelected);
  const [selecting, setSelecting] = useState(false);

  async function handleSelect(missionId: number) {
    if (selecting) return;
    setSelecting(true);
    const result = await selectMission(user!.name, missionId);
    const newMission = { mission: result.selected.mission, status: 'open', last_edit: '', gotted: '', comments: '' };
    if (result.complete) {
      setUser({
        ...user!,
        missions: [...user!.missions, newMission],
        selection_complete: true,
        selection_pool: [],
      });
    } else {
      setUser({
        ...user!,
        missions: [...user!.missions, newMission],
        selection_pool: result.nextPool.map((c: Card) => c.id),
      });
      setTimeout(() => {
        setCards(result.nextPool);
        setSelected((s: number) => s + 1);
        setSelecting(false);
      }, 400);
    }
  }

  return (
    <div className="mission-selector">
      <ProgressBar selected={user?.missions.length || selected} total={5} />
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
