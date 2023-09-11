import React, { ComponentType, FC, memo, ReactElement } from 'react';
import cs from 'classnames';
import { Box } from '@material-ui/core';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import CloseIcon from '../icons/Close';

const useStyles = makeStyles(
  ({ spacing, palette }) =>
    createStyles({
      paper: {
        padding: spacing(3, 0, 3, 3),
        minWidth: 300,
      },
      descriptionRow: {},
      statusField: {
        marginBottom: 0,
        marginLeft: 0,
        minHeight: '56px',
      },
      divider: {},
      footerDivider: {},
      dividerMargin: {
        marginTop: spacing(3),
      },
      dividerWithToolbarMargin: {
        marginTop: 0,
      },
      title: {
        marginRight: spacing(2),
        wordBreak: 'break-word',
        fontSize: 20,
      },
      actionsGroup: {
        '& > *': {
          marginLeft: spacing(2),
        },
        '& > *:first-child': {
          marginLeft: 0,
        },
      },
      form: {
        display: 'flex',
        flexGrow: 1,
      },
      toolbar: {
        marginTop: spacing(1),
        marginBottom: spacing(2),
      },
      cancelButtonLabel: {
        color: palette.primary.main,
      },
      closeButton: {
        alignSelf: 'flex-start',
        marginTop: spacing(-2),
        marginRight: spacing(-2),
      },
      headerWrapper: {
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        paddingRight: spacing(3),
      },
      header: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
      },
      footer: {
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        paddingRight: spacing(3),
      },
      content: {
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: '300px',
        overflow: 'auto',
        paddingTop: spacing(3),
        paddingRight: spacing(3),
      },
    }),
  {
    name: 'SidepanelView',
  },
);

export interface SidepanelViewProps {
  title?: React.ReactNode;
  toolbar?: React.ReactNode;
  onClose?(): void;
  WrapperComponent?: ComponentType;
  FooterComponent?: ComponentType;
  noHeaderDivider?: boolean;
  classes?: {
    paper?: string;
    header?: string;
    footer?: string;
    content?: string;
  };
  footerActions?: ReactElement;
  actions?: React.ReactNode;
}

export const SidepanelView: FC<SidepanelViewProps> = memo<SidepanelViewProps>(
  ({
    children,
    title,
    toolbar,
    onClose,
    actions,
    classes: classesOverrides,
    noHeaderDivider,
    WrapperComponent = React.Fragment,
    FooterComponent = React.Fragment,
  }) => {
    const classes = useStyles({ classes: classesOverrides });

    return (
      <WrapperComponent>
        <Paper elevation={0} className={classes.paper}>
          <Box display="flex" flexDirection="column" flexGrow="1" height="100%">
            <Box className={classes.headerWrapper}>
              <Box className={classes.header}>
                <Box display="flex" alignItems="flex-end">
                  <Typography variant="body1" className={classes.title}>
                    {title}
                  </Typography>
                </Box>
                <IconButton
                  className={classes.closeButton}
                  aria-label="close"
                  onClick={onClose}
                  size="medium"
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              </Box>
              {toolbar && <Box className={classes.toolbar}>{toolbar}</Box>}
              {!noHeaderDivider && (
                <Divider
                  className={cs(classes.divider, classes.dividerMargin, {
                    [classes.dividerWithToolbarMargin]: !!toolbar,
                  })}
                />
              )}
            </Box>

            <Box className={classes.content}>{children}</Box>
            {actions && (
              <Box className={classes.footer}>
                <Divider className={cs(classes.divider, classes.footerDivider)} />

                <Box display="flex" justifyContent="space-between" mt={3}>
                  {actions}
                  <FooterComponent />
                </Box>
              </Box>
            )}
          </Box>
        </Paper>
      </WrapperComponent>
    );
  },
);
