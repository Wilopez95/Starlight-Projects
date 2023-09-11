import jsonwebtoken from 'jsonwebtoken';
import { ACCESS_TOKEN_SECRET, ACCESS_TOKEN_EXPIRES_IN } from '../../../../config';

export interface RequestTokenPayload {
  id?: string;
  email?: string;
  name?: string;
  role: string;
  tenantId: string;
  subscriberName: string;
  subscriberLegalName?: string;
  company?: string;
  userId?: string;
  exp?: string;
}

export interface TokenPayload {
  tenantId: string;
  subscriberName: string;
}

export const generateRequestToken = (payload: RequestTokenPayload, expiresIn?: string): string =>
  jsonwebtoken.sign(
    {
      id: '-1',
      email: 'service-recycling',
      name: 'service-recycling',
      subscriberLegalName: '',
      company: '',
      userId: 'service-recycling',
      ...payload,
    },
    ACCESS_TOKEN_SECRET,
    Object.assign(payload.exp ? {} : { expiresIn: expiresIn || ACCESS_TOKEN_EXPIRES_IN }),
  );

export const USER_ROLE = {
  admin: 'admin', // super admin aka tenant's admin: performs among all tenants (db schemas)
  root: 'root', // default tenant admin, granted with full access to certain tenant. Not an operational person
  csr: 'csr', // represents all specific tenant' roles: admin, accounting, supervisor and CSR. Operational person
};

export const generateCsrToken = ({ tenantId, subscriberName }: TokenPayload): string => {
  return generateRequestToken({
    role: USER_ROLE.csr,
    tenantId,
    subscriberName,
  });
};

export const generateAdminToken = ({ tenantId, subscriberName }: TokenPayload): string => {
  return generateRequestToken({
    role: USER_ROLE.admin,
    tenantId,
    subscriberName,
  });
};

export const generateRootToken = ({ tenantId, subscriberName }: TokenPayload): string => {
  return generateRequestToken({
    role: USER_ROLE.admin,
    tenantId,
    subscriberName,
  });
};
