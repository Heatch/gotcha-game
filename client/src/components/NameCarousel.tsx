interface Props {
  names: string[];
  gottedHistory: string[];
  onSelect: (name: string) => void;
  onBack: () => void;
}

export default function NameCarousel({ names, gottedHistory, onSelect, onBack }: Props) {
  const others = names.filter(n => n !== 'Group');
  const allOptions = ['Group', ...others];

  return (
    <div className="name-carousel">
      <button className="carousel-back" onClick={onBack} aria-label="Go back">&#8592;</button>
      <div className="name-chips">
        {allOptions.map(n => {
          const isGotted = n !== 'Group' && gottedHistory.includes(n);
          return (
            <button
              key={n}
              className={`name-chip ${isGotted ? 'gotted' : ''}`}
              onClick={() => !isGotted && onSelect(n)}
              disabled={isGotted}
            >
              {n === 'Group' ? '\uD83D\uDC65 Group' : n}
            </button>
          );
        })}
      </div>
    </div>
  );
}
