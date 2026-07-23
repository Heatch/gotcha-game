interface Props {
  selected: number;
  total: number;
}

export default function ProgressBar({ selected, total }: Props) {
  return (
    <div className="progress-bar">
      <div className="progress-label">
        {selected} of {total} selected
      </div>
      <div className="progress-dots">
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={`dot ${i < selected ? 'filled' : ''}`} />
        ))}
      </div>
    </div>
  );
}
