import React, { FC, ReactChild } from 'react';
import { Trans } from '../../../i18n';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '../../icons/Close';
import cs from 'classnames';

const useStyles = makeStyles(
  ({ spacing, palette }) =>
    createStyles({
      root: {
        width: 428,
        position: 'relative',
        maxWidth: '90vw',
      },
      description: {
        paddingTop: spacing(1.5),
      },
      title: {
        paddingBottom: 0,
        fontSize: '3.5rem',
        lineHeight: '5rem',
      },
      divider: {},
      topPart: {
        padding: spacing(4, 5),
      },
      bottomPart: {
        padding: spacing(4, 5),
      },
      dangerButton: {
        backgroundColor: palette.error.main,
        borderColor: palette.error.main,

        '&:hover': {
          backgroundColor: palette.error.dark,
          borderColor: palette.error.dark,
        },
      },
      confirmButton: {
        color: palette.primary.main,
      },
      alignRight: {
        margin: 'auto',
      },
      closeButton: {
        position: 'absolute',
        right: '24px',
        top: '24px',
        width: '25px',
        height: '25px',
        cursor: 'pointer',
      },
    }),
  { name: 'YouHaveUnsavedChanges' },
);

export interface YouHaveUnsavedChangesProps {
  title?: ReactChild;
  description?: JSX.Element;
  confirmLabel?: JSX.Element;
  cancelLabel?: JSX.Element;
  onConfirm?(): void | Promise<void>;
  onCancel?(): void;
  classes?: {
    root?: string;
  };
}

export const YouHaveUnsavedChanges: FC<YouHaveUnsavedChangesProps> = ({
  title = <Trans>Unsaved Changes</Trans>,
  description = <Trans>Changes will not be saved. Are you sure you want to leave?</Trans>,
  confirmLabel = <Trans>Cancel</Trans>,
  cancelLabel = <Trans>Leave</Trans>,
  onConfirm,
  onCancel,
  classes: classesProp,
}) => {
  const classes = useStyles({ classes: classesProp });

  return (
    <Box className={classes.root}>
      <IconButton
        className={classes.closeButton}
        aria-label="close"
        onClick={onConfirm}
        size="medium"
      >
        <CloseIcon fontSize="inherit" />
      </IconButton>
      <Box className={classes.topPart}>
        <Typography className={classes.title} variant="h5">
          {title}
        </Typography>
        {description && <Box className={classes.description}>{description}</Box>}
      </Box>
      <Divider className={classes.divider} />
      <Box className={classes.bottomPart}>
        <Box display="flex" flexDirection="row" justifyContent="space-between">
          <Button
            className={cs(classes.confirmButton, { [classes.alignRight]: !onCancel })}
            onClick={onConfirm}
            variant="outlined"
          >
            {confirmLabel}
          </Button>
          {onCancel && (
            <Button
              className={classes.dangerButton}
              onClick={onCancel}
              variant="contained"
              color="primary"
            >
              {cancelLabel}
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};
