import { useState } from 'react';
import { updateMissionStatus } from '../api';
import { useAuth } from '../context/AuthContext';
import NameCarousel from './NameCarousel';
import IconEdit from '~icons/material-symbols/edit-outline';
import IconArrowBack from '~icons/material-symbols/arrow-back';

interface Mission {
  mission: string;
  status: string;
  last_edit: string;
  gotted: string;
  comments: string;
}

interface Props {
  mission: Mission;
  index: number;
  allUserNames: string[];
  isExpanded: boolean;
  onExpandChanged: (expanded: boolean) => void;
}

export default function MissionWalletCard({ mission, index, allUserNames, isExpanded, onExpandChanged }: Props) {
  const { user, setUser } = useAuth();
  const [step, setStep] = useState<'actions' | 'carousel' | 'comments'>('actions');
  const [selectedName, setSelectedName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [confirmFail, setConfirmFail] = useState(false);
  const [updating, setUpdating] = useState(false);

  const isLocked = mission.status !== 'open';

  function reset() {
    onExpandChanged(false);
    setStep('actions');
    setSelectedName('');
    setCommentText('');
    setConfirmFail(false);
  }

  async function handleFail() {
    if (!confirmFail) { setConfirmFail(true); return; }
    setUpdating(true);
    const result = await updateMissionStatus(user!.name, index, 'failed');
    setUpdating(false);
    if (result.success) {
      setUser(result.user);
      reset();
    }
  }

  async function handleSuccessStart() {
    setStep('carousel');
  }

  async function handleNameSelect(name: string) {
    setSelectedName(name);
    setStep('comments');
  }

  async function handleSubmitComments() {
    setUpdating(true);
    const result = await updateMissionStatus(user!.name, index, 'completed', selectedName, commentText);
    setUpdating(false);
    if (result.success) {
      setUser(result.user);
      reset();
    }
  }

  const statusClass = mission.status === 'completed' ? 'card-success' : mission.status === 'failed' ? 'card-failed' : '';

  return (
    <div className={`wallet-card ${statusClass}`}>
      <div className="wallet-card-main">
        <p className="wallet-card-text">{mission.mission}</p>
        {!isLocked && (
          <button
            className="pencil-btn"
            onClick={() => { reset(); onExpandChanged(!isExpanded); }}
            aria-label="Edit mission status"
          >
            <IconEdit />
          </button>
        )}
      </div>

      {isExpanded && !isLocked && step === 'actions' && (
        <div className="wallet-card-actions">
          {confirmFail ? (
            <div className="fail-confirm">
              <span>Mark as failed?</span>
              <button className="btn-fail" onClick={handleFail} disabled={updating}>
                {updating ? '...' : 'Yes, fail it'}
              </button>
              <button className="btn-cancel" onClick={() => setConfirmFail(false)}>Cancel</button>
            </div>
          ) : (
            <>
              <button className="btn-fail" onClick={handleFail}>FAIL</button>
              <button className="btn-success" onClick={handleSuccessStart}>SUCCESS</button>
            </>
          )}
        </div>
      )}

      {isExpanded && !isLocked && step === 'carousel' && (
        <NameCarousel
          names={allUserNames}
          gottedHistory={user?.gotted_history || []}
          onSelect={handleNameSelect}
          onBack={() => setStep('actions')}
        />
      )}

      {isExpanded && !isLocked && step === 'comments' && (
        <div className="comments-section">
          <button className="carousel-back" onClick={() => setStep('carousel')} aria-label="Go back">
            <IconArrowBack />
          </button>
          <textarea
            className="comment-input"
            placeholder="How did you get them? (optional)"
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            rows={3}
          />
          <button className="btn-submit" onClick={handleSubmitComments} disabled={updating}>
            {updating ? 'Saving...' : 'Submit'}
          </button>
        </div>
      )}

      {(mission.gotted || mission.comments) && isLocked && (
        <div className="wallet-card-detail">
          {mission.gotted && <span className="detail-gotted">Got: {mission.gotted}</span>}
          {mission.comments && <span className="detail-comment">{mission.comments}</span>}
        </div>
      )}
    </div>
  );
}
