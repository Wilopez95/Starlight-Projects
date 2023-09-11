import React, { FC, ReactNode } from 'react';
import cs from 'classnames';
import { Box, Button, makeStyles } from '@material-ui/core';
import { CloseButton } from '../../components/CloseButton';
import { Trans } from '../../../../i18n';
import { closeSidePanel } from '../../../../components/SidePanels';

const useStyles = makeStyles(
  ({ spacing, palette, appDrawer }) => ({
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
      width: '1364px',
      maxWidth: '100vw',
      height: '100%',
      overflow: 'hidden',
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
    formSidePanel: {
      minWidth: 300,
      maxWidth: 300,
      background: palette.background.default,
      display: 'flex',
      overflowX: 'hidden',
    },
    contentWrapper: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      width: '100%',
      padding: spacing(2, 3),
      overflow: 'hidden',
      flexShrink: 0,
    },
    mainContent: {
      flexShrink: 1,
      'overflow-y': 'auto',
      paddingTop: 0,
    },
    backButton: {
      backgroundColor: palette.grey[800],
      color: palette.common.white,
      marginBottom: spacing(3),
    },
    drawerPaper: {
      backgroundColor: palette.grey[900],
      color: palette.common.white,
      border: 'none',
      width: appDrawer.width,
    },
  }),
  { name: 'EditOrderFormWrapper' },
);

export interface EditOrderFormWrapperProps {
  sidePanel?: JSX.Element;
  formSidePanel?: JSX.Element;
  footer?: ReactNode;
  noDrawer?: boolean;
}

export const EditOrderFormWrapper: FC<EditOrderFormWrapperProps> = ({
  children,
  sidePanel,
  formSidePanel,
  footer,
  noDrawer,
}) => {
  const classes = useStyles();

  return (
    <Box className={classes.formContainer}>
      {!noDrawer && (
        <Box
          display="flex"
          flexDirection="column"
          className={classes.drawerPaper}
          alignItems="center"
          width="100%"
          height="100vh"
        >
          <Box className={classes.contentWrapper}>
            <Button
              className={classes.backButton}
              fullWidth
              variant="contained"
              onClick={() => closeSidePanel()}
            >
              <Trans>Back</Trans>
            </Button>
          </Box>
          <Box className={cs(classes.contentWrapper, classes.mainContent)}>{sidePanel}</Box>
        </Box>
      )}
      <Box className={classes.formContentWrapper}>
        <Box className={classes.content}>
          <CloseButton />
          <Box className={classes.contentGrid}>
            <Box className={classes.formSidePanel}>{formSidePanel}</Box>
            <Box className={classes.contentMain}>{children}</Box>
          </Box>
        </Box>
        {footer}
      </Box>
    </Box>
  );
};
