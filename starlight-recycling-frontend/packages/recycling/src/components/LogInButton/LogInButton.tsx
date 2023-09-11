import React, { FC } from 'react';
import { Trans } from '../../i18n';
import Button from '@material-ui/core/Button';

export const LogInButton: FC = () => {
  return (
    <Button>
      <Trans>Log In</Trans>
    </Button>
  );
};

export default LogInButton;
