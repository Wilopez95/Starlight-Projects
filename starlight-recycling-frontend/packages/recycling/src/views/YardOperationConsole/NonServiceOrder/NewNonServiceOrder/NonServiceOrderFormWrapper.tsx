import React, { FC, ReactNode } from 'react';
import { Box, makeStyles } from '@material-ui/core';
import { CloseConfirmationFormTracker } from '@starlightpro/common';
import { CloseButton } from '../../components/CloseButton';
import { NonServiceOrderSidebar } from './NonServiceOrderSidebar';

const useStyles = makeStyles(
  ({ spacing, palette }) => ({
    contentGrid: {
      display: 'flex',
      flexDirection: 'row',
      flexGrow: 1,
      height: '100%',
      overflowX: 'hidden',
    },
    content: {
      overflowY: 'auto',
      overflowX: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: '300px',
      position: 'relative',
    },
    formContainer: {
      display: 'flex',
      flexDirection: 'row',
      width: '1164px',
      height: '100%',
    },
    formContentWrapper: {
      display: 'flex',
      flexDirection: 'column',
      flexGrow: 1,
      height: '100%',
    },
    header: {
      display: 'flex',
      flexDirection: 'column',
      paddingRight: spacing(4),
    },
    formSidePanel: {
      minWidth: 300,
      maxWidth: 300,
      background: palette.background.default,
      display: 'flex',
      overflowX: 'auto',
    },
    footer: {
      padding: spacing(0, 4, 3, 4),
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
    },
    contentMain: {
      padding: spacing(4),
      width: '100%',
      overflowX: 'auto',
    },
  }),
  { name: 'NonServiceOrderFormWrapper' },
);

interface Props {
  footer?: ReactNode;
}

export const NonServiceOrderFormWrapper: FC<Props> = ({ children, footer }) => {
  const classes = useStyles();

  return (
    <Box className={classes.formContainer}>
      <CloseConfirmationFormTracker />
      <Box className={classes.formContentWrapper}>
        <Box className={classes.content}>
          <CloseButton />
          <Box className={classes.contentGrid}>
            <NonServiceOrderSidebar />
            <Box className={classes.contentMain}>{children}</Box>
          </Box>
        </Box>
        {footer}
      </Box>
    </Box>
  );
};
