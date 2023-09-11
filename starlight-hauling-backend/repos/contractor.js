import { camelCaseKeys, unambiguousCondition } from '../utils/dbHelpers.js';
import BaseRepository from './_base.js';
import TenantRepository from './tenant.js';
import ContactRepo from './contact.js';
import PhoneNumberRepository from './phoneNumber.js';
import CustomerRepo from './customer.js';

const TABLE_NAME = 'contractors';

class ContractorRepository extends BaseRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
  }

  async createOne({ data: { password, ...data }, tenantId }, trx) {
    const _trx = trx || (await this.knex.transaction());

    try {
      await super.createOne({ data }, _trx);

      await _trx(TABLE_NAME).withSchema('admin').insert({
        tenantId,
        email: data.email,
        password,
      });

      if (!trx) {
        await _trx.commit();
      }
    } catch (error) {
      if (!trx) {
        await _trx.rollback();
      }
      throw error;
    }
  }

  async deleteBy({ condition }, trx) {
    const _trx = trx || (await this.knex.transaction());

    try {
      const user = await super.getBy({ condition, fields: ['email'] }, _trx);

      await Promise.all([
        super.deleteBy({ condition }, _trx),
        user
          ? _trx(TABLE_NAME).withSchema('admin').where({ email: user.email }).delete()
          : Promise.resolve(),
      ]);

      if (!trx) {
        await _trx.commit();
      }
    } catch (error) {
      if (!trx) {
        await _trx.rollback();
      }
      throw error;
    }
  }

  async getByWithContact({ condition, fields = ['*'], withCustomer = false }) {
    const selects = fields
      .map(field => `${this.tableName}.${field}`)
      .concat([
        this.knex.raw('to_json(??.*) as ??', [ContactRepo.TABLE_NAME, 'contact']),
        this.knex.raw('json_agg(??.*) as ??', [PhoneNumberRepository.TABLE_NAME, 'phoneNumbers']),
      ]);

    const groupByFields = [`${this.tableName}.id`, `${ContactRepo.TABLE_NAME}.id`];
    if (withCustomer) {
      selects.push(this.knex.raw('to_json(??.*) as ??', [CustomerRepo.TABLE_NAME, 'customer']));
      groupByFields.push(`${CustomerRepo.TABLE_NAME}.id`);
    }

    let query = super
      .getBy({
        condition: unambiguousCondition(this.tableName, condition),
        fields: selects,
      })
      .innerJoin(
        `${ContactRepo.TABLE_NAME}`,
        `${this.tableName}.contactId`,
        `${ContactRepo.TABLE_NAME}.id`,
      )
      .leftJoin(
        PhoneNumberRepository.TABLE_NAME,
        `${PhoneNumberRepository.TABLE_NAME}.contactId`,
        `${this.tableName}.id`,
      )
      .groupBy(groupByFields)
      .orderBy(`${this.tableName}.id`);

    if (withCustomer) {
      query = query.innerJoin(
        `${CustomerRepo.TABLE_NAME}`,
        `${this.tableName}.customerId`,
        `${CustomerRepo.TABLE_NAME}.id`,
      );
    }

    const item = await query;

    if (item?.contact) {
      item.contact = camelCaseKeys(item.contact);
    } else {
      delete item.contact;
    }
    if (item?.phoneNumbers?.[0]) {
      item.phoneNumbers = item.phoneNumbers.map(camelCaseKeys);
    } else {
      delete item.phoneNumbers;
    }
    if (withCustomer && item?.customer) {
      item.customer = camelCaseKeys(item.customer);
    } else {
      delete item.customer;
    }

    return item;
  }

  static getUserByEmail(email, fields = ['*']) {
    return this.knex(TABLE_NAME)
      .withSchema('admin')
      .innerJoin(
        `${TenantRepository.TABLE_NAME}`,
        `${TABLE_NAME}.tenantId`,
        `${TenantRepository.TABLE_NAME}.id`,
      )
      .where({ email: email.toLowerCase() })
      .select(fields)
      .first();
  }

  static updateBy(...args) {
    return super.prototype.updateBy.apply(
      {
        schemaName: 'admin',
        tableName: TABLE_NAME,
      },
      args,
    );
  }

  async updateProfile({ condition: { id }, data }, trx) {
    const _trx = trx || (await this.knex.transaction());

    const { contactId, firstName, lastName, email, mobile, imageUrl, tocAccepted } = data;
    try {
      await Promise.all([
        super.updateBy(
          {
            condition: { id },
            data: {
              email,
              mobile,
              imageUrl,
              tocAccepted,
            },
            fields: [],
          },
          _trx,
        ),

        this.constructor.updateBy(
          {
            condition: { email },
            data: { email },
            fields: [],
          },
          _trx,
        ),
        ContactRepo.getInstance(this.ctxState).updateBy(
          {
            condition: { id: contactId },
            data: { firstName, lastName, email },
            fields: [],
            skipPhoneNumbers: true,
            log: true,
          },
          _trx,
        ),
      ]);

      if (!trx) {
        await _trx.commit();
      }
    } catch (error) {
      if (!trx) {
        await _trx.rollback();
      }
      throw error;
    }
  }
}

ContractorRepository.TABLE_NAME = TABLE_NAME;

export default ContractorRepository;
