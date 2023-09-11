import { createHmac, KeyObject, timingSafeEqual } from 'crypto';
import { V2 } from 'paseto';

import { deriveKey } from './hkdf';

interface UserInfo {
  id: string;
  name: string;
  email: string;
  resource: string;
  permissions: string[];
  tenantId?: string;
  tenantName?: string;
}

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type Headers = Record<string, string>;
type Query = Record<string, string | string[] | number | number[]>;

interface SignerParams {
  url: string;
  method: Method;
  headers: Headers;
  body?: unknown;
  query?: Query;
  userInfo?: UserInfo;
}

interface VerifierParams {
  path: string;
  method: Method;
  headers: Headers;
  body?: unknown;
  query?: Query;
}

interface CreateSignerOrVerifierParams {
  secret: string;
  serviceName: string;
}

interface Signer {
  (params: SignerParams): Promise<string>;
}

interface Verifier {
  (params: VerifierParams): Promise<undefined | UserInfo>;
}

const ALG_VERSION = 'Starlight-Paseto-V1';
const HEADER_REGEXP = /[-a-z0-9]/;

const AUTHORIZATION_REGEXP = new RegExp(
  `^${ALG_VERSION} (SignedHeaders=(?<headers>[${HEADER_REGEXP.toString()};]*), )?(?<signature>.*)$`,
);

const REQUEST_ID_HEADER = 'x-request-id';
const DEFAULT_EXPIRATION = '20m';

interface ServiceSignaturePayload {
  'r:hash': string;
}

interface UserSignaturePayload extends ServiceSignaturePayload {
  'u:tenantId': string;
  'u:tenantName': string;
  'u:name': string;
  'u:email': string;
  'u:resource': string;
  'u:permissions': string[];
}

type SignaturePayload = ServiceSignaturePayload | UserSignaturePayload;

type Decrypted = SignaturePayload & {
  sub: string;
  aud: string;
};

class SignerError extends Error {}

class InvalidInputParametersError extends SignerError {
  name = 'InvalidInputParameters';
}

class VerifierError extends Error {}

class InvalidSignatureError extends VerifierError {
  name = 'InvalidSignature';
}

const isUserSignature = (
  decryptedToken: SignaturePayload,
): decryptedToken is UserSignaturePayload => {
  return Boolean((decryptedToken as UserSignaturePayload)['u:email']);
};

const extractSignature = (headers: Headers) => {
  const authorization = headers.authorization;

  if (!authorization) {
    return undefined;
  }

  const parsed = AUTHORIZATION_REGEXP.exec(authorization);

  if (!parsed?.groups) {
    return undefined;
  }

  const { headers: signedHeaders, signature } = parsed.groups;

  return { signedHeaders: signedHeaders.split(';'), signature };
};

const hashRequestData = (
  key: KeyObject,
  method: Method,
  path: string,
  query?: Query,
  headers: Headers = {},
  body: unknown = {},
) => {
  const hashElements = [method, path];

  if (query) {
    const searchParams = new URLSearchParams();

    Object.entries(query).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((item: number | string) => {
          searchParams.append(key, String(item));
        });
      } else {
        searchParams.append(key, String(value));
      }
    });

    hashElements.push(searchParams.toString());
  }

  const signedHeaders: string[] = [];

  Object.entries(headers).forEach(([key, value]) => {
    const normalizedKey = key.toLowerCase();

    if (key === REQUEST_ID_HEADER) {
      return;
    }

    if (!HEADER_REGEXP.test(normalizedKey)) {
      throw new InvalidInputParametersError(`Invalid header format: ${key}`);
    }

    signedHeaders.push(key);
    hashElements.push(`${normalizedKey}=${value}`);
  });

  // Ignore undefined values but stringify null, numbers etc. and add strings as is.
  if (typeof body !== 'undefined') {
    hashElements.push(typeof body !== 'object' ? String(body) : JSON.stringify(body));
  }

  const digest = createHmac('sha256', key).update(hashElements.join('\n')).digest('base64');

  return { digest, signedHeaders: signedHeaders.join(';') };
};

export const createSigner = ({ secret, serviceName }: CreateSignerOrVerifierParams): Signer => {
  const signRequest = async ({ method, body, query, headers, url, userInfo }: SignerParams) => {
    if (!headers[REQUEST_ID_HEADER]) {
      throw new InvalidInputParametersError(
        'Request ID header is required to produce a valid request signature',
      );
    }

    const key = deriveKey('sha256', secret, 32, headers[REQUEST_ID_HEADER], ALG_VERSION);

    const parsedUrl = new URL(url);

    const { digest, signedHeaders } = hashRequestData(
      key,
      method,
      parsedUrl.pathname,
      query,
      headers,
      body,
    );

    const signaturePayload: SignaturePayload = {
      'r:hash': digest,
      'u:name': userInfo?.name,
      'u:email': userInfo?.email,
      'u:resource': userInfo?.resource,
      'u:permissions': userInfo?.permissions,
      'u:tenantId': userInfo?.tenantId,
      'u:tenantName': userInfo?.tenantName,
    };

    const signature = await V2.encrypt(signaturePayload, key, {
      subject: userInfo?.id ?? serviceName,
      kid: headers['x-request-id'],
      audience: parsedUrl.origin,
      issuer: serviceName,
      expiresIn: DEFAULT_EXPIRATION,
    });

    return `${ALG_VERSION} SignedHeaders=${signedHeaders}, ${signature}`;
  };

  return signRequest;
};

export const createVerifier = ({ secret, serviceName }: CreateSignerOrVerifierParams): Verifier => {
  const verifyRequest = async ({ method, body, query, headers, path }: VerifierParams) => {
    if (!headers[REQUEST_ID_HEADER]) {
      throw new InvalidSignatureError('Request ID header is required to verify request signature');
    }

    const key = deriveKey('sha256', secret, 32, headers[REQUEST_ID_HEADER], ALG_VERSION);
    const signed = extractSignature(headers);

    if (!signed) {
      throw new InvalidSignatureError('Missing signature');
    }

    const { signature, signedHeaders } = signed;

    let decrypted: Decrypted;

    try {
      decrypted = (await V2.decrypt(signature, key, { audience: serviceName })) as Decrypted;
    } catch {
      throw new InvalidSignatureError('Signature is invalid');
    }

    const filteredHeaders = Object.fromEntries(
      signedHeaders.map(header => [header, headers[header]]),
    );

    const hashedRequest = hashRequestData(key, method, path, query, filteredHeaders, body);

    if (
      !timingSafeEqual(
        Buffer.from(hashedRequest.digest, 'base64'),
        Buffer.from(decrypted['r:hash'], 'base64'),
      )
    ) {
      throw new InvalidSignatureError('Signature is invalid');
    }

    if (isUserSignature(decrypted)) {
      return {
        id: decrypted.sub,
        email: decrypted['u:email'],
        name: decrypted['u:email'],
        resource: decrypted['u:resource'],
        permissions: decrypted['u:permissions'],
        tenantId: decrypted['u:tenantId'],
        tenantName: decrypted['u:tenantName'],
      };
    }

    return undefined;
  };

  return verifyRequest;
};
