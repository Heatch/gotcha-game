import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMissionPool } from '../api';
import MissionSelector from '../components/MissionSelector';
import ThemeToggle from '../components/ThemeToggle';

export default function MissionSelectPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isRefill = searchParams.get('refill') === 'true';

  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<{ id: number; mission: string }[]>([]);
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    if (!isRefill && user.selection_complete) {
      navigate('/wallet');
      return;
    }
    getMissionPool(user.name, isRefill).then(data => {
      if (!isRefill && data.complete) {
        navigate('/wallet');
      } else {
        setCards(data.cards);
        setSelected(data.selected);
        setLoading(false);
      }
    });
  }, [user, navigate, isRefill]);

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
      <h1 className="page-title">
        {isRefill ? 'New mission available — pick one' : 'Select your mission'}
      </h1>
      <MissionSelector
        initialCards={cards}
        initialSelected={selected}
        total={isRefill ? 1 : 5}
        refillMode={isRefill}
      />
    </div>
  );
}
