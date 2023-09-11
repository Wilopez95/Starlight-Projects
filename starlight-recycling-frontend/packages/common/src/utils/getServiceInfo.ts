import { PATHNAME_REGEX } from '../constants/regex';

export default function getServiceInfo() {
  const { pathname } = window.location;

  const match = pathname.match(PATHNAME_REGEX);

  if (!match) {
    return null;
  }

  const [, platformAccount, service, serviceAccount] = match;

  return {
    platformAccount,
    service,
    serviceAccount,
  };
}
