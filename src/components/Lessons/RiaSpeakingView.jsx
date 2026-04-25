import { FiPlay, FiPause, FiSquare } from 'react-icons/fi';
import { Button } from 'react-bootstrap';
import './RiaSpeakingView.css';

/**
 * RiaSpeakingView Component
 * Displays an animated Ria avatar that pulses/zooms while speaking
 * Shows subtitle and control buttons below
 */
export default function RiaSpeakingView({
  isPlaying = false,
  text = '',
  onPlayPause = () => { },
  onStop = () => { },
  isLoading = false,
  playingId = null,
  narrationId = null,
}) {
  const isCurrentlyPlaying = playingId === narrationId && isPlaying;

  return (
    <div className="ria-speaking-container">
      {/* Animated Ria Circle */}
      <div className={`ria-avatar-circle ${isCurrentlyPlaying ? 'speaking' : ''}`}>
        <div className="ria-avatar-inner">Ria</div>
        {isCurrentlyPlaying && <div className="speaking-pulse" />}
      </div>

      {/* Subtitle - Shows what Ria is saying */}
      <div className={`ria-subtitle ${isCurrentlyPlaying ? 'active' : 'idle'}`} aria-live="polite">
        {isCurrentlyPlaying && text ? (
          <>
            <p className="subtitle-text">{text}</p>
            <div className="speaking-dots">
              <span />
              <span />
              <span />
            </div>
          </>
        ) : (
          <p></p>
        )}
      </div>

      {/* Control Buttons */}
      <div className="ria-controls">
        <Button
          variant={isCurrentlyPlaying ? 'warning' : 'primary'}
          size="lg"
          onClick={onPlayPause}
          // disabled={isLoading}
          className="control-button"
          aria-pressed={isCurrentlyPlaying}
        >
          {isCurrentlyPlaying ? (
            <>
              <FiPause size={20} className="me-2" onClick={onStop}
               />
              Pause
            </>
          ) : (
            <>
              <FiPlay size={20} className="me-2" />
              Play
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
