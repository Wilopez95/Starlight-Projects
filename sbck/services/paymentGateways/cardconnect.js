import assert from 'assert';
import axios from 'axios';
import * as dateFns from 'date-fns';
import sumBy from 'lodash/sumBy.js';

import { decryptMidPassword } from '../password.js';

import { mathRound2 } from '../../utils/math.js';

import { CARDCONNECT_URL } from '../../config.js';

import {
  AVS_FAILURE,
  APPROVAL_STAT,
  CVV_SUCCESS,
  NOT_SETTLED_CODE,
} from '../../consts/cardconnect.js';
import { RecordType, PaymentGateway as PaymentGatewayType } from '../../consts/paymentGateways.js';

import { PaymentGateway } from './paymentGateway.js';
import {
  CardConnectTransactionRejectionError,
  CvvValidationError,
  AvsValidationError,
  UnexpectedResponseError,
  TransactionNotSettledError,
} from './errors.js';

const assertResponseSuccessful = response => {
  assert.ok(
    response?.respstat === APPROVAL_STAT,
    new CardConnectTransactionRejectionError(response),
  );
};

const assertTransactionResultValid = response => {
  assert.ok(response.cvvresp === CVV_SUCCESS, new CvvValidationError(response.cvvresp));
  assert.ok(response.avs_response_code !== AVS_FAILURE, new AvsValidationError(response.avsresp));
};

const mapCreditCard = card => {
  const expDate = dateFns.parse(card.expiry, 'MMyy', new Date()) || null; //TODO figure out a way to grab exp date from response
  return {
    recordType: RecordType.CARD,
    id: card.acctid,
    expirationDate: card.expiry,
    expDate,
    expiredLabel: dateFns.isPast(expDate),
    nameOnCard: card.name,
    addressLine1: card.address,
    addressLine2: card.address2,
    city: card.city,
    state: card.region,
    zip: card.postal,
  };
};

const mapSettlement = settlementData => ({
  date: settlementData.fundingdate,
  paymentGateway: PaymentGatewayType.CARDCONNECT,
  fees: sumBy(settlementData.txns, txn => Number(txn.interchangeunitfee)),
  adjustments: sumBy(settlementData.adjustments, adjustment => Number(adjustment.amount)),
  amount: sumBy(settlementData.txns, transaction => Number(transaction.amount)),
  count: settlementData.txns.length,
  settlementTransactions: settlementData.txns.map(txn => ({
    amount: Number(txn.amount),
    fee: Number(txn.interchangeunitfee),
    adjustment: 0,
    ccRetref: txn.retref,
    transactionNote: txn.userfield0,
  })),
});

export class CardConnect extends PaymentGateway {
  constructor(ctx, data) {
    super(ctx, data);

    this.api = axios.create({ baseURL: CARDCONNECT_URL });
  }

  // used to determine which customer's prop is gateway id
  get customerIdPropName() {
    return 'cardConnectId';
  }

  async getAuthHeader() {
    const decryptedPassword = await decryptMidPassword(this.password);

    return Buffer.from(`${this.username}:${decryptedPassword}`, 'utf-8').toString('base64');
  }

  async makeAuthenticatedRequest(url, requestConfig) {
    const authHeader = await this.getAuthHeader();

    const response = await this.api({
      url,
      headers: {
        Authorization: `Basic ${authHeader}`,
      },
      ...requestConfig,
    });

    return response.data;
  }

  async createCustomerRecord(payload) {
    try {
      const responseData = await this.makeAuthenticatedRequest('/auth', {
        method: 'POST',
        data: {
          merchid: this.mid,
          amount: 0, // trigger AVS validation
          profile: 'Y',
          account: payload.cardNumber,
          expiry: payload.expirationDate,
          cvv2: payload.cvv,
        },
      });

      assertResponseSuccessful(responseData);

      if (responseData.cvvresp !== 'M' && responseData.profileid) {
        try {
          await this.removeCustomerRecord(responseData.profileid);
        } catch (error) {
          this.ctx.logger.error('Failed to rollback customer record creation');
        }
        throw new CvvValidationError(responseData);
      } else if (responseData.profileid) {
        return responseData.profileid;
      }

      throw new UnexpectedResponseError();
    } catch (error) {
      this.ctx.logger.error(error, 'Failed to create customer record');

      throw error;
    }
  }

  async removeCustomerRecord(customerGatewayId) {
    try {
      const responseData = await this.makeAuthenticatedRequest(
        `/profile/${customerGatewayId}/$/${this.mid}`,
        { method: 'DELETE' },
      );

      assertResponseSuccessful(responseData);

      return true;
    } catch (error) {
      this.ctx.logger.error(error, 'Failed to remove customer record');

      throw error;
    }
  }

