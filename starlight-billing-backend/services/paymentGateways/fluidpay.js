import assert from 'assert';
import httpStatus from 'http-status';
import axios from 'axios';
import * as dateFns from 'date-fns';
import isEmpty from 'lodash/isEmpty.js';
import sumBy from 'lodash/sumBy.js';
import { nanoid } from 'nanoid';

import { getCacheOf, CacheKey } from '../cache.js';
import { decryptMidPassword } from '../password.js';

import { mathRound2 } from '../../utils/math.js';

import { FLUIDPAY_URL } from '../../config.js';

import { API_KEY_NAME } from '../../consts/fluidpay.js';
import { RecordType, PaymentGateway as PaymentGatewayType } from '../../consts/paymentGateways.js';

import { PaymentGateway } from './paymentGateway.js';
import { FluidPayTransactionRejectionError, UnexpectedResponseError } from './errors.js';

const assertResponseSuccessful = response => {
  assert.ok(response.status === 'success', new FluidPayTransactionRejectionError());
};

const mapCardholder = cardholder => ({
  recordType: RecordType.CARDHOLDER,
  id: cardholder.id,
  nameOnCard: `${cardholder.first_name} ${cardholder.last_name || ''}`.trim(),
  addressLine1: cardholder.line_1,
  addressLine2: cardholder.line_2,
  city: cardholder.city,
  state: cardholder.state,
  zip: cardholder.postal_code,
});

const mapCreditCard = card => {
  const expDate = dateFns.parse(card.expiration_date, 'MM/yy', new Date());
  const expirationDate = dateFns.format(expDate, 'MMyy');
  return {
    recordType: RecordType.CARD,
    id: card.id,
    expirationDate,
    expDate,
    expiredLabel: dateFns.isPast(expDate),
  };
};

const mapSettlementTransactions = (transactions, date) => ({
  date: dateFns.format(date, 'yyyy-MM-dd'),
  paymentGateway: PaymentGatewayType.FLUIDPAY,
  fees: 0,
  adjustments: sumBy(transactions, transaction => Number(transaction.payment_adjustment)) / 100,
  amount: sumBy(transactions, transaction => Number(transaction.amount_settled)) / 100,
  count: transactions.length,
  settlementTransactions: transactions.map(transaction => ({
    amount: Number(transaction.amount_settled) / 100,
    fee: 0,
    adjustment: Number(transaction.payment_adjustment) / 100,
    ccRetref: transaction.id,
    transactionNote: transaction.description,
  })),
});

const cachedApiKeys = getCacheOf(CacheKey.FLUIDPAY);

export class FluidPay extends PaymentGateway {
  constructor(ctx, data) {
    super(ctx, data);

    this.api = axios.create({ baseURL: FLUIDPAY_URL, withCredentials: true });
  }

  // used to determine which customer's prop is gateway id
  get customerIdPropName() {
    return 'fluidPayId';
  }

  async getAuthHeaders(decryptedPassword) {
    try {
      const response = await this.api.post('/token-auth', {
        username: this.username,
        password: decryptedPassword,
      });

      if (response.data?.data?.token && response.headers?.['set-cookie']) {
        this.ctx.logger.info(`FluidPay->getAuthHeaders: token: received`);

        return {
          Cookie: response.headers['set-cookie'],
          Authorization: `Bearer ${response.data.data.token}`,
        };
      }
      this.ctx.logger.error(`FluidPay->getAuthHeaders: no token received`);

      throw new UnexpectedResponseError();
    } catch (error) {
      this.ctx.logger.error(error, 'Failed to obtain auth token');

      throw error;
    }
  }

  async getAvailableApiKeys(authHeaders) {
    try {
      const response = await this.api.get('/user/apikeys', {
        headers: authHeaders,
      });

      return response.data?.data ?? [];
    } catch (error) {
      this.ctx.logger.error(error, 'Failed to get api keys');

      throw error;
    }
  }

  async createApiKey(authHeaders) {
    try {
      const response = await this.api.post(
        '/user/apikey',
        {
          name: API_KEY_NAME,
          type: 'api',
        },
        {
          headers: authHeaders,
        },
      );

      if (response.data?.data?.api_key != null) {
        return response.data.data.api_key;
      }

      throw new UnexpectedResponseError();
    } catch (error) {
      this.ctx.logger.error(error, 'Failed to create api key');

      throw error;
    }
  }

