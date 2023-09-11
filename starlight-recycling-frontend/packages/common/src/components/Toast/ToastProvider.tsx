import React from 'react';
import cs from 'classnames';
import { ToastContainer, cssTransition } from 'react-toastify';
import CloseIcon from '@material-ui/icons/Close';
import { createStyles, makeStyles } from '@material-ui/core';

import 'react-toastify/dist/ReactToastify.min.css';

const transitionDuration = 750;

const getAnimationFromKeyFrames = (keyframes: string) =>
  `${keyframes} ${transitionDuration}ms linear both`;

const useStyles = makeStyles(({ palette, spacing }) =>
  createStyles<string, {}>({
    container: {
      position: 'fixed',
      top: 0,
      right: 0,
      left: 'auto',
      zIndex: 1400,
      padding: spacing(1),
      width: 320,
    },
    toast: {
      color: palette.text.primary,
      background: palette.common.white,
      paddingLeft: spacing(3),
      fontSize: 14,
      borderRadius: 1,
    },
    error: { color: palette.error.main },
    warning: {
      backgroundColor: palette.primary.main,
      height: '2px',
    },
    errorProgress: { backgroundColor: palette.error.main },
    successProgress: { backgroundColor: palette.primary.main },
    closeIcon: {
      color: palette.grey[300],
      width: 14,
    },
    '@keyframes slideIn': {
      from: {
        opacity: 0,
        transform: 'translate3d(110%, 0, 0)',
        visibility: 'visible',
      },
      to: {
        opacity: 1,
        transform: 'translate3d(0, 0, 0)',
      },
    },
    '@keyframes slideOut': {
      from: {
        opacity: 1,
        transform: 'translate3d(0, 0, 0)',
      },
      to: {
        opacity: 0,
        visibility: 'hidden',
        transform: 'translate3d(110%, 0, 0)',
      },
    },
    slideIn: {
      animation: getAnimationFromKeyFrames('$slideIn'),
    },
    slideOut: {
      animation: getAnimationFromKeyFrames('$slideOut'),
    },
  }),
);

export const ToastProvider = () => {
  const classes = useStyles();

  const slideAnimation = cssTransition({
    enter: classes.slideIn,
    exit: classes.slideOut,
  });

  return (
    <ToastContainer
      transition={slideAnimation}
      className={classes.container}
      toastClassName={({ type, defaultClassName } = {}) =>
        cs(defaultClassName, classes.toast, type && classes[type])
      }
      progressClassName={({ type, defaultClassName } = {}) =>
        cs(defaultClassName, type && classes[`${type}Progress`])
      }
      closeButton={<CloseIcon fontSize="small" classes={{ root: classes.closeIcon }} />}
    />
  );
};
