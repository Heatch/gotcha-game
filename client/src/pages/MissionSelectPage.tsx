import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMissionPool } from '../api';
import MissionSelector from '../components/MissionSelector';
import ThemeToggle from '../components/ThemeToggle';

export default function MissionSelectPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<{ id: number; mission: string }[]>([]);
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    if (user.selection_complete || user.missions.length >= 5) {
      navigate('/wallet');
      return;
    }
    getMissionPool(user.name).then(data => {
      if (data.complete) {
        navigate('/wallet');
      } else {
        setCards(data.cards);
        setSelected(data.selected);
        setLoading(false);
      }
    });
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="page">
        <div className="loading">Loading&#8230;</div>
      </div>
    );
  }

  return (
    <div className="page mission-page">
      <ThemeToggle />
      <h1 className="page-title">Select your mission</h1>
      <MissionSelector initialCards={cards} initialSelected={selected} />
    </div>
  );
}
