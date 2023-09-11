import { createToken } from '../../../utils/serviceToken';

export default async function (reqId: string, schemaName: string): Promise<string> {
  const token = await createToken(
    {
      schemaName,
    },
    {
      audience: 'core',
      requestId: reqId,
    },
  );

  return `ServiceToken ${token}`;
}