  async getApiKey() {
    if (cachedApiKeys.has(this.mid)) {
      return cachedApiKeys.get(this.mid);
    } else {
      const decryptedPassword = await decryptMidPassword(this.password);

      const authHeaders = await this.getAuthHeaders(decryptedPassword);

      const apiKeys = await this.getAvailableApiKeys(authHeaders);

      const apiKey = apiKeys?.find(key => key.type === 'api');

      if (apiKey) {
        cachedApiKeys.set(this.mid, apiKey.api_key);

        return apiKey.api_key;
      } else {
        const newApiKey = await this.createApiKey(authHeaders);

        cachedApiKeys.set(this.mid, newApiKey);

        return newApiKey;
      }
    }
  }

  async makeAuthenticatedRequest(url, requestConfig) {
    const apiKey = await this.getApiKey();

    const headers = {
      Authorization: apiKey,
    };

    if (this.cookies) {
      headers.Cookie = this.cookies;
    }

    const response = await this.api({
      url,
      headers,
      ...requestConfig,
    });

    if (response.headers?.['set-cookie']) {
      this.cookies = response.headers?.['set-cookie'];
    }

    return response.data;
  }

  async createCustomerRecord() {
    try {
      const responseData = await this.makeAuthenticatedRequest('/vault/customer', {
        method: 'POST',
        data: {},
      });

      if (responseData?.data?.id) {
        return responseData.data.id;
      }

      throw new UnexpectedResponseError();
    } catch (error) {
      this.ctx.logger.error(error, 'Failed to create customer record');

      throw error;
    }
  }

  async removeCustomerRecord(customerGatewayId) {
    try {
      const responseData = await this.makeAuthenticatedRequest(`/vault/${customerGatewayId}`, {
        method: 'DELETE',
      });

      assertResponseSuccessful(responseData);

      return true;
    } catch (error) {
      this.ctx.logger.error(error, 'Failed to delete customer record');
      // expirysate
      throw error;
    }
  }

  async getCustomerCreditCards({ customerGatewayId, ccAccountId, cardholderId }) {
    try {
      const responseData = await this.makeAuthenticatedRequest(`/vault/${customerGatewayId}`, {
        method: 'GET',
      });

      const creditCards = responseData?.data?.data?.customer?.payments?.cards ?? [];
      const addresses = responseData?.data?.data?.customer?.addresses ?? [];

      if (ccAccountId && cardholderId) {
        const creditCard = creditCards.find(({ id }) => id === ccAccountId);
        const cardholder = addresses.find(({ id }) => id === cardholderId);

        const mappedCc = creditCard ? mapCreditCard(creditCard) : {};
        const mappedCardholder = cardholder ? mapCardholder(cardholder) : {};

        const result = { ...mappedCc, ...mappedCardholder };

        return isEmpty(result) ? null : result;
      }

      // cc info in fluidpay is stored in two types of records (cc itself & address record)
      return creditCards.map(mapCreditCard).concat(addresses.map(mapCardholder));
    } catch (error) {
      this.ctx.logger.error(error, 'Failed to get customer credit cards');

      throw error;
    }
  }

  async addCreditCardPaymentMethod({ customerGatewayId, ccData }) {
    try {
      const responseData = await this.makeAuthenticatedRequest(
        `/vault/customer/${customerGatewayId}/card`,
        {
          method: 'POST',
          data: {
            number: ccData.cardNumber,
            expiration_date: ccData.expirationDate,
          },
        },
      );

      const cards = responseData?.data?.data?.customer?.payments?.cards;

      if (Array.isArray(cards) && cards?.[cards.length - 1]?.id) {
        return {
          ccAccountId: cards[cards.length - 1].id,
          cardType: this.getCardType(ccData.cardNumber),
        };
      }

      throw new UnexpectedResponseError();
    } catch (error) {
      this.ctx.logger.error(error, 'Failed to add credit card payment method');

      throw error;
    }
  }

  async addCardholder({ customerGatewayId, ccData }) {
    const [firstName, ...lastName] = ccData.nameOnCard.trim().split(' ');

    try {
      const responseData = await this.makeAuthenticatedRequest(
        `/vault/customer/${customerGatewayId}/address`,
        {
          method: 'POST',
          data: {
            first_name: firstName,
            last_name: lastName.join(' '),
            line_1: ccData.addressLine1,
            line_2: ccData.addressLine2,
            city: ccData.city,
            state: ccData.state,
            postal_code: ccData.zip,
            // throws otherwise
            country: 'US',
            fax: nanoid(),
          },
        },
      );

      const addresses = responseData?.data?.data?.customer?.addresses;

      if (Array.isArray(addresses) && addresses?.[addresses.length - 1]?.id) {
        return {
          cardholderId: addresses[addresses.length - 1].id,
        };
      }

      throw new UnexpectedResponseError();
    } catch (error) {
      this.ctx.logger.error(error, 'Failed to add cardholder');

      throw error;
    }
  }

