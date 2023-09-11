export const getHaulingRedirectUrl = (currHost: string): ((relativeUrl: string) => string) => {
  const starlightDomain = 'starlightsoftware.io';
  const starlightDomain2 = 'starlightpro.net';
  const defaultDomainDev = `hauling.dev.${starlightDomain2}`;
  const protocol = 'https';

  function getHostname(currentHostName: string): string {
    if (currentHostName.includes(starlightDomain)) {
      const splittedHostName = currentHostName.split('.');

      splittedHostName[0] = 'hauling';

      return splittedHostName.join('.');
    } else if (currentHostName.includes(starlightDomain2)) {
      const splittedHostName2 = currentHostName.split('.');

      splittedHostName2[0] = 'hauling';

      return splittedHostName2.join('.');
    } else {
      return defaultDomainDev;
    }
  }

  const hostname = getHostname(currHost);

  return relativeUrl => `${protocol}://${hostname}${relativeUrl}`;
};
