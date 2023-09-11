import compose from 'lodash/fp/compose.js';
import difference from 'lodash/difference.js';
import pick from 'lodash/fp/pick.js';
import omit from 'lodash/omit.js';
import isBoolean from 'lodash/isBoolean.js';
import isEmpty from 'lodash/isEmpty.js';
import isEqual from 'lodash/fp/isEqual.js';
import camelCase from 'lodash/camelCase.js';
import startCase from 'lodash/startCase.js';

import { publish } from '../services/elasticsearch/indices/customers/publisher.js';
import { proceedCustomers } from '../services/subscriptions/utils/calcSubsInvoicing.js';
import * as billingService from '../services/billing.js';
import { applyTenantToIndex, deleteDocument } from '../services/elasticsearch/ElasticSearch.js';
import { putOnHoldByCustomer } from '../services/subscriptions/putOnHoldByCustomer.js';
import { putOffHoldByCustomer } from '../services/subscriptions/putOffHoldByCustomer.js';
import getPhoneNumbers from '../services/customer/utils/getPhoneNumbers.js';
import getMainPhoneNumber from '../services/customer/utils/getMainPhoneNumber.js';

import {
  camelCaseKeys,
  addressFields,
  phoneNumberFields,
  unambiguousCondition,
  processVal,
} from '../utils/dbHelpers.js';
import { mathRound2 } from '../utils/math.js';
import { joinAddress } from '../utils/joinAddress.js';
import { joinPhoneNumbers } from '../utils/joinPhoneNumbers.js';

import ApiError from '../errors/ApiError.js';

import { customerFields } from '../consts/customerFields.js';
import { CUSTOMER_SORTING_ATTRIBUTE } from '../consts/customerSortingAttributes.js';
import { TENANT_INDEX } from '../consts/searchIndices.js';
import { CUSTOMER_GROUP_TYPE } from '../consts/customerGroups.js';
import { LEVEL_APPLIED } from '../consts/purchaseOrder.js';
import { CUSTOMER_STATUS } from '../consts/customerStatuses.js';
import { SUBSCRIPTION_STATUS } from '../consts/subscriptionStatuses.js';
import { RECURRENT_TEMPLATE_STATUS } from '../consts/recurrentOrderTemplates.js';
import { SORT_ORDER } from '../consts/sortOrders.js';
import { pricingGetInvoicedOrder, pricingGetSubscriptionsToInvoice } from '../services/pricing.js';
import { getAllPaginatedQuery } from './subscription/queries/getAllPaginatedQuery.js';
import SubscriptionRepository from './subscription/subscription.js';
import LinkedCustomersRepository from './linkedCustomers.js';
import JobSiteRepository from './jobSite.js';
import RecurrentOrderTemplateRepo from './recurrentOrderTemplate.js';
import PurchaseOrderRepo from './purchaseOrder.js';
import ProjectRepository from './project.js';
import PhoneNumberRepository from './phoneNumber.js';
import CustomerGroupRepository from './customerGroup.js';
import BusinessUnitRepository from './businessUnit.js';
import BrokerRepository from './broker.js';
import CustomerJobSitePairRepo from './customerJobSitePair.js';
import ContactRepository from './contact.js';
import VersionedRepository from './_versioned.js';
import TermsAndConditionsRepository from './termsAndConditions.js';

const contactFields = ['firstName', 'lastName', 'email', 'phoneNumbers'];
const mainContactFields = [
  'mainFirstName',
  'mainLastName',
  'mainJobTitle',
  'mainEmail',
  'mainPhoneNumbers',
];

const TABLE_NAME = 'customers';

const pickPhoneNumbers = compose(pick(phoneNumberFields), camelCaseKeys);
const getCustomerContact = data => omit(data, ['jobTitle', 'phoneNumbers']);

const filterOutTechField = obj =>
  omit(obj, ['id', 'createdAt', 'updatedAt', 'created_at', 'updated_at']);

const customerInvoiceSubscription = [
  'id',
  'first_name',
  'last_name',
  'name',
  'business_name',
  'invoice_construction',
  'billing_cycle',
  'on_account',
  'is_autopay_exist',
  'autopay_type',
  'attach_ticket_pref',
  'attach_media_pref',
  'full_billing_address',
  'balance',
  'full_mailing_address',
  'mailing_address_line_1',
  'mailing_address_line_2',
  'mailing_city',
  'mailing_state',
  'mailing_zip',
  'billing_address_line_1',
  'billing_address_line_2',
  'billing_city',
  'billing_state',
  'billing_zip',
  'customer_group_id',
  'billing_note',
];

