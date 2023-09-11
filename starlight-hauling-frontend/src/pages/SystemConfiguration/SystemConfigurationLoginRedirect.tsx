import { useEffect } from 'react';
import { useHistory } from 'react-router';
import * as Sentry from '@sentry/react';

import { Routes } from '@root/consts';
import { useUserContext } from '@root/hooks';

export const SystemConfigurationLoginRedirect = () => {
  const history = useHistory();
  const { currentUser } = useUserContext();
  const tenantName = currentUser?.tenantName;

  Sentry.captureMessage(
    `REDIRECTS: rendering system configuration. Tenant name: ${tenantName ?? ''}`,
  );

  useEffect(() => {
    if (!tenantName) {
      history.push(`/${Routes.Lobby}`);

      return;
    }

    if (window.location.pathname.includes('login')) {
      return;
    }

    localStorage.setItem('redirectTo', window.location.href);

    history.push(`/${tenantName}/${Routes.Configuration}/login`);
  }, [history, tenantName]);

  return null;
};
