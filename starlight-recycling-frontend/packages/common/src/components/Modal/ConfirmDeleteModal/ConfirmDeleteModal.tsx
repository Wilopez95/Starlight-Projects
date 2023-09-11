import React, { FC } from 'react';
import { Trans } from '../../../i18n';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles(
  ({ spacing }) =>
    createStyles({
      description: {
        paddingTop: spacing(3),
      },
      divider: {},
      topPart: {
        padding: spacing(4, 5),
      },
      bottomPart: {
        padding: spacing(4, 5),
      },
    }),
  { name: 'ConfirmDeleteModal' },
);

export interface ConfirmDeleteModalProps {
  title?: JSX.Element;
  description?: JSX.Element;
  deleteLabel?: JSX.Element;
  cancelLabel?: JSX.Element;
  onDelete?(): void | Promise<void>;
  onCancel?(): void;
}

export const ConfirmDeleteModal: FC<ConfirmDeleteModalProps> = ({
  title,
  description,
  deleteLabel = <Trans>Delete</Trans>,
  cancelLabel = <Trans>Cancel</Trans>,
  onDelete,
  onCancel,
}) => {
  const classes = useStyles();

  return (
    <Box>
      <Box className={classes.topPart}>
        <Typography variant="h4" color="error">
          {title}
        </Typography>
        <Box className={classes.description}>{description}</Box>
      </Box>
      <Divider className={classes.divider} />
      <Box className={classes.bottomPart}>
        <Box display="flex" flexDirection="row" justifyContent="space-between">
          <Button onClick={onCancel} variant="outlined">
            {cancelLabel}
          </Button>
          <Button onClick={onDelete} variant="contained" color="secondary">
            {deleteLabel}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};
