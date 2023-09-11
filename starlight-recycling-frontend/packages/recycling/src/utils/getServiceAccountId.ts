import { getServiceInfo } from '@starlightpro/common';

export default function getServiceAccountId() {
  const serviceInfo = getServiceInfo();

  return `srn:${serviceInfo?.platformAccount}:recycling:${serviceInfo?.serviceAccount}`;
}