  async addCreditCard({ customerGatewayId, ccData }) {
    try {
      // avoid any race conditions
      const cardholder = await this.addCardholder({ customerGatewayId, ccData });
      const cc = await this.addCreditCardPaymentMethod({ customerGatewayId, ccData });

      return {
        ...cc,
        ...cardholder,
      };
    } catch (error) {
      this.ctx.logger.error(error, 'Failed to add credit card');

      throw error;
    }
  }

  async updateCardholder({ customerGatewayId, cardholderId, ccData }) {
    try {
      const responseData = await this.makeAuthenticatedRequest(
        `/vault/customer/${customerGatewayId}/address/${cardholderId}`,
        {
          method: 'POST',
          data: {
            first_name: ccData.nameOnCard,
            line_1: ccData.addressLine1,
            line_2: ccData.addressLine2,
            city: ccData.city,
            state: ccData.state,
            postal_code: ccData.zip,
            country: 'US',
          },
        },
      );

      assertResponseSuccessful(responseData);

      return true;
    } catch (error) {
      this.ctx.logger.error(error, 'Failed to update cardholder');

      throw error;
    }
  }

  async updateCreditCard({ customerGatewayId, cardholderId, ccData }) {
    try {
      await this.updateCardholder({ customerGatewayId, cardholderId, ccData });

      return true;
    } catch (error) {
      this.ctx.logger.error(error, 'Failed to update credit card');

      throw error;
    }
  }

  async removeCardholder({ customerGatewayId, cardholderId }) {
    try {
      const responseData = await this.makeAuthenticatedRequest(
        `/vault/customer/${customerGatewayId}/address/${cardholderId}`,
        {
          method: 'DELETE',
        },
      );

      assertResponseSuccessful(responseData);

      return true;
    } catch (error) {
      this.ctx.logger.error(error, 'Failed to remove cardholder');

      throw error;
    }
  }

  async removeCreditCardPaymentMethod({ customerGatewayId, ccAccountId }) {
    try {
      const responseData = await this.makeAuthenticatedRequest(
        `/vault/customer/${customerGatewayId}/card/${ccAccountId}`,
        {
          method: 'DELETE',
        },
      );

      assertResponseSuccessful(responseData);

      return true;
    } catch (error) {
      this.ctx.logger.error(error, 'Failed to remove credit card payment method');

      throw error;
    }
  }

  async removeCreditCard({ customerGatewayId, ccAccountId, cardholderId }) {
    try {
      await Promise.all([
        this.removeCardholder({ customerGatewayId, cardholderId }),
        this.removeCreditCardPaymentMethod({ customerGatewayId, ccAccountId }),
      ]);
    } catch (error) {
      this.ctx.logger.error(error, 'Failed to remove credit card');

      throw error;
    }
  }

  async validateCreditCard(data) {
    // Code removed in context of PRODSUP-203. Please use the git log in case of restore this part of functionality.
    data;
    return true;
  }

  async authorizeAmount({ customerGatewayId, ccAccountId, cardholderId, amount }) {
    const authorizedAmount = mathRound2(amount);

    try {
      const responseData = await this.makeAuthenticatedRequest('/transaction', {
        method: 'POST',
        data: {
          type: 'authorize',
          amount: Math.floor(authorizedAmount * 100),
          payment_method: {
            customer: {
              id: customerGatewayId,
              payment_method_id: ccAccountId,
              payment_method_type: 'card',
              billing_address_id: cardholderId,
            },
          },
        },
      });

      assertResponseSuccessful(responseData);

      if (responseData?.data?.id) {
        return {
          amount: authorizedAmount,
          ccRetref: responseData.data.id,
        };
      }

      throw new UnexpectedResponseError();
    } catch (error) {
      this.ctx.logger.error(error, 'Failed to authorize amount');

      if (error.response?.status === httpStatus.BAD_REQUEST) {
        throw new FluidPayTransactionRejectionError();
      }

      throw error;
    }
  }

  async payoutAmount({ customerGatewayId, ccAccountId, cardholderId, amount }) {
    const payoutedAmount = mathRound2(amount);

    try {
      const responseData = await this.makeAuthenticatedRequest('/transaction', {
        method: 'POST',
        data: {
          type: 'credit',
          amount: Math.floor(payoutedAmount * 100),
          payment_method: {
            customer: {
              id: customerGatewayId,
              payment_method_id: ccAccountId,
              payment_method_type: 'card',
              billing_address_id: cardholderId,
            },
          },
        },
      });

      assertResponseSuccessful(responseData);

      if (responseData?.data?.id) {
        return {
          ccRetref: responseData.data.id,
        };
      }

      throw new UnexpectedResponseError();
    } catch (error) {
      this.ctx.logger.error(error, 'Failed to payout amount');

      throw error;
    }
  }

