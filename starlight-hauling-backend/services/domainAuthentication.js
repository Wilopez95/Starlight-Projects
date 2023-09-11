import sgClient from '@sendgrid/client';

import ApiError from '../errors/ApiError.js';

import { SENDGRID_SMTP_API_KEY_ID } from '../config.js';

sgClient.setApiKey(SENDGRID_SMTP_API_KEY_ID);

export const authenticateDomain = async (ctx, { adminEmail, domain }) => {
  const data = {
    domain,
  };

  let domainId;
  try {
    const [, body] = await sgClient.request({
      url: '/v3/whitelabel/domains',
      method: 'POST',
      body: data,
    });

    domainId = body.id;
  } catch (error) {
    ctx.logger.error(error, `Failed to authorize domain ${domain}`);
    throw ApiError.unknown();
  }

  try {
    await sgClient.request({
      url: '/v3/whitelabel/dns/email',
      method: 'POST',
      body: {
        email: adminEmail,
        domain_id: domainId,
        message: `Your DNS records for domain ${domain}`,
      },
    });
  } catch (error) {
    // Ignore this error, because actually the authentication has been created.
    ctx.logger.error(error, `Failed to send DNS records for ${domain} to ${adminEmail}`);
  }

  return domainId;
};

export const validateAuthentication = async (ctx, { domainId }) => {
  try {
    const [, body] = await sgClient.request({
      url: `/v3/whitelabel/domains/${domainId}/validate`,
      method: 'POST',
      body: null,
    });

    return (
      body.validation_results !== undefined &&
      Object.values(body.validation_results).every(({ valid }) => valid)
    );
  } catch (error) {
    ctx.logger.error(error, `Error while validating domain ${domainId}`);
    throw ApiError.unknown();
  }
};

export const deleteDomainAuthentication = async (ctx, { domainId }) => {
  try {
    await sgClient.request({
      url: `/v3/whitelabel/domains/${domainId}`,
      method: 'DELETE',
    });
  } catch (error) {
    ctx.logger.error(error, `Error while deleting domain ${domainId}`);
    throw ApiError.unknown();
  }
};
