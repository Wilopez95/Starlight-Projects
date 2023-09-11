import httpStatus from 'http-status';
import ecdsa from 'starkbank-ecdsa';

import { SENDGRID_WEBHOOK_PUBLIC_KEY } from '../config.js';

const { PublicKey, Signature, Ecdsa } = ecdsa;

const key = PublicKey.fromPem(SENDGRID_WEBHOOK_PUBLIC_KEY);

const verify = (payload, signature, timestamp) => {
  const timestampPayload = timestamp + payload;
  const decodedSignature = Signature.fromBase64(signature);

  return Ecdsa.verify(timestampPayload, decodedSignature, key);
};

export const verifySendGridSignature = async (ctx, next) => {
  const payload = ctx.request.rawBody.toString();
  const signature = ctx.request.headers['x-twilio-email-event-webhook-signature'];
  const timestamp = ctx.request.headers['x-twilio-email-event-webhook-timestamp'];

  if (!signature || !timestamp || !payload) {
    ctx.logger.info(
      `A request from SendGrid missing some params: payload ${payload}, timestamp ${timestamp}, signature ${signature}`,
    );
  }
  const isValid = verify(payload, signature, timestamp);

  if (isValid) {
    ctx.logger.info('Validated signature from SendGrid');
    await next();
  } else {
    ctx.logger.info('Got invalid signature from SendGrid. Ignoring message');
    ctx.status = httpStatus.NO_CONTENT;
  }
};
