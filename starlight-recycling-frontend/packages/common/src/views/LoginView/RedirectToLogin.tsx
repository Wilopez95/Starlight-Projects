import React, { useEffect } from 'react';
import getServiceInfo from '../../utils/getServiceInfo';
import { LOBBY_URL } from '../../constants';

interface RedirectToLoginProps {
  auto?: boolean;
}

const RedirectToLogin: React.FC<RedirectToLoginProps> = ({ auto = false }) => {
  useEffect(() => {
    const { host, protocol, href } = window.location;

    const serviceInfo = getServiceInfo();

    localStorage.setItem('redirectTo', href);

    let redirectTo = '';

    if (serviceInfo) {
      const { platformAccount, service, serviceAccount } = serviceInfo;

      redirectTo = `${protocol}//${host}/${platformAccount}/${service}/${serviceAccount}/login`;

      if (auto) {
        redirectTo += `?auto=true`;
      }
    } else {
      redirectTo = LOBBY_URL;
    }

    window.location.href = redirectTo;
  }, [auto]);

  return null;
};

export default RedirectToLogin;
