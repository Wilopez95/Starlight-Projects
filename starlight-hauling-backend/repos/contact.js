import compose from 'lodash/fp/compose.js';

import {
  updateDocument,
  applyTenantToIndex,
  mapSource,
} from '../services/elasticsearch/ElasticSearch.js';
import { getRandomPassword, hashPassword } from '../services/tokens.js';
import { sendContractorPassword } from '../services/email.js';
import { upsertCustomerPortalUser } from '../services/ums.js';

import { camelCaseKeys, omitPhoneNumberFields, unambiguousCondition } from '../utils/dbHelpers.js';

import ApiError from '../errors/ApiError.js';

import { TENANT_INDEX } from '../consts/searchIndices.js';
import { PHONE_TYPE } from '../consts/phoneTypes.js';
import { SORT_ORDER } from '../consts/sortOrders.js';
import { CONTACT_SORTING_ATTRIBUTE } from '../consts/contactSortingAttributes.js';
import CustomerRepo from './customer.js';
import ContractorRepo from './contractor.js';
import JobSiteRepo from './jobSite.js';
import SubscriptionRepository from './subscription/subscription.js';
import OrderRepository from './order.js';
import PhoneNumberRepo from './phoneNumber.js';
import VersionedRepository from './_versioned.js';

const getMainPhoneNumber = data =>
  data?.find(phoneNumber => phoneNumber.type === PHONE_TYPE.main)?.number;

const TABLE_NAME = 'contacts';

