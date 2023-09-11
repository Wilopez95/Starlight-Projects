import { isValidElement } from 'react';
import isString from 'lodash/isString';
import isFunction from 'lodash/isFunction';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheck,
  faExclamation,
  faInfoCircle,
  faExclamationTriangle,
} from '@fortawesome/pro-regular-svg-icons';
import { toast } from 'components/Toast';

// Note: this toast && is a conditional escape hatch for unit testing to avoid an error.
const getDefaultOptions = (options) => ({
  position: toast && toast.POSITION.BOTTOM_RIGHT,
  ...options,
});

const Toast = ({ children, success, error, info, warning }) => {
  let componentChildren;
  // Sometimes we are having an "object is not valid as a react child" error and children magically becomes an API error response, so we must use this fallback string
  if (!isValidElement(children) && !isString(children)) {
    componentChildren = 'An error occurred';
  } else {
    componentChildren = children;
  }
  let Icon = faInfoCircle;
  if (success) {
    Icon = faCheck;
  }
  if (error) {
    Icon = faExclamationTriangle;
  }
  if (info) {
    Icon = faInfoCircle;
  }
  if (warning) {
    Icon = faExclamation;
  }
  return (
    <div style={{ paddingLeft: 10, display: 'flex', alignItems: 'center' }}>
      <div style={{ width: 30, height: 30 }}>
        <FontAwesomeIcon icon={Icon} style={{ color: '#fff', width: 30, height: 30 }} />
      </div>
      <div style={{ padding: 8, display: 'flex', alignItems: 'center' }}>
        &nbsp;&nbsp;
        <span style={{ color: '#fff' }}>{componentChildren}</span>
      </div>
    </div>
  );
};

const toaster = (() => {
  // Attempt to remove a duplicate toast if it is on the screen
  const ensurePreviousToastIsRemoved = (toastId) => {
    if (toastId) {
      if (toast.isActive(toastId)) {
        toast.dismiss(toastId);
      }
    }
  };
  // Try to get the toast id if provided from options
  const attemptGetToastId = (msg, opts) => {
    let toastId;
    if (opts && isString(opts.toastId)) {
      toastId = opts.toastId;
    } else if (isString(msg)) {
      // We'll just make the string the id by default if its a string
      toastId = msg;
    }
    return toastId;
  };
  const handleToast = (type) => (msg, opts) => {
    const toastFn = toast[type];
    if (isFunction(toastFn)) {
      const toastProps = {};
      let className = '';
      const additionalOptions = {};
      const toastId = attemptGetToastId(msg, opts);
      if (toastId) {
        additionalOptions.toastId = toastId;
      }
      // Makes sure that the previous toast is removed by using the id, if its still on the screen
      ensurePreviousToastIsRemoved(toastId);
      // Apply the type of toast and its props
      switch (type) {
        case 'success':
          toastProps.success = true;
          className = 'toast-success';
          break;
        case 'error':
          toastProps.error = true;
          className = 'toast-error';
          break;
        case 'info':
          toastProps.info = true;
          className = 'toast-info';
          break;
        case 'warn':
          toastProps.warning = true;
          className = 'toast-warn';
          break;
        case 'neutral':
          toastProps.warning = true;
          className = 'toast-default';
          break;
        default:
          className = 'toast-default';
          break;
      }
      toastFn(<Toast {...toastProps}>{msg}</Toast>, {
        className,
        ...getDefaultOptions(),
        ...opts,
        ...additionalOptions,
      });
    }
  };
  return {
    success: handleToast('success'),
    error: handleToast('error'),
    info: handleToast('info'),
    warn: handleToast('warn'),
    neutral: handleToast('neutral'),
  };
})();

Toast.propTypes = {
  children: PropTypes.node,
  success: PropTypes.bool,
  error: PropTypes.bool,
  info: PropTypes.bool,
  warning: PropTypes.bool,
};

export const successToast = toaster.success;
export const errorToast = toaster.error;
export const infoToast = toaster.info;
export const warnToast = toaster.warn;
export const neutralToast = toaster.neutral;
