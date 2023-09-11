import PropTypes from 'prop-types';
import FontIcon from '@root/components/FontIcon';

function CloseButton({ closeToast, type, ariaLabel }) {
  return (
    <button
      className={`sl-notif__close-button Toastify__close-button--${type}`}
      type="button"
      onClick={closeToast}
      aria-label={ariaLabel}
    >
      <FontIcon name="times" isInverted />
    </button>
  );
}

CloseButton.propTypes = {
  closeToast: PropTypes.func,
  ariaLabel: PropTypes.string,
  type: PropTypes.string,
};

CloseButton.defaultProps = {
  ariaLabel: 'close',
};

export default CloseButton;