  async getCustomerCreditCards({ customerGatewayId, ccAccountId = '' }) {
    try {
      const creditCards = await this.makeAuthenticatedRequest(
        `/profile/${customerGatewayId}/${ccAccountId}/${this.mid}`,
        {
          method: 'GET',
        },
      );

      if (ccAccountId) {
        return creditCards?.[0] ? mapCreditCard(creditCards[0]) : null;
      }

      return creditCards?.map(mapCreditCard) ?? [];
    } catch (error) {
      this.ctx.logger.error(error, 'Failed to get customer');

      throw error;
    }
  }

  async addCreditCard({ customerGatewayId, ccAccountId, ccData }) {
    try {
      const responseData = await this.makeAuthenticatedRequest('/profile', {
        method: 'PUT',
        data: {
          merchid: this.mid,
          amount: 0, // trigger AVS validation
          profile: `${customerGatewayId}/${ccAccountId}`,
          profileupdate: 'Y',
          name: ccData.nameOnCard,
          account: ccData.cardNumber,
          expiry: ccData.expirationDate,
          address: ccData.addressLine1,
          // address2: ccData.addressLine2,
          city: ccData.city,
          region: ccData.state,
          postal: ccData.zip,
        },
      });

      assertResponseSuccessful(responseData);

      if (responseData?.token) {
        return {
          ccAccountToken: responseData.token,
          cardType: this.getCardType(ccData.cardNumber),
          ccAccountId,
        };
      }

      throw new UnexpectedResponseError();
    } catch (error) {
      this.ctx.logger.error(error, 'Failed to add credit card');

      throw error;
    }
  }
  // eslint-disable-next-line
  async updateCreditCard({ customerGatewayId, ccAccountId, ccAccountToken, ccData }) {
    try {
      const responseData = await this.makeAuthenticatedRequest('/profile', {
        method: 'PUT',
        data: {
          merchid: this.mid,
          amount: 0, // trigger AVS validation
          profile: `${customerGatewayId}/${ccAccountId}`,
          profileupdate: 'Y',
          account: ccAccountToken,
          address: ccData.addressLine1,
          // address2: ccData.addressLine2,
          city: ccData.city,
          region: ccData.state,
          postal: ccData.zip,
        },
      });

      assertResponseSuccessful(responseData);

      return true;
    } catch (error) {
      this.ctx.logger.error(error, 'Failed to update credit card');

      throw error;
    }
  }

  async removeCreditCard({ customerGatewayId, ccAccountId }) {
    try {
      const responseData = await this.makeAuthenticatedRequest(
        `/profile/${customerGatewayId}/${ccAccountId}/${this.mid}`,
        {
          method: 'DELETE',
        },
      );

      assertResponseSuccessful(responseData);

      return true;
    } catch (error) {
      this.ctx.logger.error(error, 'Failed to remove credit card');

      throw error;
    }
  }

  async validateCreditCard(_data) {
    try {
      const responseData = await this.makeAuthenticatedRequest(`/auth`, {
        method: 'POST',
        data: {
          merchid: this.mid,
          amount: 0, // trigger AVS validation
          profile: 'N',
          account: _data.cardNumber,
          expiry: _data.expirationDate,
          cvv2: _data.cvv,
          address: _data.addressLine1,
          // address2: _data.addressLine2,
          city: _data.city,
          region: _data.state,
          postal: _data.zip,
        },
      });

      assertResponseSuccessful(responseData);
      assertTransactionResultValid(responseData);

      return true;
    } catch (error) {
      this.ctx.logger.error(error, 'Credit card validation failed');

      throw error;
    }
  }

  async authorizeAmount({ customerGatewayId, ccAccountId, amount }) {
    const authorizedAmount = mathRound2(amount);

    try {
      const responseData = await this.makeAuthenticatedRequest('/auth', {
        method: 'POST',
        data: {
          merchid: this.mid,
          profile: `${customerGatewayId}/${ccAccountId}`,
          amount: Math.floor(authorizedAmount * 100),
        },
      });

      assertResponseSuccessful(responseData);

      if (responseData.retref) {
        return {
          amount: authorizedAmount,
          ccRetref: responseData.retref,
        };
      }

      throw new UnexpectedResponseError();
    } catch (error) {
      this.ctx.logger.error(error, 'Failed to authorize amount');

      throw error;
    }
  }

