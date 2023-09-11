import httpStatus from 'http-status';

import ContractorRepo from '../../../../repos/contractor.js';

import {
  compareHashes,
  generateAccessToken,
  getRandomPassword,
  hashPassword,
} from '../../../../services/tokens.js';
import { sendContractorPassword } from '../../../../services/email.js';

import ApiError from '../../../../errors/ApiError.js';

export const login = async ctx => {
  const { email, password } = ctx.request.body;

  const user = await ContractorRepo.getUserByEmail(email);

  if (!user || !user.password) {
    throw ApiError.notAuthenticated();
  }

  const equals = await compareHashes(password, user.password);
  if (!equals) {
    throw ApiError.notAuthenticated();
  }

  const { tenantId, name: schemaName } = user;

  const contractorRepo = ContractorRepo.getInstance(ctx.state, { schemaName });

  const {
    customerId,
    contactId,
    id: userId,
    contact: { firstName, lastName },
  } = await contractorRepo.getByWithContact({
    condition: { email },
    fields: ['customerId', 'contactId', 'id'],
  });

  if (!customerId || !contactId) {
    throw ApiError.notAuthenticated();
  }

  const { lastLoginAt } = await ContractorRepo.updateBy({
    condition: { email },
    data: { lastLoginAt: new Date() },
    fields: ['lastLoginAt'],
  });

  const { id } = user;
  const data = {
    tenantId,
    subscriberName: schemaName,
    schemaName,
    email,
    customerId,
    contactId,
    id,
    userId,
    // TODO: get rid of this because role field is obsolete
    role: 'root',
  };

  const tokenExpiration = '1d';
  const token = generateAccessToken(data, tokenExpiration);

  ctx.status = httpStatus.OK;
  ctx.body = {
    token,
    tokenExpiration,
    user: {
      id,
      // userId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLogin: lastLoginAt,

      // temp for compatibility
      username: `${firstName}_${lastName}_${id}`,
    },
    meta: {
      // apiMode: 'string',
      tenantId: user.tenantId,
      // apiBaseUrl: 'string',
      customerId,
      contactId,
    },
  };
};

export const forgotPassword = async ctx => {
  const { email } = ctx.request.body;

  const user = await ContractorRepo.getUserByEmail(email);

  if (!user) {
    throw ApiError.notFound();
  }

  const newUserPassword = getRandomPassword(15);
  const hashedPassword = await hashPassword(newUserPassword);

  await ContractorRepo.updateBy({
    condition: { email },
    data: { password: hashedPassword },
    fields: [],
  });

  await sendContractorPassword(email, newUserPassword);

  ctx.status = httpStatus.OK;
  ctx.body = { message: 'check your email' };
};
