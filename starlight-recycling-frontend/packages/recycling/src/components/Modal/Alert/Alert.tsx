import React, { FC } from 'react';
import { Trans } from '../../../i18n';

import { createStyles, makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { closeModal } from '../../Modals';
import Divider from '@material-ui/core/Divider';

const useStyles = makeStyles(
  ({ spacing }) =>
    createStyles({
      root: {
        display: 'flex',
        flexDirection: 'column',
      },
      header: {
        padding: spacing(3),
      },
      title: {},
      content: {
        flex: '1',
        padding: spacing(3),
      },
      description: {},
      footer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing(3),
      },
      okButton: {},
    }),
  { name: 'Alert' },
);

export interface AlertProps {
  title?: JSX.Element;
  description: JSX.Element | string;
  onOkClick?(): void;
  classes?: {
    root?: string;
    header?: string;
    title?: string;
    content?: string;
    description?: string;
    footer?: string;
    okButton?: string;
  };
}

export const Alert: FC<AlertProps> = ({
  title = <Trans>Alert</Trans>,
  description,
  classes: classesProps,
  onOkClick = closeModal,
}) => {
  const classes = useStyles({ classes: classesProps });

  return (
    <Box className={classes.root}>
      <Box className={classes.header}>
        <Typography variant="h5" className={classes.title}>
          {title}
        </Typography>
      </Box>
      <Box className={classes.content}>
        <Typography variant="body2" className={classes.description}>
          {description}
        </Typography>
      </Box>
      <Divider />
      <Box className={classes.footer}>
        <Button
          variant="contained"
          color="primary"
          className={classes.okButton}
          onClick={onOkClick}
        >
          <Trans>Ok</Trans>
        </Button>
      </Box>
    </Box>
  );
};

export default Alert;