  async captureAuthorizedAmount({ ccRetref, amount }) {
    const capturedAmount = mathRound2(amount);

    try {
      const responseData = await this.makeAuthenticatedRequest('/capture', {
        method: 'POST',
        data: {
          amount: Math.floor(capturedAmount * 100),
          merchid: this.mid,
          retref: ccRetref,
        },
      });

      assertResponseSuccessful(responseData);

      if (responseData.retref) {
        return {
          amount: capturedAmount,
          ccRetref: responseData.retref,
        };
      }

      throw new UnexpectedResponseError();
    } catch (error) {
      this.ctx.logger.error(error, 'Failed to capture authorized amount');

      throw error;
    }
  }

  async authorizeAndCaptureAmount({ customerGatewayId, ccAccountId, amount }) {
    const capturedAmount = mathRound2(amount);

    try {
      const responseData = await this.makeAuthenticatedRequest('/auth', {
        method: 'POST',
        data: {
          merchid: this.mid,
          profile: `${customerGatewayId}/${ccAccountId}`,
          amount: Math.floor(capturedAmount * 100),
          capture: 'Y',
        },
      });

      assertResponseSuccessful(responseData);

      if (responseData.retref) {
        return {
          amount: capturedAmount,
          ccRetref: responseData.retref,
        };
      }

      throw new UnexpectedResponseError();
    } catch (error) {
      this.ctx.logger.error(error, 'Failed to authorize & capture amount');

      throw error;
    }
  }

  async payoutAmount({ customerGatewayId, ccAccountId, amount }) {
    // negative amount means Forced Credit operation
    const payoutedAmount = -mathRound2(amount);

    try {
      const responseData = await this.makeAuthenticatedRequest('/auth', {
        method: 'POST',
        data: {
          merchid: this.mid,
          profile: `${customerGatewayId}/${ccAccountId}`,
          amount: Math.floor(payoutedAmount * 100),
          capture: 'Y',
        },
      });

      assertResponseSuccessful(responseData);

      if (responseData.retref) {
        return {
          ccRetref: responseData.retref,
        };
      }

      throw new UnexpectedResponseError();
    } catch (error) {
      this.ctx.logger.error(error, 'Failed to payout amount');

      throw error;
    }
  }

  async voidAmount({ ccRetref }) {
    try {
      const responseData = await this.makeAuthenticatedRequest('/void', {
        method: 'POST',
        data: {
          merchid: this.mid,
          retref: ccRetref,
        },
      });

      assertResponseSuccessful(responseData);

      if (responseData.retref) {
        return {
          ccRetref: responseData.retref,
        };
      }

      throw new UnexpectedResponseError();
    } catch (error) {
      this.ctx.logger.error(error, 'Failed to void amount');

      throw error;
    }
  }

  async partialRefund({ ccRetref, amount }) {
    const refundedAmount = mathRound2(amount);
    try {
      const responseData = await this.makeAuthenticatedRequest('/refund', {
        method: 'POST',
        data: {
          merchid: this.mid,
          retref: ccRetref,
          amount: Math.floor(refundedAmount * 100),
        },
      });

      if (responseData.respcode === NOT_SETTLED_CODE) {
        throw new TransactionNotSettledError();
      }

      assertResponseSuccessful(responseData);

      if (responseData.retref) {
        return {
          ccRetref: responseData.retref,
          amount: refundedAmount,
        };
      }

      throw new UnexpectedResponseError();
    } catch (error) {
      this.ctx.logger.error(error, 'Failed to refund amount');

      throw error;
    }
  }

  async getFundings({ date }) {
    try {
      const responseData = await this.makeAuthenticatedRequest('/funding', {
        method: 'GET',
        params: {
          merchid: this.mid,
          date: dateFns.format(date, 'yyyyMMdd'),
        },
      });

      if (Array.isArray(responseData.txns)) {
        return responseData;
      } else {
        return {
          fundingdate: dateFns.formatISO(date, {
            representation: 'date',
          }),
          adjustments: [],
          txns: [],
        };
      }
    } catch (error) {
      this.ctx.logger.error(error, 'Failed to get fundings');

      throw error;
    }
  }

  async requestSettlement({ date }) {
    const settlementData = await this.getFundings({ date });

    const settlement = mapSettlement(settlementData);

    return settlement;
  }

  async validateCredentials(raw = false) {
    try {
      let password = this.password;

      if (!raw) {
        password = await decryptMidPassword(this.password);
      }

      await axios.put(
        `${CARDCONNECT_URL}/`,
        { merchid: this.mid },
        {
          auth: {
            username: this.username,
            password,
          },
        },
      );

      return true;
    } catch (error) {
      this.ctx.logger.error('Failed to validate credentials');

      throw error;
    }
  }
}
