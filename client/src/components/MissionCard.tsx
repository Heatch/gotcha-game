import { motion } from 'framer-motion';

interface Props {
  mission: string;
  onClick: () => void;
  index: number;
}

export default function MissionCard({ mission, onClick, index }: Props) {
  return (
    <motion.button
      className="mission-card"
      onClick={onClick}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.35, delay: index * 0.1, ease: 'easeOut' }}
    >
      <p className="mission-text">{mission}</p>
    </motion.button>
  );
}
