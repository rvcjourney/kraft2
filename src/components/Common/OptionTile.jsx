import { Button } from 'react-bootstrap';
import './OptionTile.css';

/**
 * OptionTile Component
 * Reusable tile button for selection in multi-step forms
 * Used in OnboardingFlow for all step options
 */
export default function OptionTile({
  label,
  description,
  isSelected,
  onClick,
  icon: Icon,
  fullWidth = false,
}) {
  return (
    <Button
      variant="light"
      className={`option-tile ${isSelected ? 'selected' : ''} ${fullWidth ? 'w-100' : ''}`}
      onClick={onClick}
    >
      {Icon && (
        <div className="option-tile-icon">
          <Icon size={24} />
        </div>
      )}
      <div className="option-tile-content">
        <div className="option-tile-label">{label}</div>
        {description && (
          <div className="option-tile-description">{description}</div>
        )}
      </div>
    </Button>
  );
}
