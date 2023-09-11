import React, { FC } from 'react';
import { Trans } from '../../../../i18n';
import { Box, Button, makeStyles } from '@material-ui/core';
import { closeSidePanel } from '../../../../components/SidePanels';
import SidepanelView, { SidepanelViewProps } from '@starlightpro/common/components/SidepanelView';

const useStyles = makeStyles(
  ({ spacing, palette, appDrawer }) => ({
    contentGrid: {
      display: 'flex',
      flexDirection: 'row',
      flexGrow: 1,
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
      width: '900px',
      maxWidth: '100vw',
      overflow: 'hidden',
    },
    formContentWrapper: {
      display: 'flex',
      flexDirection: 'column',
      flexGrow: 1,
      overflow: 'hidden',
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
    },
    formSidePanel: {
      minWidth: 300,
      maxWidth: 300,
      padding: spacing(4),
      background: palette.background.default,
    },
    mainContent: {
      flexShrink: 1,
      'overflow-y': 'auto',
      paddingTop: 0,
      width: '100%',
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
      padding: spacing(2, 3),
    },
    paper: {
      flexGrow: 1,
    },
  }),
  { name: 'CreateOrderFormWrapper' },
);

export interface CreateOrderFormWrapperProps {
  sidePanel?: JSX.Element;
  HeaderComponent: SidepanelViewProps['HeaderComponent'];
  actions: SidepanelViewProps['actions'];
}

export const CreateOrderFormWrapper: FC<CreateOrderFormWrapperProps> = ({
  children,
  sidePanel,
  HeaderComponent,
  actions,
}) => {
  const classes = useStyles();

  return (
    <Box className={classes.formContainer}>
      <Box
        display="flex"
        flexDirection="column"
        className={classes.drawerPaper}
        alignItems="center"
        width="100%"
        height="100vh"
      >
        <Button
          className={classes.backButton}
          fullWidth
          variant="contained"
          onClick={() => closeSidePanel()}
        >
          <Trans>Back</Trans>
        </Button>
        <Box className={classes.mainContent}>{sidePanel}</Box>
      </Box>
      <Box className={classes.formContentWrapper}>
        <SidepanelView
          onClose={closeSidePanel}
          HeaderComponent={HeaderComponent}
          classes={{
            paper: classes.paper,
          }}
          noHeaderDivider
          actions={actions}
        >
          {children}
        </SidepanelView>
      </Box>
    </Box>
  );
};
