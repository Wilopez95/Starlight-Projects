import axios from 'axios';
import httpStatus from 'http-status';
import { pick } from 'lodash';

import logger from './logger';

import {
  CARDCONNECT_URL,
  CARDCONNECT_MID,
  CARDCONNECT_USERNAME,
  CARDCONNECT_PASSWORD,
} from '../config';

const cpGatewayApi = axios.create({
  baseURL: CARDCONNECT_URL,
  auth: {
    username: CARDCONNECT_USERNAME || '',
    password: CARDCONNECT_PASSWORD || '',
  },
});

const CCUnableToFetchError = (): Error => {
  return new Error('Unable to fetch');
};

const CardConnectError = (res: CCBasicResponse): Error => {
  logger.error(res);

  return new Error([res.respcode, res.resptext].join('. Text: '));
};

export class InvalidCvvError extends Error {}

const CvvValidationError = (): InvalidCvvError => {
  return new InvalidCvvError('CVV code is invalid');
};

export type CCProfile = {
  nameOnCard: string;
  cardNumber: string;
  expirationDate: string;
  cvv: string;

  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zip?: string;
};

export type CCProfileResponse = {
  profileid: string;
  acctid: string;
  token: string;
  accttype: string;
  expiry: string;
  name: string;
  address: string;
  address2: string;
  city: string;
  region: string;
  postal: string;
};

export type CCBasicResponse = {
  respstat: string;
  respcode: string;
  resptext: string;
  respproc: string;
  cvvresp: string;
};

export type CCResponse = CCBasicResponse & CCProfileResponse;

// validate CVV also
export const createProfile = async (
  data: Pick<CCProfile, 'cardNumber' | 'expirationDate' | 'cvv'>,
): Promise<CCResponse['profileid']> => {
  const payload = {
    merchid: CARDCONNECT_MID,
    amount: 0,
    profile: 'Y',

    account: data.cardNumber,
    expiry: data.expirationDate,
    cvv2: data.cvv,
  };

  const response = await cpGatewayApi.post<CCResponse>('/auth', payload);

  if (response.status !== httpStatus.OK || !response.data) {
    throw CCUnableToFetchError();
  }
  const result = response.data;

  if (result.respstat !== 'A') {
    throw CardConnectError(result);
  }

  if (result.cvvresp !== 'M') {
    throw CvvValidationError();
  }

  return response.data.profileid;
};

export const validateCvv = async (
  data: Pick<CCProfile, 'cardNumber' | 'expirationDate' | 'cvv'>,
): Promise<boolean> => {
  const payload = {
    merchid: CARDCONNECT_MID,
    amount: 0,
    profile: 'N',

    account: data.cardNumber,
    expiry: data.expirationDate,
    cvv2: data.cvv,
  };

  const response = await cpGatewayApi.post<CCResponse>('/auth', payload);

  if (response.status !== httpStatus.OK || !response.data) {
    throw CCUnableToFetchError();
  }
  const result = response.data;

  if (result.respstat !== 'A') {
    throw CardConnectError(result);
  }

  if (result.cvvresp !== 'M') {
    throw CvvValidationError();
  }

  return true;
};

export const deleteProfile = async (ccProfileId?: string): Promise<boolean> => {
  const url = `/profile/${ccProfileId}/$/${CARDCONNECT_MID}`;

  const response = await cpGatewayApi.delete<CCBasicResponse>(url);

  if (response.status !== httpStatus.OK && !response.data) {
    throw CCUnableToFetchError();
  }

  if (response.data.respstat !== 'A') {
    throw CardConnectError(response.data);
  }

  return true;
};

export const addAccountToProfile = async (
  ccProfileId: string,
  ccAccountId: number,
  data: CCProfile,
): Promise<Pick<CCResponse, 'accttype' | 'token'>> => {
  const payload = {
    merchid: CARDCONNECT_MID,

    profile: `${ccProfileId}/${ccAccountId}`,
    profileupdate: 'Y',

    name: data.nameOnCard,
    account: data.cardNumber,
    expiry: data.expirationDate,

    address: data.addressLine1,
    address2: data.addressLine2,
    city: data.city,
    region: data.state,
    postal: data.zip,
  };

  const response = await cpGatewayApi.put<CCResponse>('/profile', payload);

  if (response.status !== httpStatus.OK || !response.data) {
    throw CCUnableToFetchError();
  }

  if (response.data.respstat !== 'A') {
    throw CardConnectError(response.data);
  }

  return pick(response.data, ['accttype', 'token']);
};

export const updateAccountInProfile = async (
  ccProfileId: string,
  ccAccountId: number,
  data: CCProfile,
  token: string,
): Promise<boolean> => {
  const payload = {
    merchid: CARDCONNECT_MID,

    profile: `${ccProfileId}/${ccAccountId}`,
    profileupdate: 'Y',

    name: data.nameOnCard,
    account: token,
    expiry: data.expirationDate,

    address: data.addressLine1,
    address2: data.addressLine2,
    city: data.city,
    region: data.state,
    postal: data.zip,
  };

  const response = await cpGatewayApi.put<CCResponse>('/profile', payload);

  if (response.status !== httpStatus.OK || !response.data) {
    throw CCUnableToFetchError();
  }

  if (response.data.respstat !== 'A') {
    throw CardConnectError(response.data);
  }

  return true;
};

export const getProfileData = async (
  ccProfileId: string,
  ccAccountId: string | number = '',
): Promise<CCResponse[]> => {
  const url = `/profile/${ccProfileId}/${ccAccountId}/${CARDCONNECT_MID}`;

  const response = await cpGatewayApi.get<CCResponse[]>(url);

  if (response.status !== httpStatus.OK || !response.data) {
    throw CCUnableToFetchError();
  }

  return response.data;
};

export const removeAccountFromProfile = async (
  ccProfileId: string,
  ccAccountId: number,
): Promise<boolean> => {
  const url = `/profile/${ccProfileId}/${ccAccountId}/${CARDCONNECT_MID}`;

  const response = await cpGatewayApi.delete<CCBasicResponse>(url);

  if (response.status !== httpStatus.OK || !response.data) {
    throw CCUnableToFetchError();
  }

  if (response.data.respstat !== 'A') {
    throw CardConnectError(response.data);
  }

  return true;
};
