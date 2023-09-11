import * as dateFns from 'date-fns';
//eslint-disable-next-line
import datefnstz from 'date-fns-tz';

import { generateAndSaveBankDeposit } from '../services/reporting/report.js';

import ApplicationError from '../errors/ApplicationError.js';

import { DEFAULT_LIMIT } from '../consts/defaults.js';
import { BankDepositType, DEPOSIT_TYPES } from '../consts/bankDepositTypes.js';
import { BankDepositStatus, DEPOSIT_STATUSES } from '../consts/bankDepositStatuses.js';
import { DepositSorting } from '../consts/depositSorting.js';
import { SortOrder } from '../consts/sortOrders.js';
import BaseModel from './_base.js';

const { utcToZonedTime } = datefnstz;

export default class BankDeposit extends BaseModel {
  static get tableName() {
    return 'bank_deposits';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['businessUnitId', 'date', 'depositType', 'synced', 'status', 'count', 'total'],

      properties: {
        id: { type: 'integer' },

        adjustments: { type: 'number' },
        date: { type: 'string' },
        depositType: { enum: DEPOSIT_TYPES },
        merchantId: { type: 'string' },
        synced: { type: 'boolean' },
        status: { enum: DEPOSIT_STATUSES },
        count: { type: 'number' },
        total: { type: 'number' },
        pdfUrl: { type: ['string', null] },

        businessUnitId: { type: 'integer' },
        settlementId: { type: ['integer', null] },
      },
    };
  }

  static get relationMappings() {
    const { BusinessUnit, Payment, Settlement } = this.models;

    return {
      businessUnit: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: BusinessUnit,
        join: {
          from: `${this.tableName}.businessUnitId`,
          to: `${BusinessUnit.tableName}.id`,
        },
      },
      payments: {
        relation: BaseModel.ManyToManyRelation,
        modelClass: Payment,
        join: {
          from: `${this.tableName}.id`,
          through: {
            from: 'bankDepositPayment.bankDepositId',
            to: 'bankDepositPayment.paymentId',
          },
          to: `${Payment.tableName}.id`,
        },
      },
      settlement: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Settlement,
        join: {
          from: `${this.tableName}.settlementId`,
          to: `${Settlement.tableName}.id`,
        },
      },
    };
  }

  static async upsertAndFetchCurrentDeposit(
    { condition: { businessUnitId, type }, data: { count = 0, total = 0 } = {} } = {},
    outerTrx,
  ) {
    const trx = outerTrx ?? (await this.startTransaction());
    // const { BusinessUnit } = this.models;

    let result,
      update = true;
    try {
      // const { timeZone } = await BusinessUnit.getTimeZone(businessUnitId, trx);
      const bankDeposit = await this.query(trx)
        .where({
          businessUnitId,
          depositType: type,
          status: BankDepositStatus.UNLOCKED,
        })
        .select(['*'])
        .first();

      if (!bankDeposit) {
        /*
        This is the original code, the structure have been changed because we were not able to create orders
        This new code return the same format(yyyy-MM-dd)
        ORIGINAL: date: dateFns.format(utcToZonedTime(new Date(), timeZone), 'yyyy-MM-dd'),
        */
        result = await this.query(trx).insertAndFetch({
          businessUnitId,
          depositType: type,
          status: BankDepositStatus.UNLOCKED,
          synced: false,
          date: new Date().toISOString('yyyy-MM-dd'),
          total,
          count,
        });
        update = false;
      } else if (count > 0 && total > 0) {
        result = await this.query(trx).patchAndFetchById(bankDeposit.id, {
          count: this.raw('count + ?', [count]),
          total: this.raw('total + ?', [total]),
        });
      }

      if (!outerTrx) {
        await trx.commit();
      }
    } catch (error) {
      if (!outerTrx) {
        await trx.rollback();
      }

      throw error;
    }

    return { bankDeposit: result, update };
  }

  static async lockBankDeposits(ctx, { businessUnitId, tenantId, date }, { log, userId } = {}) {
    const trx = await this.startTransaction();

    let lockedDeposits, newBankDeposit;
    const { BusinessUnit } = this.models;

    try {
      const { timeZone } = await BusinessUnit.getTimeZone(businessUnitId, trx);
      lockedDeposits = await this.query(trx)
        .andWhere({
          businessUnitId,
          depositType: BankDepositType.CASH_CHECK,
          status: BankDepositStatus.UNLOCKED,
        })
        .patch({ status: BankDepositStatus.LOCKED })
        .returning('id');

      if (lockedDeposits?.length) {
        const generationResults = await Promise.all(
          lockedDeposits.map(({ id }) =>
            generateAndSaveBankDeposit(ctx, this.schemaName, tenantId, id),
          ),
        );
        await Promise.all(
          generationResults.map(({ id, pdfUrl }) => this.patchById(id, { pdfUrl }, trx)),
        );
      }

      if (!dateFns.isPast(dateFns.endOfDay(new Date(date)))) {
        newBankDeposit = await this.query(trx).insertAndFetch({
          businessUnitId,
          depositType: BankDepositType.CASH_CHECK,
          status: BankDepositStatus.UNLOCKED,
          synced: false,
          date: dateFns.format(utcToZonedTime(new Date(), timeZone), 'yyyy-MM-dd'),
          count: 0,
          total: 0,
        });
      }

      await trx.commit();
    } catch (error) {
      await trx.rollback();

      throw error;
    }

    if (log) {
      const entity = this.logEntity.bankDeposits;
      newBankDeposit?.id &&
        this.log({
          id: newBankDeposit.id,
          userId,
          action: this.logAction.create,
          entity,
        });

      const action = this.logAction.modify;
      lockedDeposits?.forEach(({ id }) => this.log({ id, userId, action, entity }), this);
    }

    return newBankDeposit;
  }

  static async unlockBankDeposit(ctx, { id, businessUnitId, tenantId }, { log, userId } = {}) {
    const trx = await this.startTransaction();

    let lockedDeposits;
    try {
      const deposit = await this.query(trx).findById(id);

      if (!deposit) {
        throw ApplicationError.notFound(`Deposit with id ${id} not found`);
      }

      lockedDeposits = await this.query(trx)
        .andWhere({
          depositType: BankDepositType.CASH_CHECK,
          businessUnitId,
          status: BankDepositStatus.UNLOCKED,
        })
        .patch({ status: BankDepositStatus.LOCKED })
        .returning('id');

      if (lockedDeposits?.length) {
        const generationResults = await Promise.all(
          lockedDeposits.map(lockedDeposit =>
            generateAndSaveBankDeposit(ctx, this.schemaName, tenantId, lockedDeposit.id),
          ),
        );
        await Promise.all(
          generationResults.map(generationResultElement =>
            this.patchById(
              generationResultElement.id,
              { pdfUrl: generationResultElement.pdfUrl },
              trx,
            ),
          ),
        );
      }

      await this.query(trx)
        .where({ id, businessUnitId })
        .patch({ status: BankDepositStatus.UNLOCKED });

      await trx.commit();
    } catch (error) {
      await trx.rollback();

      throw error;
    }

    if (log) {
      const action = this.logAction.modify;
      const entity = this.logEntity.bankDeposits;

      this.log({ id, userId, action, entity });
      lockedDeposits?.forEach(
        lockedDeposit => this.log({ id: lockedDeposit.id, userId, action, entity }),
        this,
      );
    }
  }

  static async lockAllPastDeposits(ctx, { tenantId, businessUnitIds = [] }, { log, userId } = {}) {
    const trx = await this.startTransaction();

    let lockedDeposits;
    try {
      lockedDeposits = await this.query(trx)
        .patch({ status: BankDepositStatus.LOCKED })
        .where({ status: BankDepositStatus.UNLOCKED })
        .whereIn('businessUnitId', businessUnitIds)
        .andWhereRaw('date != CURRENT_DATE')
        .returning('id');

      if (lockedDeposits?.length) {
        const generationResults = await Promise.all(
          lockedDeposits.map(({ id }) =>
            generateAndSaveBankDeposit(ctx, this.schemaName, tenantId, id),
          ),
        );

        await Promise.all(
          generationResults.map(({ id, pdfUrl }) => this.patchById(id, { pdfUrl }, trx)),
        );
      }

      await trx.commit();
    } catch (error) {
      await trx.rollback();

      throw error;
    }

    if (log) {
      const action = this.logAction.modify;
      const entity = this.logEntity.bankDeposits;
      lockedDeposits?.forEach(({ id }) => this.log({ id, userId, action, entity }), this);
    }
  }

  static async createCcBankDeposit(ctx, { data, tenantId }) {
    const deposit = await this.query().insertGraphAndFetch(data, {
      relate: ['payments'],
    });

    try {
      const generationResult = await generateAndSaveBankDeposit(
        ctx,
        this.schemaName,
        tenantId,
        deposit.id,
      );

      if (generationResult) {
        await this.patchById(deposit.id, { pdfUrl: generationResult.pdfUrl });
      }
    } catch (error) {
      ctx.logger.error(error, 'Failed to generate cc bank deposits');

      throw error;
    }

    return deposit;
  }

  static async getAllPaginated({
    condition: { businessUnitId },
    limit = DEFAULT_LIMIT,
    offset = 0,
    sortBy = DepositSorting.ID,
    sortOrder = SortOrder.DESC,
  }) {
    const query = this.query();
    if (businessUnitId) {
      query.andWhere({ businessUnitId });
    }

    query.orderBy(sortBy, sortOrder).limit(limit).offset(offset);

    const result = await query;

    return result;
  }

  static async getAllByStatus({ status, ids = [], fields = ['*'] } = {}) {
    const result = await this.query().whereIn('id', ids).andWhere({ status }).select(fields);

    return result;
  }

  async $getPayments() {
    const payments = await this.$relatedQuery('payments');

    return payments;
  }

  static async syncBankDeposit({ condition: { ids } }, trx, { log, userId } = {}) {
    const items = await this.query(trx).whereIn('id', ids).andWhere({ synced: false }).select('id');

    if (items?.length) {
      await Promise.all(
        items.map(
          ({ id }) => this.patchById(id, { synced: true, status: BankDepositStatus.LOCKED }),
          this,
        ),
      );

      if (log) {
        const action = this.logAction.modify;
        const entity = this.logEntity.bankDeposits;
        items?.forEach(({ id }) => this.log({ id, userId, action, entity }), this);
      }
    }
  }
}
