import getServiceInfo from './getServiceInfo';

export default function getServiceAccountId() {
  const serviceInfo = getServiceInfo();

  return `srn:${serviceInfo?.platformAccount}:${serviceInfo?.service}:${serviceInfo?.serviceAccount}`;
}
