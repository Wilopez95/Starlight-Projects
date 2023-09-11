import React from 'react';
import { Trans, useTranslation } from '../../i18n';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import StarlightLogo from '../LoginView/LoginLayout/StarlightLogo';

export const PoweredBy = () => {
  const [t] = useTranslation();

  return (
    <>
      <Typography variant="caption">
        <Trans>Powered by</Trans>
      </Typography>

      <Link title={t('Starlight Solutions')} href="https://starlightsoftwaresolutions.com/">
        <StarlightLogo />
      </Link>
    </>
  );
};
