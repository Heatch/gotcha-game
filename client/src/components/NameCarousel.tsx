import IconGroup from '~icons/material-symbols/group-outline';
import IconArrowBack from '~icons/material-symbols/arrow-back';

interface Props {
  names: string[];
  gottedHistory: string[];
  onSelect: (name: string) => void;
  onBack: () => void;
}

export default function NameCarousel({ names, gottedHistory, onSelect, onBack }: Props) {
  const others = names.filter(n => n !== 'Group');

  return (
    <div className="name-carousel">
      <button className="carousel-back" onClick={onBack} aria-label="Go back">
        <IconArrowBack />
      </button>
      <div className="name-chips">
        <button
          className="name-chip"
          onClick={() => onSelect('Group')}
        >
          <IconGroup /> Group
        </button>
        {others.map(n => {
          const isGotted = gottedHistory.includes(n);
          return (
            <button
              key={n}
              className={`name-chip ${isGotted ? 'gotted' : ''}`}
              onClick={() => !isGotted && onSelect(n)}
              disabled={isGotted}
            >
              {n}
            </button>
          );
        })}
      </div>
    </div>
  );
}