class ContactRepository extends VersionedRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
  }

  mapFields(obj) {
    return compose(
      omitPhoneNumberFields,
      super.mapJoinedFields,
      camelCaseKeys,
      super.mapFields,
    )(obj);
  }

  async signUpContractUser(
    { customerId, email, contactId, businessUnitId, tenantId },
    trx = this.knex,
  ) {
    const newUserPassword = getRandomPassword(15);
    const hashedPassword = await hashPassword(newUserPassword);

    await ContractorRepo.getInstance(this.ctxState).createOne(
      {
        data: {
          customerId,
          email,
          contactId,
          businessUnitId,
          password: hashedPassword,
        },
        tenantId,
      },
      trx,
    );

    await sendContractorPassword(email, newUserPassword);
  }

  async checkForEmailDuplicate({ condition: { customerId, email, currEmail }, trx }) {
    const isSame = email === currEmail;
    if (isSame || !customerId || !email) {
      return;
    }

    const contact = await super.getBy(
      {
        condition: {
          email,
          customerId,
        },
      },
      trx,
    );

    if (contact) {
      throw ApiError.conflict(
        'This email is already used for another contact. Please, enter another email.',
      );
    }
  }

  async createOne(
    { data: { phoneNumbers, ...data }, fields = ['*'], tenantId, businessUnitId, log } = {},
    trx,
  ) {
    const { email, customerId, allowCustomerPortal, allowContractorApp } = data;
    data.customerPortalUser = customerId && allowCustomerPortal;

    let contact;
    let customer;
    let oldMainContact;
    let mainPhoneNumber;

    const _trx = trx || (await this.knex.transaction());

    try {
      await this.checkForEmailDuplicate({
        condition: { customerId, email },
        trx: _trx,
      });
      contact = await super.createOne({ data, fields: log ? '*' : fields }, _trx);

      const { id: contactId, main, active, firstName, lastName } = contact;

      if (customerId && main && active) {
        [oldMainContact, customer] = await Promise.all([
          this.setMainContact({ condition: { customerId }, excludedId: contactId }, _trx),
          CustomerRepo.getInstance(this.ctxState).updateBy(
            {
              condition: { id: customerId },
              data: { contactId },
              log: log && !trx,
              fields: ['id', 'businessName'],
            },
            _trx,
          ),
        ]);

        this.updateCustomerIndex({
          id: customerId,
          contactName: `${firstName || ''} ${lastName || ''}`.trim(),
          contactEmail: email,
        });

        // if it's non-commercial customer - update it for AR reports on Billing
        if (!customer.businessName) {
          mainPhoneNumber = getMainPhoneNumber(phoneNumbers);
        }
      }

      const repo = PhoneNumberRepo.getInstance(this.ctxState);
      let items = [];
      if (phoneNumbers?.length) {
        items = await Promise.all(
          phoneNumbers.map(phoneNumber =>
            repo.createOne({ data: Object.assign(phoneNumber, { contactId }) }, _trx),
          ),
        );
      }

      if (fields[0] === '*' || fields.includes('phoneNumbers')) {
        contact.phoneNumbers = items || [];
      }

      // temporary contact case
      if (customerId) {
        if (allowContractorApp) {
          await this.signUpContractUser(
            {
              ...data,
              contactId,
              tenantId,
              businessUnitId,
            },
            _trx,
          );
        }
      }

      await this.upsertCustomerUser({ contact, oldMainContact, tenantId, trx: _trx });

      if (!trx) {
        await _trx.commit();
      }
    } catch (error) {
      if (!trx) {
        await _trx.rollback();
      }
      throw error;
    }

    log && this.log({ id: contact.id, action: this.logAction.create });

    if (contact) {
      Object.assign(contact, { customerId, mainPhoneNumber });
      return this.mapFields(contact);
    }
    return null;
  }

  async setMainContact({ condition, excludedId } = {}, trx = this.knex) {
    const data = await trx(this.tableName)
      .withSchema(this.schemaName)
      .update({ main: false })
      .whereNot('id', excludedId)
      .andWhere({
        ...condition,
        main: true,
      })
      .returning('*');
    return data?.[0];
  }

  updateInitialValues({ contact, data }) {
    const { customerId: dataCustomerId, email: dataEmail } = data;
    const {
      customerId: currCustomerId,
      customerPortalUser: currPortalUser,
      main: currMain,
      email: currEmail,
    } = contact || {};

    const mainOldValue = currMain;
    const inputCustomerId = dataCustomerId || currCustomerId;
    const inputEmail = currPortalUser ? currEmail : dataEmail;
    const conAllowPortal = data.allowCustomerPortal ?? contact.allowCustomerPortal;
    const isPortalUser = !!(inputCustomerId && conAllowPortal);
    return {
      inputCustomerId,
      inputEmail,
      currEmail,
      currPortalUser,
      isPortalUser,
      mainOldValue,
    };
  }

  async updateBy(
    {
      condition,
      data: { phoneNumbers = [], ...data },
      tenantId,
      businessUnitId,
      fields = ['*'],
      concurrentData,
      skipPhoneNumbers = false,
      log,
    } = {},
    trx,
  ) {
    const { customerId: dataCustomerId } = data;
    let contact;
    let customer;
    let oldMainContact;
    let mainPhoneNumber;

    const _trx = trx || (await this.knex.transaction());

    try {
      contact = await super.getBy({ condition }, _trx);

      // const {
      //   customerId: currCustomerId,
      //   customerPortalUser: currPortalUser,
      //   main: currMain,
      //   email: currEmail,
      // } = contact || {};

      // const mainOldValue = currMain;
      // const inputCustomerId = dataCustomerId || currCustomerId;
      // const inputEmail = currPortalUser ? currEmail : dataEmail;
      // const conAllowPortal = data.allowCustomerPortal ?? contact.allowCustomerPortal;
      // const isPortalUser = !!(inputCustomerId && conAllowPortal);
      // pricing plan
      const { inputCustomerId, inputEmail, currEmail, currPortalUser, isPortalUser, mainOldValue } =
        this.updateInitialValues({ contact, data });

      await this.checkForEmailDuplicate({
        condition: {
          customerId: inputCustomerId,
          email: inputEmail,
          currEmail,
        },
        trx: _trx,
      });

      data.customerPortalUser = currPortalUser || isPortalUser;
      data.email = inputEmail;

      contact = await super.updateBy({ condition, data, fields, concurrentData }, _trx);

      const { id: contactId, firstName, lastName, email, main, active } = contact;

      if (inputCustomerId && main && active) {
        [oldMainContact, customer] = await Promise.all([
          this.setMainContact(
            { condition: { customerId: inputCustomerId }, excludedId: contactId },
            _trx,
          ),
          CustomerRepo.getInstance(this.ctxState).updateBy(
            {
              condition: { id: inputCustomerId },
              data: { contactId, firstName, lastName },
              log: log && !trx,
              fields: ['id', 'businessName'],
            },
            _trx,
          ),
        ]);

        this.updateCustomerIndex({
          id: inputCustomerId,
          contactName: `${firstName || ''} ${lastName || ''}`,
          contactEmail: email,
        });

        // if it's non-commercial customer - update it for AR reports on Billing
        if (!customer.businessName) {
          mainPhoneNumber = getMainPhoneNumber(phoneNumbers);
        }
      } else if (mainOldValue) {
        this.updateCustomerIndex({
          id: inputCustomerId,
          contactName: '',
          contactEmail: '',
        });
      }

      if (!skipPhoneNumbers) {
        const items = await PhoneNumberRepo.getInstance(this.ctxState).updateMany(
          {
            data: phoneNumbers?.length ? phoneNumbers : [],
            condition: { contactId, customerId: null },
            fields: ['*'],
          },
          _trx,
        );

        if (fields[0] === '*' || fields.includes('phoneNumbers')) {
          contact.phoneNumbers = items || [];
        }
      }

      const repo = ContractorRepo.getInstance(this.ctxState);
      const dataAllowContractorApp = data.allowContractorApp ?? contact.allowContractorApp;
      if (dataAllowContractorApp) {
        const user = await repo.getBy(
          {
            condition: { contactId },
            fields: ['email'],
          },
          _trx,
        );

        const emailUpdated = user && user.email?.toLowerCase() !== inputEmail?.toLowerCase();

        if (!user || emailUpdated) {
          await this.signUpContractUser(
            {
              ...data,
              customerId: inputCustomerId,
              contactId,
              tenantId,
              businessUnitId,
            },
            _trx,
          );

          if (emailUpdated) {
            await repo.deleteBy({ condition: { email: user.email } }, _trx);
          }
        }
      } else if (contactId) {
        await repo
          .deleteBy({ condition: { contactId } }, _trx)
          .catch(error => this.ctxState.logger.error(error));
      }

      await this.upsertCustomerUser({ contact, oldMainContact, tenantId, trx: _trx });

      if (!trx) {
        await _trx.commit();
      }
    } catch (error) {
      if (!trx) {
        await _trx.rollback();
      }
      throw error;
    }

    log && contact && this.log({ id: contact.id, action: this.logAction.modify });

    if (contact) {
      Object.assign(contact, { customerId: dataCustomerId, mainPhoneNumber });
      return this.mapFields(contact);
    }
    return null;
  }

  async getBy({ condition, fields = ['*'] } = {}, trx = this.knex) {
    const selects = fields.map(field => `${this.tableName}.${field}`);
    const where = unambiguousCondition(this.tableName, condition);

    const item = await trx(this.tableName)
      .withSchema(this.schemaName)
      .leftJoin(
        PhoneNumberRepo.TABLE_NAME,
        `${PhoneNumberRepo.TABLE_NAME}.contactId`,
        `${this.tableName}.id`,
      )
      .where(where)
      .select(selects)
      .orderBy(`${this.tableName}.id`)
      .first();

    if (!item) {
      return null;
    }

    let contactId = item.id;
    if (this.tableName.endsWith('_historical')) {
      contactId = item.originalId;
    }

    if (fields[0] === '*' || fields.includes('phoneNumbers')) {
      item.phoneNumbers =
        (await PhoneNumberRepo.getInstance(this.ctxState).getAll(
          { condition: { contactId } },
          trx,
        )) ?? [];
    }

    return this.mapFields(item);
  }

  async getOrderAndSubscriptionContactsByJobSiteId(
    {
      condition = {},
      skip = 0,
      limit = 25,
      sortBy = CONTACT_SORTING_ATTRIBUTE.id,
      sortOrder = SORT_ORDER.desc,
      fields = ['*'],
    } = {},
    trx = this.knex,
  ) {
    const contactsHT = ContactRepository.getHistoricalTableName(this.tableName);
    const jobSitesHT = JobSiteRepo.getHistoricalTableName(JobSiteRepo.TABLE_NAME);

    const { jobSiteId } = condition;
    delete condition.jobSiteId;

    const selects = fields.map(field => `${this.tableName}.${field}`);
    const sortField = this.contactSortBy(sortBy);

    const items = await trx(this.tableName)
      .withSchema(this.schemaName)
      .select(selects)
      .where(unambiguousCondition(this.tableName, condition))
      .innerJoin(contactsHT, `${contactsHT}.originalId`, `${this.tableName}.id`)
      .leftJoin(
        OrderRepository.TABLE_NAME,
        `${OrderRepository.TABLE_NAME}.jobSiteContactId`,
        `${contactsHT}.id`,
      )
      .leftJoin(
        SubscriptionRepository.TABLE_NAME,
        `${SubscriptionRepository.TABLE_NAME}.jobSiteContactId`,
        `${contactsHT}.id`,
      )
      // TODO: reason to re-write YM
      .joinRaw(
        `
                inner join "${this.schemaName}"."${jobSitesHT}"
                    on "${jobSitesHT}".id in (
                        "${OrderRepository.TABLE_NAME}".job_site_id,
                        "${SubscriptionRepository.TABLE_NAME}".job_site_id
                    )
            `,
      )
      .andWhere(`${jobSitesHT}.originalId`, jobSiteId)
      .leftJoin(
        PhoneNumberRepo.TABLE_NAME,
        `${PhoneNumberRepo.TABLE_NAME}.contact_id`,
        `${this.tableName}.id`,
      )
      .offset(skip)
      .limit(limit)
      .groupBy(`${this.tableName}.id`)
      .orderBy(sortField, sortOrder);

    if (!items?.length) {
      return [];
    }

    if (fields[0] === '*' || fields.includes('phoneNumbers')) {
      const repo = PhoneNumberRepo.getInstance(this.ctxState);

      await Promise.all(
        items.map(async item => {
          item.phoneNumbers = (await repo.getAll({ condition: { contactId: item.id } }, trx)) ?? [];
        }),
      );
    }

    return items?.map(this.mapFields.bind(this)) ?? [];
  }

  async updateCustomerIndex(customerData) {
    try {
      await updateDocument(
        this.ctxState,
        applyTenantToIndex(TENANT_INDEX.customers, this.schemaName),
        { match: { id: customerData.id } },
        mapSource(customerData),
      );
    } catch (error) {
      this.ctxState.logger.error(error, 'Error while updating customer indexed data');
    }
  }

  async deleteBy({ condition, log } = {}, trx) {
    const _trx = trx || (await this.knex.transaction());

    const contact = await super.getBy({ condition }, trx);
    if (!contact) {
      throw ApiError.notFound(`No Concact exists with id ${condition?.id}`);
    }

    try {
      await super.deleteBy({ condition, log }, _trx);

      await ContractorRepo.getInstance(this.ctxState)
        .deleteBy({ condition: { contactId: contact.id } }, _trx)
        .catch(error => this.ctxState.logger.error(error));

      await this.upsertCustomerUser({
        contact: {
          ...contact,
          allowCustomerPortal: false,
        },
        trx: _trx,
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

    const { customerId, main, active } = contact;
    if (customerId && main && active) {
      this.updateCustomerIndex({ id: customerId, contactName: '', contactEmail: '' });
    }
  }

  async getAllPaginated(
    {
      condition,
      fields = ['*'],
      withContractor = false,
      limit = 25,
      skip = 0,
      sortBy = CONTACT_SORTING_ATTRIBUTE.status,
      sortOrder = SORT_ORDER.desc,
    } = {},
    trx = this.knex,
  ) {
    const sortField = this.contactSortBy(sortBy);
    const selects = fields.map(field => `${this.tableName}.${field}`);

    if (withContractor) {
      const joinedTableColumns = await ContractorRepo.getInstance(this.ctxState).getColumnsToSelect(
        'contractor',
      );
      selects.push(...joinedTableColumns);
    }

    const { customerId } = condition;
    if (customerId) {
      condition[`${this.tableName}.customerId`] = customerId;
      delete condition.customerId;
    }

    let query = trx(this.tableName)
      .withSchema(this.schemaName)
      .where(unambiguousCondition(this.tableName, condition))
      .select(selects)
      .orderBy(sortField, sortOrder)
      .offset(skip)
      .limit(limit);

    if (withContractor) {
      query = query.leftJoin(
        ContractorRepo.TABLE_NAME,
        `${ContractorRepo.TABLE_NAME}.contactId`,
        `${this.tableName}.id`,
      );
    }

    const items = await query;
    if (!items?.length) {
      return [];
    }

    if (fields[0] === '*' || fields.includes('phoneNumbers')) {
      const repo = PhoneNumberRepo.getInstance(this.ctxState);

      await Promise.all(
        items.map(async item => {
          item.phoneNumbers = (await repo.getAll({ condition: { contactId: item.id } }, trx)) ?? [];
        }),
      );
    }

    return items?.map(item => {
      if (item?.contractor) {
        item.contractor = camelCaseKeys(item.contractor);
      } else {
        delete item.contractor;
      }
      return this.mapFields(item);
    });
  }

  async upsertCustomerUser({ contact, oldMainContact, tenantId, trx }) {
    const { customerPortalUser: contactPortalUser, customerId: contactCustomerId } = contact;
    const { customerPortalUser: oldPortalUser, email: oldEmail } = oldMainContact || {};

    if (!contactCustomerId || (!contactPortalUser && !oldPortalUser)) {
      return;
    }

    const { main, active, firstName, lastName, customerId, email, allowCustomerPortal } =
      contactPortalUser ? contact : oldMainContact;

    const customerRepo = CustomerRepo.getInstance(this.ctxState);
    const customer = await customerRepo.getBy({ condition: { id: customerId } }, trx);

    if (!customer) {
      throw ApiError.notFound(
        `Customer with id: ${customerId} does not exist`,
        'Error while processing user access for Customer Portal',
      );
    }

    const {
      businessName,
      firstName: customerFirstName,
      lastName: customerLastName,
      businessUnit: { nameLine1, nameLine2 },
    } = customer;

    await upsertCustomerPortalUser(this.ctxState, {
      firstName,
      lastName,
      email,
      tenantName: this.schemaName,
      tenantId,
      customerId,
      prevMainContactEmail: oldEmail,
      isMainContact: main,
      hasCustomerPortalAccess: allowCustomerPortal && active,
      label: businessName ?? `${customerFirstName} ${customerLastName}`,
      subLabel: nameLine1 ?? nameLine2,
      loginUrl: `/customers/${customerId}`,
    });
  }

  async getByIdToLog(id, trx = this.knex) {
    const item = await this.getBy({ condition: { id }, fields: ['*'] }, trx);

    return item || null;
  }

  contactSortBy(sortBy) {
    const sortedFields = {
      id: `${this.tableName}.id`,
      status: `${this.tableName}.active`,
      name: `${this.tableName}.firstName`,
      title: `${this.tableName}.jobTitle`,
      email: `${this.tableName}.email`,
    };
    return sortedFields[sortBy] || sortedFields.id;
  }
}

ContactRepository.TABLE_NAME = TABLE_NAME;

export default ContactRepository;