  async captureAuthorizedAmount({ ccRetref, amount }) {
    const capturedAmount = mathRound2(amount);

    try {
      const responseData = await this.makeAuthenticatedRequest(`/transaction/${ccRetref}/capture`, {
        method: 'POST',
        data: {
          amount: Math.floor(capturedAmount * 100),
        },
      });

      assertResponseSuccessful(responseData);

      return {
        amount: capturedAmount,
        ccRetref,
      };
    } catch (error) {
      this.ctx.logger.error(error, 'Failed to capture authorized amount');

      throw error;
    }
  }

  async authorizeAndCaptureAmount({ customerGatewayId, ccAccountId, cardholderId, amount }) {
    try {
      const { amount: authorizedAmount, ccRetref: ccAuthorizationRetref } =
        await this.authorizeAmount({
          customerGatewayId,
          ccAccountId,
          cardholderId,
          amount,
        });

      try {
        const { amount: capturedAmount, ccRetref: ccInitialRetref } =
          await this.captureAuthorizedAmount({
            ccRetref: ccAuthorizationRetref,
            amount: authorizedAmount,
          });

        return { amount: capturedAmount, ccRetref: ccInitialRetref };
      } catch (error) {
        await this.voidAmount({ ccRetref: ccAuthorizationRetref });
      }
    } catch (error) {
      this.ctx.logger.error(error, 'Failed to authorize & capture amount');

      throw error;
    }
    return true;
  }

  async voidAmount({ ccRetref }) {
    try {
      const responseData = await this.makeAuthenticatedRequest(`/transaction/${ccRetref}/void`, {
        method: 'POST',
        data: {},
      });

      assertResponseSuccessful(responseData);

      return {
        ccRetref,
      };
    } catch (error) {
      this.ctx.logger.error(error, 'Failed to void amount');

      throw error;
    }
  }

  async partialRefund({ ccRetref, amount }) {
    const refundedAmount = mathRound2(amount);
    try {
      const responseData = await this.makeAuthenticatedRequest(`/transaction/${ccRetref}/refund`, {
        method: 'POST',
        data: {
          amount: Math.floor(refundedAmount * 100),
        },
      });

      assertResponseSuccessful(responseData);

      return {
        ccRetref,
        amount: refundedAmount,
      };
    } catch (error) {
      this.ctx.logger.error(error, 'Failed to refund amount');

      throw error;
    }
  }

  async searchTransactions({ date, totalCount, limit = 1000, offset = 0 }) {
    try {
      const responseData = await this.makeAuthenticatedRequest('/transaction/search', {
        method: 'POST',
        data: {
          settled_at: {
            start_date: dateFns.format(
              dateFns.startOfDay(dateFns.addDays(date, 1)),
              "yyyy-MM-dd'T'HH:mm:ss'Z'",
            ),
            end_date: dateFns.format(
              dateFns.endOfDay(dateFns.addDays(date, 1)),
              "yyyy-MM-dd'T'HH:mm:ss'Z'",
            ),
          },
          created_at: {
            start_date: dateFns.format(dateFns.startOfDay(date), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
            end_date: dateFns.format(dateFns.endOfDay(date), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
          },
          user_id: { value: this.mid, operator: '=' },
          limit,
          offset,
        },
      });

      assertResponseSuccessful(responseData);

      if (responseData?.total_count === 0 && responseData?.data == null) {
        return [];
      }

      if (Array.isArray(responseData?.data) && responseData?.total_count != null) {
        if (!totalCount) {
          totalCount = responseData?.total_count;
        }

        const transactionsCount = responseData.data.length;

        if (offset + transactionsCount < totalCount) {
          return responseData.data.concat(
            await this.searchTransactions({
              date,
              totalCount,
              limit,
              offset: offset + transactionsCount,
            }),
          );
        } else {
          return responseData.data;
        }
      }

      throw new UnexpectedResponseError();
    } catch (error) {
      this.ctx.logger.error(error, 'Failed to get transactions');

      throw error;
    }
  }

  async requestSettlement({ date }) {
    const transactions = await this.searchTransactions({ date });

    const settlement = mapSettlementTransactions(transactions, date);

    return settlement;
  }

  async validateCredentials(raw = false) {
    try {
      let password = this.password;

      if (!raw) {
        password = await decryptMidPassword(this.password);
      }

      const authHeaders = await this.getAuthHeaders(password);

      // in fluidpay mid = user_id, so we should validate if validated creds belong to mid
      // throws when no permission to view other users
      const response = await this.api.get(`/user/${this.mid}`, {
        headers: authHeaders,
      });

      assertResponseSuccessful(response.data);

      return response.data.data.id === this.mid;
    } catch (error) {
      this.ctx.logger.error('Failed to validate credentials');

      throw error;
    }
  }
}
