/* eslint-disable react/button-has-type */
import PropTypes from 'prop-types';
import cx from 'classnames';

const Button = ({ children, className, disabled, onClick, type, ...rest }) => (
  <button
    {...rest}
    className={cx('form-element btn', className, { isDisabled: disabled })}
    onClick={onClick}
    type={type}
    disabled={disabled}
  >
    {children}
  </button>
);

Button.propTypes = {
  /** Renders the children passed to the button */
  children: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  /** Adds a custom class to the button */
  className: PropTypes.string,
  /** Disables the button */
  disabled: PropTypes.bool,
  /** Sets the onClick handler for the button */
  onClick: PropTypes.func.isRequired,
  type: PropTypes.oneOf(['button', 'reset']),
};

Button.defaultProps = {
  children: null,
  className: null,
  disabled: false,
  type: 'button',
};

export default Button;