class CustomerRepository extends VersionedRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
  }

  static get filterOutTechFields() {
    return filterOutTechField;
  }

  isCommercial(customer) {
    return !!customer.businessName;
  }

  mapFields(originalObj, skipAddress) {
    return compose(
      obj => {
        ['customerGroup', 'owner', 'businessUnit'].forEach(field => {
          if (obj[field]) {
            obj[field] = camelCaseKeys(obj[field]);
          } else {
            delete obj[field];
          }
        });

        const numeric = ['creditLimit', 'financeCharge', 'balance'];
        Object.entries(obj).forEach(([key, value]) => {
          if (!skipAddress && (key.startsWith('mailing') || key.startsWith('billing'))) {
            const addressField = camelCase(key.slice(7));
            // i.e. filter out 'billingCycle'
            if (addressFields.includes(addressField)) {
              const field = key.startsWith('mailing') ? 'mailingAddress' : 'billingAddress';
              if (obj[field]) {
                obj[field][addressField] = value;
              } else {
                obj[field] = { [addressField]: value };
              }
              delete obj[key];
            }
          } else if (numeric.includes(key)) {
            obj[key] = mathRound2(Number(value || 0));
          }
        });

        if (!isEmpty(obj.contactData)) {
          const customerPhoneNumbersArr = obj.customerPhoneNumbersArr?.length
            ? obj.customerPhoneNumbersArr.filter(Boolean)
            : [];
          const contactPhoneNumbersArr = obj.contactPhoneNumbersArr?.length
            ? obj.contactPhoneNumbersArr.filter(Boolean)
            : [];

          const contact = camelCaseKeys(obj.contactData);
          // identify commercial customer or not
          if (obj.businessName) {
            Object.assign(obj, {
              mainFirstName: contact.firstName,
              mainLastName: contact.lastName,
              mainJobTitle: contact.jobTitle,
              mainEmail: contact.email,
              mainCustomerPortalUser: contact.customerPortalUser,
              mainPhoneNumbers: contactPhoneNumbersArr.map(pickPhoneNumbers),
              phoneNumbers: customerPhoneNumbersArr.map(pickPhoneNumbers),
            });
          } else {
            Object.assign(
              obj,
              pick(['firstName', 'lastName', 'jobTitle', 'email', 'customerPortalUser'])(contact),
              {
                phoneNumbers: contactPhoneNumbersArr.map(pickPhoneNumbers),
              },
            );
          }
        }

        delete obj.contactData;
        delete obj.contactPhoneNumbersArr;
        delete obj.customerPhoneNumbersArr;

        return obj;
      },
      super.mapJoinedFields,
      camelCaseKeys,
      super.mapFields,
    )(originalObj);
  }

  async createOne({ data, commercial, tenantId, fields = ['*'], log } = {}, trx) {
    const contactRepo = ContactRepository.getInstance(this.ctxState);
    let customer;
    let contact;
    let contactData;
    let customerId;
    let phoneNumbers = [];
    const { businessUnitId } = data;

    const _trx = trx || (await this.knex.transaction());

    try {
      this.pickAddressFields(data);

      ({ contactData, phoneNumbers } = this.pickContactFields(data, commercial));

      // add contact first without customer id linkage
      contact = await contactRepo.createOne(
        {
          data: Object.assign(contactData, { main: true, active: true }),
          businessUnitId,
          fields: ['*'],
        },
        _trx,
      );

      const { id: contactId } = contact;
      data.contactId = contactId;

      // add customer with contact id
      customer = await super.createOne(
        {
          data: omit(data, ['phoneNumbers', 'purchaseOrders', ...mainContactFields]),
          fields,
        },
        _trx,
      );

      // link contact and phoneNumbers
      customerId = customer.id;
      const pnRepo = PhoneNumberRepository.getInstance(this.ctxState);

      let newPhoneNumbers;
      // eslint-disable-next-line prefer-const
      [contact, ...newPhoneNumbers] = await Promise.all([
        contactRepo.updateBy(
          {
            condition: { id: contactId },
            data: {
              customerId,
              main: true,
              active: true,
              phoneNumbers: contact.phoneNumbers,
            },
            businessUnitId,
            tenantId,
            fields: ['*'],
          },
          _trx,
        ),
        ...(isEmpty(phoneNumbers)
          ? [Promise.resolve()]
          : // commercial type case
            phoneNumbers.map(phoneNumber =>
              pnRepo.createOne({ data: Object.assign(phoneNumber, { customerId }) }, _trx),
            )),
      ]);

      this.formatResultObj(customer, contact, newPhoneNumbers, commercial);

      if (data.purchaseOrders) {
        const purchaseOrders = await Promise.all(
          data.purchaseOrders.map(po =>
            PurchaseOrderRepo.getInstance(this.ctxState).createOne(
              {
                data: {
                  ...po,
                  customerId,
                  levelApplied: [LEVEL_APPLIED.customer],
                },
              },
              _trx,
            ),
          ),
        );

        customer.purchaseOrders = purchaseOrders;
      }

      const businessUnit = await BusinessUnitRepository.getInstance(this.ctxState).getById(
        { id: businessUnitId, fields: ['nameLine1'] },
        trx,
      );
      customer.businessUnitName = businessUnit.nameLine1;

      if (!trx) {
        await _trx.commit();
      }
    } catch (error) {
      if (!trx) {
        await _trx.rollback();
      }

      throw error;
    }

    if (log) {
      this.log({ id: customerId, action: this.logAction.create });
      contact &&
        this.log({
          id: contact.id,
          action: this.logAction.create,
          entity: this.logEntity.contacts,
          repo: contactRepo,
        });
    }

    const item = this.mapFields(VersionedRepository.getFields(customer, fields));
    if (item) {
      const customerPhoneNumbers = getPhoneNumbers(phoneNumbers);
      const mainPhoneNumbers = getPhoneNumbers(contactData.phoneNumbers);

      this.index(customer, getCustomerContact(contactData), [
        ...mainPhoneNumbers,
        ...customerPhoneNumbers,
      ]);

      item.mainPhoneNumber = getMainPhoneNumber(
        commercial ? phoneNumbers : contactData.phoneNumbers,
      );
    }

    return item;
  }

  index(customer, customerContact, customerPhoneNumbers) {
    const indexName = applyTenantToIndex(TENANT_INDEX.customers, this.schemaName);
    const data = this.mapToIndex(customer, customerContact, customerPhoneNumbers);

    publish(this.getCtx(), this.schemaName, indexName, data);
  }

  async updateOne(
    { condition: { id }, data, commercial, fields = ['*'], concurrentData, tenantId, log } = {},
    trx,
  ) {
    const contactRepo = ContactRepository.getInstance(this.ctxState);
    const { businessUnitId, contactId } = data;
    let customer;
    let contactData;
    let contact;
    let phoneNumbers;

    const _trx = trx || (await this.knex.transaction());

    try {
      this.pickAddressFields(data);

      ({ contactData, phoneNumbers } = this.pickContactFields(data, commercial));
      const { isAutopayExist } = data;

      const dataToUpdate = {
        // this nulling obj allows to clear unrelated fields in case of new customer type
        firstName: null,
        lastName: null,
        businessName: null,
        poRequired: false,
        ...omit(data, [
          'customerTypeUpdate',
          'phoneNumbers',
          'autopayCreditCardId',
          'defaultPurchaseOrders',
          ...mainContactFields,
        ]),
      };

      if (isAutopayExist === false) {
        dataToUpdate.autopayType = null;
      }

      const pnRepo = PhoneNumberRepository.getInstance(this.ctxState);
      let updatedPhoneNumbers;
      if (commercial) {
        updatedPhoneNumbers = await pnRepo.updateMany(
          {
            data: phoneNumbers.length ? phoneNumbers : [],
            condition: { customerId: id, contactId: null },
          },
          _trx,
        );
      } else {
        const { customerPortalUser, email } =
          (await contactRepo.getBy({ condition: { id: data.contactId } }, _trx)) || {};

        if (customerPortalUser) {
          contactData.email = email;
          dataToUpdate.email = email;
        }
      }

      [contact, customer] = await Promise.all([
        contactRepo.updateBy(
          {
            condition: { id: contactId },
            data: contactData,
            businessUnitId,
            tenantId,
            log,
          },
          _trx,
        ),
        super.updateBy(
          {
            condition: { id },
            concurrentData,
            data: dataToUpdate,
            fields: log ? '*' : fields,
          },
          _trx,
        ),
      ]);

      const { poRequired, signatureRequired } = data;
      if (id && (poRequired || signatureRequired)) {
        const repo = CustomerJobSitePairRepo.getInstance(this.ctxState);
        const count = await repo.count({ condition: { customerId: id } }, _trx);

        if (count) {
          const cjsData = {};
          if (poRequired) {
            cjsData.poRequired = true;
          }
          if (signatureRequired) {
            cjsData.signatureRequired = true;
          }

          await repo.updateBy(
            {
              condition: { customerId: id, jobSiteId: '*' },
              data: cjsData,
              fields: [],
              log,
            },
            _trx,
          );
        }
      }

      await this.proceedPurchaseOrders(
        { purchaseOrders: data.defaultPurchaseOrders, customerId: id },
        _trx,
      );

      this.formatResultObj(customer, contact, updatedPhoneNumbers, commercial);

      const businessUnit = await BusinessUnitRepository.getInstance(this.ctxState).getById(
        { id: businessUnitId, fields: ['nameLine1'] },
        trx,
      );
      customer.businessUnitName = businessUnit.nameLine1;

      if (!trx) {
        await _trx.commit();
      }
    } catch (error) {
      if (!trx) {
        await _trx.rollback();
      }

      throw error;
    }

    log && this.log({ id: customer.id, action: this.logAction.modify });
    contact &&
      this.log({
        id: contact.id,
        action: this.logAction.modify,
        entity: this.logEntity.contacts,
        repo: contactRepo,
      });

    const item = this.mapFields(VersionedRepository.getFields(customer, fields));
    if (item) {
      const customerPhoneNumbers = getPhoneNumbers(phoneNumbers) ?? [];
      const mainPhoneNumbers = getPhoneNumbers(contactData.phoneNumbers) ?? [];

      this.index(customer, getCustomerContact(contactData), [
        ...mainPhoneNumbers,
        ...customerPhoneNumbers,
      ]);

      item.mainPhoneNumber = getMainPhoneNumber(
        commercial ? phoneNumbers : contactData.phoneNumbers,
      );
    }

    return item;
  }

  async customersCount({ condition = {}, customerGroupIds = [], skipFilteredTotal = false } = {}) {
    const [total, filteredTotal, ...countByType] = await Promise.all([
      this.count({ condition: { ...condition, filters: {} } }),
      skipFilteredTotal ? Promise.resolve(undefined) : this.count({ condition }),
      ...customerGroupIds.map(id =>
        this.count({ condition: { ...condition, customerGroupId: id } }),
      ),
    ]);

    return {
      total,
      filteredTotal,
      customerGroupIds: customerGroupIds.reduce(
        // eslint-disable-next-line no-restricted-syntax, no-sequences
        (obj, id, i) => ((obj[id] = countByType[i]), obj),
        {},
      ),
    };
  }

  async count(
    { condition: { businessUnitId, filters, ids, searchId, searchQuery, ...condition } = {} } = {},
    trx = this.knex,
  ) {
    let query = trx(this.tableName)
      .withSchema(this.schemaName)
      .where(unambiguousCondition(this.tableName, condition));

    const performTextSearch = searchQuery?.length >= 3;
    query = performTextSearch
      ? query.countDistinct(`${this.tableName}.id`)
      : query.count(`${this.tableName}.id`);

    query = this.applySearchToQuery(query, { searchId, searchQuery, performTextSearch });
    query = this.applyFiltersToQuery(query, { ...filters, businessUnitId, ids });

    const result = await query;

    return Number(result?.[0]?.count) || 0;
  }

  async getBy({ condition, fields = ['*'], skipAddressParsing = false } = {}, trx = this.knex) {
    let { query } = await this.populateDataQuery(fields, trx);
    if (this.tableName === this.historicalTableName) {
      query = query.orderBy(`${this.tableName}.id`, 'desc');
    }

    const obj = await query.where(unambiguousCondition(this.tableName, condition)).first();
    if (isEmpty(obj)) {
      return null;
    }

    if (fields[0] === '*' || fields.includes('tcId')) {
      if (obj.tcId) {
        obj.hasTerm = obj.zzzTermsAndConditionsdottcAck;
      }
    }

    if (fields[0] === '*' || fields.includes('purchaseOrders')) {
      obj.purchaseOrders = await PurchaseOrderRepo.getInstance(this.ctxState).getAll({
        condition: {
          customerId: obj.id,
          isDefaultByCustomer: true,
        },
      });
    }

    if (fields[0] === '*' || fields.includes('phoneNumbers')) {
      const repo = PhoneNumberRepository.getInstance(this.ctxState);
      [obj.contactPhoneNumbersArr, obj.customerPhoneNumbersArr] = await Promise.all([
        repo.getAll({ condition: { contactId: obj.contactId } }),
        repo.getAll({ condition: { customerId: obj.id } }),
      ]);
    }

    if (fields[0] === '*' || fields.includes('linkedCustomers')) {
      obj.linkedCustomers = await LinkedCustomersRepository.getInstance(
        this.ctxState,
      ).getLinkedCustomers(obj.id);
    }

    return this.mapFields(obj, skipAddressParsing);
  }

  static getCustomersGridFields() {
    return [...customerFields, 'subscriptionsCount'];
  }

  async getAllPaginated(
    {
      condition: { ids, businessUnitId, filters, searchId, searchQuery, ...condition } = {},
      skip = 0,
      limit = 25,
      sortBy = CUSTOMER_SORTING_ATTRIBUTE.name,
      sortOrder = SORT_ORDER.asc,
      fields = customerFields,
    } = {},
    trx = this.knex,
  ) {
    const performSearch = searchId || searchQuery?.length >= 3;
    let { query } = await this.populateDataQuery(fields, trx, { performSearch });

    const sortField = this.customerSortBy(sortBy);

    if (sortBy === 'hasTerm') {
      if (sortOrder === 'asc') {
        query = query
          .orderByRaw(`${sortField} ASC  NULLS FIRST`)
          .orderByRaw(`"${this.tableName}"."tc_id" DESC NULLS FIRST`);
      } else {
        query = query
          .orderByRaw(`${sortField} DESC  NULLS LAST`)
          .orderByRaw(`"${this.tableName}"."tc_id" DESC NULLS LAST`);
      }
    } else {
      query = query.offset(skip).limit(limit).orderBy(sortField, sortOrder);
    }

    query = this.applySearchToQuery(query, {
      searchId,
      searchQuery,
      performTextSearch: searchQuery?.length >= 3,
    });
    query = this.applyFiltersToQuery(query, { ids, businessUnitId, ...filters });

    if (!isEmpty(condition)) {
      query = query.andWhere(unambiguousCondition(this.tableName, condition));
    }

    console.log(query.toSQL());
    const items = await query;
    if (isEmpty(items)) {
      return [];
    }

    if (fields[0] === '*' || fields.includes('tcId')) {
      items.map(obj => {
        if (obj.tcId && obj.zzzTermsAndConditionsdottcAck) {
          obj.hasTerm = obj.zzzTermsAndConditionsdottcAck;
        } else {
          obj.hasTerm = false;
        }
        return obj;
      });
    }

    if (fields[0] === '*' || fields.includes('purchaseOrders')) {
      await Promise.all(
        items.map(async obj => {
          obj.purchaseOrders = await PurchaseOrderRepo.getInstance(this.ctxState).getAll(
            { condition: { customerId: obj.id } },
            trx,
          );
        }),
      );
    }

    if (fields[0] === '*' || fields.includes('phoneNumbers')) {
      const repo = PhoneNumberRepository.getInstance(this.ctxState);

      await Promise.all(
        items.map(async obj => {
          [obj.contactPhoneNumbersArr, obj.customerPhoneNumbersArr] = await Promise.all([
            repo.getAllPaginated({ condition: { contactId: obj.contactId } }, trx),
            repo.getAllPaginated({ condition: { customerId: obj.id } }, trx),
          ]);
        }),
      );
    }

    if (fields[0] === '*' || fields.includes('subscriptionsCount')) {
      await Promise.all(
        items.map(async obj => {
          const subscriptions = await getAllPaginatedQuery(
            trx,
            SubscriptionRepository.TABLE_NAME,
            this.schemaName,
            {
              condition: {
                status: [SUBSCRIPTION_STATUS.active],
                customerId: obj.id,
              },
            },
          );

          obj.activeSubscriptionsCount = subscriptions?.length ?? 0;
        }),
      );
    }

    return items.map(item => this.mapFields(item, false));
  }

  applySearchToQuery(originalQuery, { searchId, searchQuery, performTextSearch }) {
    let query = originalQuery;

    if (performTextSearch) {
      query = query
        .leftJoin(
          CustomerJobSitePairRepo.TABLE_NAME,
          `${this.tableName}.id`,
          `${CustomerJobSitePairRepo.TABLE_NAME}.customerId`,
        )
        .leftJoin(
          ProjectRepository.TABLE_NAME,
          `${CustomerJobSitePairRepo.TABLE_NAME}.id`,
          `${ProjectRepository.TABLE_NAME}.customerJobSiteId`,
        )
        .leftJoin(
          JobSiteRepository.TABLE_NAME,
          `${CustomerJobSitePairRepo.TABLE_NAME}.jobSiteId`,
          `${JobSiteRepository.TABLE_NAME}.id`,
        );
    }

    query = query.andWhere(builder => {
      if (searchId) {
        builder.orWhere(`${this.tableName}.id`, searchId);
      }

      if (performTextSearch) {
        builder
          .orWhereRaw('??.name % ?', [this.tableName, searchQuery])
          .orderByRaw('??.name <-> ?', [this.tableName, searchQuery]);

        builder
          .orWhereRaw('??.email % ?', [this.tableName, searchQuery])
          .orderByRaw('??.email <-> ?', [this.tableName, searchQuery]);

        builder
          .orWhereRaw('? <% ??.full_mailing_address', [searchQuery, this.tableName])
          .orderByRaw('? <<-> ??.full_mailing_address', [searchQuery, this.tableName]);

        builder
          .orWhereRaw('? <% ??.full_billing_address', [searchQuery, this.tableName])
          .orderByRaw('? <<-> ??.full_billing_address', [searchQuery, this.tableName]);

        builder
          .orWhereRaw('??.description % ?', [ProjectRepository.TABLE_NAME, searchQuery])
          .orderByRaw('??.description <-> ?', [ProjectRepository.TABLE_NAME, searchQuery]);

        builder
          .orWhereRaw('? <% ??.full_address', [searchQuery, JobSiteRepository.TABLE_NAME])
          .orderByRaw('? <<-> ??.full_address', [searchQuery, JobSiteRepository.TABLE_NAME]);
      }

      return builder;
    });

    return query;
  }

  applyFiltersToQuery(
    originalQuery,
    {
      ids,
      businessUnitId,
      filterByBrokers,
      filterByBalanceFrom,
      filterByBalanceTo,
      filterByPaymentTerms,
      filterByInvoiceConstruction,
      filterByZipCodes,
      filterByType,
      filterByGroup,
      filterByState,
      filterBySelfServiceOrderAllowed,
      filterByOnAccount,
      filterByHaulerSrn,
    } = {},
  ) {
    let query = originalQuery;

    if (!isEmpty(ids)) {
      query = query.whereIn(`${this.tableName}.id`, ids);
    }

    if (businessUnitId) {
      query = query.andWhere(`${this.tableName}.businessUnitId`, businessUnitId);
    }

    if (filterByBrokers?.length) {
      query = query.andWhere(builder =>
        builder.whereIn(`${this.tableName}.ownerId`, filterByBrokers),
      );
    }

    if (typeof filterByBalanceFrom === 'number') {
      query = query.andWhere(`${this.tableName}.balance`, '>=', filterByBalanceFrom);
    }

    if (typeof filterByBalanceTo === 'number') {
      query = query.andWhere(`${this.tableName}.balance`, '<=', filterByBalanceTo);
    }

    if (filterByZipCodes?.length) {
      query = query.andWhere(builder =>
        builder
          .whereIn(`${this.tableName}.billingZip`, filterByZipCodes)
          .orWhereIn(`${this.tableName}.mailingZip`, filterByZipCodes),
      );
    }

    if (filterByInvoiceConstruction?.length) {
      query = query.whereIn(`${this.tableName}.invoiceConstruction`, filterByInvoiceConstruction);
    }

    if (filterByPaymentTerms?.length) {
      query = query.whereIn(`${this.tableName}.paymentTerms`, filterByPaymentTerms);
    }

    if (filterByType?.length) {
      query = query.andWhere(builder => {
        if (filterByType.includes(CUSTOMER_GROUP_TYPE.commercial)) {
          builder.orWhere(qb =>
            qb.whereNotNull(`${this.tableName}.businessName`).andWhere({ walkup: false }),
          );
        }

        if (filterByType.includes(CUSTOMER_GROUP_TYPE.nonCommercial)) {
          builder.orWhereNull(`${this.tableName}.businessName`);
        }

        if (filterByType.includes(CUSTOMER_GROUP_TYPE.walkUp)) {
          builder.orWhere({ walkup: true });
        }

        return builder;
      });
    }

    if (filterByGroup?.length) {
      query = query.whereIn('customerGroupId', filterByGroup);
    }

    if (filterByState?.length) {
      query = query.whereIn(`${this.tableName}.status`, filterByState);
    }

    if (isBoolean(filterBySelfServiceOrderAllowed)) {
      query = query.andWhere(
        `${this.tableName}.selfServiceOrderAllowed`,
        filterBySelfServiceOrderAllowed,
      );
    }

    if (isBoolean(filterByOnAccount)) {
      query = query.andWhere(`${this.tableName}.onAccount`, filterByOnAccount);
    }

    if (filterByHaulerSrn) {
      if (Array.isArray(filterByHaulerSrn)) {
        query = query.whereIn(`${this.tableName}.haulerSrn`, filterByHaulerSrn);
      } else {
        query = query.andWhere(`${this.tableName}.haulerSrn`, filterByHaulerSrn);
      }
    }

    return query;
  }

  async deleteBy({ condition, log } = {}) {
    await super.deleteBy({ condition });

    log && this.log({ id: condition.id, action: this.logAction.delete });

    deleteDocument(this.ctxState, applyTenantToIndex(TENANT_INDEX.customers, this.schemaName), {
      id: condition.id,
    });
  }

  async changeCustomerStatus({
    id,
    status,
    shouldUnholdTemplates,
    log,
    reason,
    reasonDescription,
    holdSubscriptionUntil,
    onHoldNotifySalesRep,
    onHoldNotifyMainContact,
    ctx,
  } = {}) {
    let customer;

    const trx = await this.knex.transaction();

    try {
      customer = await this.getBy({ condition: { id } }, trx);

      if (status === CUSTOMER_STATUS.inactive) {
        const [subscriptions, recurrentOrderTemplates, deferredPayments] = await Promise.all([
          getAllPaginatedQuery(trx, SubscriptionRepository.TABLE_NAME, this.schemaName, {
            condition: {
              status: [SUBSCRIPTION_STATUS.active, SUBSCRIPTION_STATUS.onHold],
              customerId: id,
            },
          }),
          RecurrentOrderTemplateRepo.getInstance(this.ctxState).getRecurrentOrdersByStatus(
            {
              customerId: id,
              statuses: [RECURRENT_TEMPLATE_STATUS.active, RECURRENT_TEMPLATE_STATUS.onHold],
            },
            trx,
          ),
          billingService.getDeferredPaymentsByCustomer(ctx, {
            customerId: id,
          }),
        ]);

        if (subscriptions?.length || recurrentOrderTemplates?.length || deferredPayments?.length) {
          throw ApiError.conflict('Customer has active/onHold subscriptions/recurrent orders');
        }
      }

      await this.updateBy(
        {
          condition: { id },
          data: { status },
          log,
        },
        trx,
      );

      if (status === CUSTOMER_STATUS.onHold) {
        await putOnHoldByCustomer(
          ctx,
          {
            customerId: id,
            reason,
            reasonDescription,
            holdSubscriptionUntil,
            onHoldNotifySalesRep,
            onHoldNotifyMainContact,
          },
          trx,
        );
        await RecurrentOrderTemplateRepo.getInstance(
          this.ctxState,
        ).holdCustomerRecurrentOrderTemplates(
          {
            condition: { customerId: id, status: SUBSCRIPTION_STATUS.active },
            status: SUBSCRIPTION_STATUS.onHold,
            onHoldNotifySalesRep,
            onHoldNotifyMainContact,
          },
          trx,
        );
      } else if (status === CUSTOMER_STATUS.active && shouldUnholdTemplates) {
        await putOffHoldByCustomer(ctx, { customerId: id, reason, reasonDescription }, trx);
        await RecurrentOrderTemplateRepo.getInstance(
          this.ctxState,
        ).holdCustomerRecurrentOrderTemplates(
          {
            condition: { customerId: id, status: SUBSCRIPTION_STATUS.onHold },
            status: SUBSCRIPTION_STATUS.active,
          },
          trx,
        );
      }

      customer = await this.getBy({ condition: { id } }, trx);
      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }

    if (customer) {
      const { contactData, phoneNumbers } = this.pickContactFields(
        customer,
        this.isCommercial(customer),
      );

      const customerPhoneNumbers = getPhoneNumbers(phoneNumbers);
      const mainPhoneNumbers = getPhoneNumbers(contactData.phoneNumbers);

      this.index(customer, getCustomerContact(contactData), [
        ...mainPhoneNumbers,
        ...customerPhoneNumbers,
      ]);
    }

    return customer;
  }

  async getLinkedWithJobSitePaginated({
    condition: { jobSiteId, ...condition },
    skip = 0,
    limit = 6,
  } = {}) {
    const fields = [
      'id',
      'businessName',
      'name',
      'mailingAddressLine1',
      'mailingAddressLine2',
      'mailingCity',
      'mailingState',
      'mailingZip',
      'billingAddressLine1',
      'billingAddressLine2',
      'billingCity',
      'billingState',
      'billingZip',
      'contactId',
      'phoneNumbers',
      'creditLimit',
      'customerGroupId',
      'status',
      // 'balance',
    ];

    let { query } = await this.populateDataQuery(fields);
    query = query
      .innerJoin(
        CustomerJobSitePairRepo.TABLE_NAME,
        `${CustomerJobSitePairRepo.TABLE_NAME}.customerId`,
        `${this.tableName}.id`,
      )
      .where(unambiguousCondition(this.tableName, condition))
      .andWhere(`${CustomerJobSitePairRepo.TABLE_NAME}.jobSiteId`, jobSiteId)
      .andWhere(`${CustomerJobSitePairRepo.TABLE_NAME}.active`, true);

    const items = await query.limit(limit).offset(skip);

    return items?.map(item => this.mapFields(item, false)) ?? [];
  }

  async populateDataQuery(sourceFields, trx = this.knex, { performSearch = false } = {}) {
    let query = trx(this.tableName).withSchema(this.schemaName);

    const fieldsToOmitOnSelect = ['phoneNumbers', 'subscriptionsCount'];

    const fields = sourceFields.filter(field => !fieldsToOmitOnSelect.includes(field));

    performSearch && fields[0] === 'id' && fields.shift();
    const selects = fields.map(field => `${this.tableName}.${field}`);
    performSearch && selects.unshift(trx.raw('distinct(??.id)', [this.tableName]));

    if (fields[0] === '*' || fields.includes('customerGroupId')) {
      const jtName = CustomerGroupRepository.TABLE_NAME;
      const joinedTableColumns = await CustomerGroupRepository.getInstance(
        this.ctxState,
      ).getColumnsToSelect('customerGroup');

      selects.push(...joinedTableColumns);
      query = query.innerJoin(jtName, `${jtName}.id`, `${this.tableName}.customerGroupId`);
    }

    if (fields[0] === '*' || fields.includes('ownerId')) {
      const jtName = BrokerRepository.TABLE_NAME;
      const joinedTableColumns = await BrokerRepository.getInstance(
        this.ctxState,
      ).getColumnsToSelect('owner');

      selects.push(...joinedTableColumns);
      query = query.leftJoin(jtName, `${jtName}.id`, `${this.tableName}.ownerId`);
    }

    if (fields[0] === '*' || fields.includes('tcId')) {
      const jtName = TermsAndConditionsRepository.TABLE_NAME;
      const joinedTableColumns = await TermsAndConditionsRepository.getInstance(
        this.ctxState,
      ).getColumnsToSelect('TermsAndConditions');

      selects.push(...joinedTableColumns);
      query = query.leftJoin(jtName, `${jtName}.id`, `${this.tableName}.tcId`);
    }

    if (fields[0] === '*' || fields.includes('contactId')) {
      const jtName = ContactRepository.TABLE_NAME;
      const joinedTableColumns = await ContactRepository.getInstance(
        this.ctxState,
      ).getColumnsToSelect('contactData');

      selects.push(...joinedTableColumns);
      query = query.innerJoin(jtName, `${jtName}.id`, `${this.tableName}.contactId`);
    }

    if (fields[0] === '*' || fields.includes('businessUnitId')) {
      const jtName = BusinessUnitRepository.TABLE_NAME;
      const joinedTableColumns = await BusinessUnitRepository.getInstance(
        this.ctxState,
      ).getColumnsToSelect('businessUnit');

      selects.push(...joinedTableColumns);
      query = query.leftJoin(jtName, `${jtName}.id`, `${this.tableName}.businessUnitId`);
    }

    return { query: query.select(...selects) };
  }

  pickAddressFields(data) {
    Object.assign(
      data,
      Object.entries(data.mailingAddress).reduce((obj, [key, value]) => {
        obj[`mailing${startCase(key)}`] = value;
        return obj;
      }, {}),
      Object.entries(data.billingAddress).reduce((obj, [key, value]) => {
        obj[`billing${startCase(key)}`] = value;
        return obj;
      }, {}),
    );
    delete data.mailingAddress;
    delete data.billingAddress;
  }

  async getCustomersForInvoicing({ condition = {} }) {
    const orders = await pricingGetInvoicedOrder(this.getCtx(), { data: condition });
    if (!orders.length === 0) {
      return [];
    }
    // pre-pricing service refactor code:
    // const items = await this.knex(orderTn)
    //   .withSchema(this.schemaName)
    //   .select(`${customersHt}.originalId as id`)
    //   .innerJoin(customersHt, `${customersHt}.id`, `${orderTn}.customerId`)
    //   .distinctOn(`${customersHt}.originalId`)
    //   .whereIn(`${orderTn}.status`, [ORDER_STATUS.canceled, ORDER_STATUS.finalized])
    //   .andWhere(unambiguousCondition(orderTn, condition));

    // const customerIds = items?.map(({ id }) => id);
    // if (customerIds?.length) {
    //   const customers = await this.knex(this.tableName)
    //     .withSchema(this.schemaName)
    //     .whereIn('id', customerIds)
    //     .orderBy('name', 'asc');
    // end of pre-pricing service refactor code
    // added by pricing service refactor
    const customersIds = orders?.map(({ originalCustomerId }) => originalCustomerId);
    // end of added by pricing service refactor
    if (customersIds?.length) {
      const customers = await this.knex(this.tableName)
        .withSchema(this.schemaName)
        .whereIn('id', customersIds)
        .orderBy('name', 'asc');
      return customers?.length ? customers : [];
    }
    return [];
  }

  async customersOrdersSubscriptionInvoicing({ condition = {} }) {
    const orders = await pricingGetInvoicedOrder(this.getCtx(), { data: condition });
    const subscriptions = await pricingGetSubscriptionsToInvoice(this.getCtx(), {
      data: condition,
    });

    const customersIds = orders?.map(({ originalCustomerId }) => originalCustomerId);
    const subscriptionsIds = subscriptions?.map(({ customerId }) => customerId);
    const toInvoiceCustomersIds = [...customersIds, ...subscriptionsIds];
    // pre-pricing service refactor code:
    //   .select([`${this.tableName}.id`, `${this.tableName}.name`, `${this.tableName}.status`])
    //   .where(`${customersHt}.business_unit_id`, condition.businessUnitId)
    //   .where(q => {
    //     q.orWhereIn(`${orderTn}.status`, [ORDER_STATUS.canceled, ORDER_STATUS.finalized])
    //       .orWhereIn(`${subscriptionTn}.status`, [
    //         SUBSCRIPTION_STATUS.active,
    //         SUBSCRIPTION_STATUS.closed,
    //       ])
    //       .orWhere(unambiguousCondition(orderTn, condition))
    //       .orWhere(unambiguousCondition(subscriptionTn, condition));
    //   })
    //   // in case of change take into account on distinct and random without sorting
    //   .distinctOn(`${customersHt}.originalId`)

    //   .leftJoin(orderTn, `${customersHt}.id`, `${orderTn}.customerId`)
    //   .leftJoin(subscriptionTn, `${customersHt}.id`, `${subscriptionTn}.customerId`)
    //   .innerJoin(this.tableName, `${this.tableName}.id`, `${customersHt}.originalId`)

    //   .limit(limit);
    // return items;
    // end of pre-pricing service refactor code
    // added for pricing:
    if (toInvoiceCustomersIds?.length) {
      const customers = await this.knex(this.tableName)
        .withSchema(this.schemaName)
        .whereIn('id', toInvoiceCustomersIds)
        .orderBy('name', 'asc');
      return customers?.length ? customers : [];
    }
    return [];
    // end of added for pricing
  }

  pickContactFields(data, commercial) {
    let contactData;
    let phoneNumbers = [];

    if (!commercial) {
      contactData = pick([...contactFields, 'id'])(data);
    } else {
      ({ phoneNumbers = [] } = data);

      const obj = pick([...mainContactFields, 'id'])(data);

      contactData = {
        id: obj.id,
        firstName: obj.mainFirstName,
        lastName: obj.mainLastName,
        jobTitle: obj.mainJobTitle,
        email: obj.mainEmail,
        phoneNumbers: data.mainPhoneNumbers,
      };
    }

    return { contactData, phoneNumbers };
  }

  mapToIndex(customer, customerContact, customerPhoneNumbers) {
    return {
      ...pick([
        'id',
        'businessUnitId',
        'businessUnitName',
        'firstName',
        'lastName',
        'name', // for commercial it's business name, otherwise - person name
        'email',
        'status',
      ])(customer),
      status: customer.status,
      updatedAt: customer.updatedAt || new Date(),
      mailingAddress: joinAddress(customer.mailingAddress),
      billingAddress: joinAddress(customer.billingAddress),
      phoneNumbers: joinPhoneNumbers(customerPhoneNumbers),
      contactName: `${customerContact.firstName || ''} ${customerContact.lastName || ''}`.trim(),
      contactEmail: customerContact.email,
    };
  }

  formatResultObj(customer, contact, phoneNumbers, commercial) {
    const pickConcat = pick(contactFields);
    if (!commercial) {
      Object.assign(customer, pickConcat(contact), {
        phoneNumbers: contact.phoneNumbers,
      });
    } else {
      const mainContact = pickConcat(contact);
      Object.assign(customer, {
        mainFirstName: mainContact.firstName,
        mainLastName: mainContact.lastName,
        mainJobTitle: mainContact.jobTitle,
        mainEmail: mainContact.email,

        mainPhoneNumbers: contact.phoneNumbers,
      });

      customer.phoneNumbers = isEmpty(phoneNumbers)
        ? []
        : phoneNumbers.map(pick(phoneNumberFields));
    }
  }

  async getGroups(ids) {
    const items = await this.knex(this.tableName)
      .withSchema(this.schemaName)
      .whereIn(`${this.tableName}.id`, ids)
      .join(
        `${CustomerGroupRepository.TABLE_NAME} as cg`,
        'cg.id',
        `${this.tableName}.customerGroupId`,
      )
      .select(['cg.*', `${this.tableName}.id as customerId`]);
    return items;
  }

  async getGroupByCustomerId(id) {
    const item = await this.knex(this.tableName)
      .withSchema(this.schemaName)
      .where(`${this.tableName}.id`, id)
      .join(
        `${CustomerGroupRepository.TABLE_NAME} as cg`,
        'cg.id',
        `${this.tableName}.customerGroupId`,
      )
      .first(['cg.*', `${this.tableName}.id as customerId`]);
    return item;
  }

  async getAllByIds({ condition = {}, ids = [], fields = ['*'] } = {}, trx = this.knex) {
    const { query } = await this.populateDataQuery(fields, trx);

    const items = await query
      .whereIn(`${this.tableName}.id`, ids)
      .andWhere(unambiguousCondition(this.tableName, condition));

    return items?.map(item => this.mapFields(item, true)) ?? [];
  }

  async getCustomersForSubscriptionsInvoicing(params) {
    const { businessUnitId, ...condition } = params;
    const customerHt = this.historicalTableName;
    const customerTable = this.tableName;
    const { schemaName } = this;

    const subscriptionCTE = 'subscriptions_cte';
    const customerCTE = 'customers_cte';
    const unfinalizedSubsOrdersCTE = 'unfinalized_subscription_orders_cte';

    const customerGroupTable = CustomerGroupRepository.TABLE_NAME;

    const subscriptionWith = SubscriptionRepository.getInstance(this.ctxState).getWithTable(
      condition,
      businessUnitId,
      subscriptionCTE,
    );
    const temp = subscriptionWith

      .with(customerCTE, qb => {
        qb.select(
          ...customerInvoiceSubscription.map(field => `${customerTable}.${field}`),
          this.knex.raw(`json_agg(distinct ${subscriptionCTE}.*) as subscriptions`),
          this.knex.raw(`
                        COALESCE(
                            json_agg(${unfinalizedSubsOrdersCTE}.*)
                            FILTER (WHERE ${unfinalizedSubsOrdersCTE}.subscription_id IS NOT NULL),
                            '[]'
                        ) as unfinalized_orders
                    `),
          this.knex.raw(
            `
                        json_build_object(
                            'id', ${customerGroupTable}.id,
                            'active', ${customerGroupTable}.active,
                            'description', ${customerGroupTable}.description,
                            'type', ${customerGroupTable}.type
                        ) as ??
                    `,
            ['customerGroup'],
          ),
        )
          .from(`${this.schemaName}.${customerHt}`)

          .innerJoin(subscriptionCTE, `${subscriptionCTE}.customer_id`, `${customerHt}.id`)
          .leftJoin(
            unfinalizedSubsOrdersCTE,
            `${unfinalizedSubsOrdersCTE}.subscription_id`,
            `${subscriptionCTE}.id`,
          )
          .innerJoin(
            `${schemaName}.${customerTable}`,
            `${customerTable}.id`,
            `${customerHt}.originalId`,
          )

          .innerJoin(
            `${schemaName}.${customerGroupTable}`,
            `${customerTable}.customerGroupId`,
            `${customerGroupTable}.id`,
          )

          .groupBy([
            `${customerTable}.id`,
            `${customerGroupTable}.id`,
            `${customerGroupTable}.active`,

            `${customerGroupTable}.description`,
            `${customerGroupTable}.type`,
          ])
          .orderBy([`${customerTable}.id`]);
      })
      .select(this.knex.raw(`json_agg(${customerCTE}) as customers`))
      .from(customerCTE);

    const customers = await temp;

    const [{ customers: aggregatedCustomer }] = processVal(customers);

    if (!aggregatedCustomer) {
      return {
        onAccount: [],
        prepaid: [],
        customersCount: 0,
        processedSubscriptions: 0,
        invoicesTotal: 0,
        generatedInvoices: 0,
      };
    }
    const onAccountCustomers = aggregatedCustomer.filter(customer => customer.onAccount);
    const prepaidCustomers = aggregatedCustomer.filter(customer => !customer.onAccount);

    const onAccount = proceedCustomers({ customers: onAccountCustomers });
    const prepaid = proceedCustomers({ customers: prepaidCustomers });

    const customersCount =
      onAccount.customerInvoicingInfo.length + prepaid.customerInvoicingInfo.length;

    return {
      onAccount: onAccount.customerInvoicingInfo,
      prepaid: prepaid.customerInvoicingInfo,
      customersCount,
      processedSubscriptions: onAccount.proceedSubscriptions + prepaid.proceedSubscriptions,
      invoicesTotal: onAccount.invoicesTotal + prepaid.invoicesTotal,
      generatedInvoices: onAccount.invoicesCount + prepaid.invoicesCount,
    };
  }

  streamAllData({ options = {}, fields = ['*'] } = {}, trx = this.knex) {
    let query = trx(this.tableName).withSchema(this.schemaName);

    const selects = fields.map(field => `${this.tableName}.${field}`);

    selects.push(trx.raw('to_json(??.*) as ??', [ContactRepository.TABLE_NAME, 'contactData']));

    query = query
      .innerJoin(
        ContactRepository.TABLE_NAME,
        `${ContactRepository.TABLE_NAME}.id`,
        `${this.tableName}.contactId`,
      )
      .innerJoin(
        BusinessUnitRepository.TABLE_NAME,
        `${BusinessUnitRepository.TABLE_NAME}.id`,
        `${this.tableName}.businessUnitId`,
      );

    const pnTn = PhoneNumberRepository.TABLE_NAME;

    selects.push(
      trx.raw('json_agg(??.*) as ??', ['cnpn', 'contactPhoneNumbersArr']),
      trx.raw('json_agg(??.*) as ??', ['cmpn', 'customerPhoneNumbersArr']),
      trx.raw('??.name_line_1 as ??', ['business_units', 'businessUnitName']),
    );

    query = query
      .joinRaw(
        `
                left join "${this.schemaName}"."${pnTn}" cnpn
                    on cnpn.contact_id = "${this.tableName}".contact_id
            `,
      )
      .joinRaw(
        `
                left join "${this.schemaName}"."${pnTn}" cmpn
                    on cmpn.customer_id = "${this.tableName}".id
            `,
      )
      .groupBy([
        `${this.tableName}.id`,
        `${ContactRepository.TABLE_NAME}.id`,
        `${BusinessUnitRepository.TABLE_NAME}.id`,
      ]);

    query = query.select(selects);
    return query.stream(options);
  }

  async getByIdToLog(id, trx = this.knex) {
    const item = await this.getBy({ condition: { id }, fields: ['*'] }, trx);

    return item || null;
  }

  getCustomersByRefNumbers({ condition = {}, refNumbers, fields = ['*'] }, trx = this.knex) {
    return trx(this.tableName)
      .withSchema(this.schemaName)
      .select(fields)
      .whereIn(`${this.tableName}.referenceNumber`, refNumbers)
      .where(condition);
  }

  async proceedPurchaseOrders({ purchaseOrders = [], customerId }, trx = this.knex) {
    const oldPurchaseOrders = await PurchaseOrderRepo.getInstance(this.ctxState).getAll(
      {
        condition: {
          customerId,
          isDefaultByCustomer: true,
        },
        fields: ['id', 'isDefaultByCustomer'],
      },
      trx,
    );

    const oldPurchaseOrdersIds = oldPurchaseOrders?.map(po => po.id).sort();

    const purchaseOrderIds = purchaseOrders?.sort();

    if (!isEqual(oldPurchaseOrdersIds, purchaseOrderIds)) {
      const newDefaultPurchaseOrdersIds = difference(purchaseOrderIds, oldPurchaseOrdersIds);

      if (!isEmpty(newDefaultPurchaseOrdersIds)) {
        await trx(PurchaseOrderRepo.TABLE_NAME)
          .withSchema(this.schemaName)
          .update({
            isDefaultByCustomer: true,
          })
          .whereIn('id', newDefaultPurchaseOrdersIds);

        await Promise.all(
          newDefaultPurchaseOrdersIds?.map(po =>
            PurchaseOrderRepo.getInstance(this.ctxState).applyLevelAppliedValue(
              {
                id: po,
                applicationLevel: LEVEL_APPLIED.customer,
              },
              trx,
            ),
          ),
        );
      }

      const purchaseOrdersIdsToRemove = difference(oldPurchaseOrdersIds, purchaseOrderIds);

      if (!isEmpty(purchaseOrdersIdsToRemove)) {
        await trx(PurchaseOrderRepo.TABLE_NAME)
          .withSchema(this.schemaName)
          .update({
            isDefaultByCustomer: false,
          })
          .whereIn('id', purchaseOrdersIdsToRemove);

        await Promise.all(
          purchaseOrdersIdsToRemove.map(po =>
            PurchaseOrderRepo.getInstance(this.ctxState).removeLevelAppliedValue(
              {
                id: po,
                applicationLevelToRemove: LEVEL_APPLIED.customer,
              },
              trx,
            ),
          ),
        );
      }
    }
  }

  customerSortBy(sortBy) {
    const sortedFields = {
      id: `${this.tableName}.id`,
      name: `${this.tableName}.name`,
      status: `${this.tableName}.status`,
      balance: `${this.tableName}.balance`,
      group: `${CustomerGroupRepository.TABLE_NAME}.description`,
      contactPerson: `${ContactRepository.TABLE_NAME}.firstName`,
      owner: `${BrokerRepository.TABLE_NAME}.name`,
      hasTerm: `"${TermsAndConditionsRepository.TABLE_NAME}"."tc_ack"`,
    };
    return sortedFields[sortBy] || sortedFields.id;
  }
}

CustomerRepository.TABLE_NAME = TABLE_NAME;

export default CustomerRepository;
