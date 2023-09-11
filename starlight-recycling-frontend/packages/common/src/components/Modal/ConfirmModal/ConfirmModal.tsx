import React, { FC, ReactChild } from 'react';

import { makeStyles, createStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import { Trans } from '../../../i18n';
import { closeModal } from '../../Modals';

const useStyles = makeStyles(({ spacing }) =>
  createStyles({
    root: {},
    description: {
      paddingTop: spacing(3),
    },
    title: {
      paddingBottom: 0,
    },
    divider: {},
    topPart: {
      padding: spacing(4, 5),
    },
    bottomPart: {
      padding: spacing(4, 5),
    },
  }),
);

export interface ConfirmModalProps {
  title?: ReactChild;
  description?: JSX.Element | string;
  confirmLabel?: JSX.Element;
  cancelLabel?: JSX.Element;
  onConfirm?(): void | Promise<void>;
  onCancel?(): void;
  classes?: {
    root?: string;
  };
  hideConfirm?: boolean;
}

export const ConfirmModal: FC<ConfirmModalProps> = ({
  description,
  title,
  onCancel = closeModal,
  onConfirm,
  confirmLabel = <Trans>Confirm</Trans>,
  cancelLabel = <Trans>Cancel</Trans>,
  classes: classesProp,
  hideConfirm,
}) => {
  const classes = useStyles({ classes: classesProp });

  return (
    <Box className={classes.root}>
      <Box className={classes.topPart}>
        <Typography className={classes.title} variant="h5">
          {title}
        </Typography>
        {description && <Box className={classes.description}>{description}</Box>}
      </Box>
      <Divider className={classes.divider} />
      <Box className={classes.bottomPart}>
        <Box display="flex" flexDirection="row" justifyContent="space-between">
          <Button onClick={onCancel} variant="outlined" color="primary">
            {cancelLabel}
          </Button>
          {!hideConfirm && (
            <Button onClick={onConfirm} variant="contained" color="primary">
              {confirmLabel}
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ConfirmModal;
