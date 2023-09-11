import { useEffect } from 'react';
import { useHistory } from 'react-router';

import { Routes } from '@root/consts';

export const SystemConfigurationLoginRedirect = () => {
  const history = useHistory();

  useEffect(() => {
    if (window.location.pathname.includes('login')) {
      return;
    }

    localStorage.setItem('redirectTo', window.location.href);

    history.push(`/${Routes.Configuration}/login`);
  }, [history]);

  return null;
};
