import React, { FC } from 'react';
import { Trans } from '../../../i18n';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';

import RouterLink from '../../../components/RouterLink';

interface IResetSuccessProps {
  backToLogin?: () => void;
}

const useStyles = makeStyles((theme) => ({
  resetSuccessHeading: {
    fontWeight: 'bold',
    marginBottom: theme.spacing(2),
  },
}));

const ResetSuccess: FC<IResetSuccessProps> = () => {
  const classes = useStyles();

  return (
    <>
      <Box mb={12.5}>
        <Typography className={classes.resetSuccessHeading}>
          <Trans>Your password has been reset successfully!</Trans>
        </Typography>
        <Typography>
          <Trans>Further instructions have been emailed to you.</Trans>
        </Typography>
      </Box>
      <RouterLink to="/login">
        <Trans>&#8592; Back to Log In</Trans>
      </RouterLink>
    </>
  );
};

export default ResetSuccess;
