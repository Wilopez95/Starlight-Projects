import React, { FC } from 'react';

import { Trans } from '../../i18n';
import { getServiceInfo } from '@starlightpro/common';
import { HAULING_FE_HOST } from '@starlightpro/common/constants';
import { makeStyles, Theme } from '@material-ui/core/styles';
import AccountsIcon from './AccountsIcon';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles(
  (theme: Theme) => ({
    root: {
      fontSize: theme.typography.body1.fontSize,
      backgroundColor: theme.palette.grey[800],
      color: theme.palette.common.white,

      '&:hover': {
        backgroundColor: theme.palette.grey[900],
      },
    },
    iconSizeMedium: {
      '& > *:first-child': {
        fontSize: 14,
      },
    },
  }),
  { name: 'AccountsButton' },
);

export interface AccountsButtonProps {
  className?: string;
}

export const AccountsButton: FC<AccountsButtonProps> = ({ className }) => {
  const serviceInfo = getServiceInfo();

  const classes = useStyles({ classes: { root: className } });

  return (
    <Button
      classes={classes}
      variant="contained"
      fullWidth
      startIcon={<AccountsIcon viewBox="0 0 16 14" />}
      href={`https://${HAULING_FE_HOST}/${serviceInfo!.platformAccount}/business-units/${
        serviceInfo!.serviceAccount
      }/login?auto=true`}
    >
      <Trans>Accounts</Trans>
    </Button>
  );
};

export default AccountsButton;
