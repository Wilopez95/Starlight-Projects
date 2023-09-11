import compose from 'lodash/fp/compose.js';

import { deleteDocument } from '../services/elasticsearch/ElasticSearch.js';
import { publish } from '../services/elasticsearch/indices/recyclingFacilities/publisher.js';
import { searchAddress } from '../services/mapbox.js';

import { camelCaseKeys, mapAddressFields, unambiguousCondition } from '../utils/dbHelpers.js';
import { joinAddress } from '../utils/joinAddress.js';

import { PHONE_TYPE } from '../consts/phoneTypes.js';
import { BILLING_CYCLE } from '../consts/billingCycles.js';
import { INVOICE_CONSTRUCTION } from '../consts/invoiceConstructions.js';
import { APR_TYPE } from '../consts/aprTypes.js';
import { PAYMENT_TERM } from '../consts/paymentTerms.js';
import { NON_TENANT_INDEX } from '../consts/searchIndices.js';
import { BUSINESS_UNIT_TYPE } from '../consts/businessUnitTypes.js';
import {
  WALKUP_CUSTOMER_NAME,
  WALKUP_CONTACT_FIRST_NAME,
  WALKUP_CONTACT_LAST_NAME,
} from '../consts/recycling.js';
import { CUSTOMER_GROUP_TYPE } from '../consts/customerGroups.js';
import { US_CENTROID } from '../consts/coordinates.js';
import CompanyRepository from './company.js';
import TenantRepository from './tenant.js';
import PriceGroupsRepo from './priceGroups.js';
import MerchantRepo from './merchant.js';
import BusinessUnitLineRepo from './businessUnitLine.js';
import BusinessLineRepo from './businessLine.js';
import CustomerGroupRepo from './customerGroup.js';
import JobSiteRepo from './jobSite.js';
import CustomerRepo from './customer.js';
import BaseRepository from './_base.js';

const TABLE_NAME = 'business_units';

class BusinessUnitRepository extends BaseRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
  }

  mapFields(originalObj) {
    return compose(
      super.mapNestedObjects.bind(this, []),
      obj => {
        if (obj.businessLines?.[0] == null) {
          obj.businessLines = [];
        }

        if (obj.merchant?.[0] == null) {
          obj.merchant = null;
        } else {
          obj.merchant = camelCaseKeys(obj.merchant[0]);
        }
        return obj;
      },
      mapAddressFields,
      camelCaseKeys,
      super.mapFields,
    )(originalObj);
  }

  async addBusinessLines({ businessUnitId, businessLinesInfo, log = false } = {}, trx) {
    const _trx = trx || (await this.knex.transaction());

    try {
      const bUnitsLinesData = businessLinesInfo.map(businessLine => ({
        businessUnitId,
        businessLineId: businessLine.id,
        billingCycle: businessLine.billingCycle,
        billingType: businessLine.billingType,
      }));

      await Promise.all([
        BusinessUnitLineRepo.getInstance(this.ctxState).insertMany(
          {
            data: bUnitsLinesData,
          },
          _trx,
        ),
        this.addGeneralPriceGroups({ businessUnitId, businessLines: businessLinesInfo }, _trx),
      ]);

      log && this.log({ id: businessUnitId, action: this.logAction.modify });

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

  async createOne({ data: { businessLines, merchant, ...data }, fields = ['*'], log } = {}) {
    const trx = await this.knex.transaction();

    let walkupCustomer;
    let facilityJobSite;
    let businessUnit = {};
    try {
      businessUnit = await super.createOne({ data, fields }, trx);

      if (businessLines?.length >= 1) {
        await this.addBusinessLines(
          {
            businessUnitId: businessUnit.id,
            businessLinesInfo: businessLines,
          },
          trx,
        );
      }

      if (merchant) {
        const { id: merchantId } = await MerchantRepo.getInstance(this.ctxState).createOne(
          { data: { ...merchant, businessUnitId: businessUnit.id }, fields: ['id'] },
          trx,
        );

        await super.updateBy({ condition: { id: businessUnit.id }, data: { merchantId } }, trx);
      }

      // create recycling-only specific stuff
      if (businessUnit?.type === BUSINESS_UNIT_TYPE.recyclingFacility) {
        const businessLineId = businessLines[0].id;
        ({ walkupCustomer, facilityJobSite } = await this.seedRecyclingBuDefaultSetup(
          { businessUnit: this.mapFields(businessUnit), businessLineId },
          trx,
        ));

        await super.updateBy(
          { condition: { id: businessUnit.id }, data: { jobSiteId: facilityJobSite.id } },
          trx,
        );
      }

      const { coordinates } = await this.geocodeBusinessUnitAddress(
        { businessUnit: this.mapFields(businessUnit) },
        trx,
      );

      await super.updateBy({ condition: { id: businessUnit.id }, data: { coordinates } }, trx);

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }

    if (businessUnit?.type === BUSINESS_UNIT_TYPE.recyclingFacility) {
      this.index(businessUnit);
    }

    log && this.log({ id: businessUnit.id, action: this.logAction.create });

    return { businessUnit, walkupCustomer, facilityJobSite };
  }

  async geocodeBusinessUnitAddress({ businessUnit }, trx) {
    const { region } = await TenantRepository.getInstance(this.ctxState).getBy(
      {
        condition: { name: this.ctxState.user.tenantName },
        fields: ['region'],
      },
      trx,
    );

    let addressResponse;
    try {
      addressResponse = await searchAddress({
        query: joinAddress(businessUnit.physicalAddress),
        limit: 1,
        region,
      });
    } catch (error) {
      this.ctxState.logger.error(error);
    }

    const location = addressResponse?.[0]?.location ?? US_CENTROID;

    return {
      coordinates: location.coordinates,
      location,
    };
  }

  async seedRecyclingBuDefaultSetup({ businessUnit }, trx) {
    const { location } = await this.geocodeBusinessUnitAddress(
      { businessUnit: this.mapFields(businessUnit) },
      trx,
    );

    const customerGroupRepo = CustomerGroupRepo.getInstance(this.ctxState);

    const [walkupCustomerGroup, defaultFacilityJobSite] = await Promise.all([
      customerGroupRepo.getBy({ condition: { type: CUSTOMER_GROUP_TYPE.walkUp } }, trx),
      JobSiteRepo.getInstance(this.ctxState).createOne(
        {
          data: {
            ...businessUnit.physicalAddress,
            coordinates: location.coordinates,
            location,
            recyclingDefault: true,
          },
          log: true,
        },
        trx,
      ),
    ]);

    let newWalkupCustomerGroup;

    if (!walkupCustomerGroup) {
      newWalkupCustomerGroup = await customerGroupRepo.createOne(
        {
          data: {
            active: true,
            description: 'Walk-Up',
            type: CUSTOMER_GROUP_TYPE.walkUp,
          },
          log: true,
        },
        trx,
      );
    }

    const newCustomer = await CustomerRepo.getInstance(this.ctxState).createOne(
      {
        data: {
          businessUnitId: businessUnit.id,
          businessName: WALKUP_CUSTOMER_NAME,
          customerGroupId: walkupCustomerGroup?.id ?? newWalkupCustomerGroup?.id,
          billingAddress: businessUnit.physicalAddress,
          mailingAddress: businessUnit.mailingAddress,
          email: businessUnit.email,
          phoneNumbers: [{ type: PHONE_TYPE.main, number: businessUnit.phone }],
          mainFirstName: WALKUP_CONTACT_FIRST_NAME,
          mainLastName: WALKUP_CONTACT_LAST_NAME,
          mainEmail: businessUnit.email,
          mainPhoneNumbers: [{ type: PHONE_TYPE.main, number: businessUnit.phone }],
          billingCycle: BILLING_CYCLE.monthly,
          paymentTerms: PAYMENT_TERM.cod,
          invoiceConstruction: INVOICE_CONSTRUCTION.byCustomer,
          sendInvoicesByPost: !businessUnit.email,
          sendInvoicesByEmail: !!businessUnit.email,
          invoiceEmails: businessUnit.email ? [businessUnit.email] : [],
          statementEmails: businessUnit.email ? [businessUnit.email] : [],
          notificationEmails: businessUnit.email ? [businessUnit.email] : [],
          gradingNotification: false,
          gradingRequired: false,
          canTareWeightRequired: false,
          aprType: APR_TYPE.standard,
          financeCharge: 0,
          walkup: true,
        },
        commercial: true,
        log: true,
      },
      trx,
    );

    return {
      walkupCustomer: newCustomer,
      facilityJobSite: defaultFacilityJobSite,
    };
  }

  mapToIndex(data) {
    return {
      id: data.id,

      state: data.physicalState,
      city: data.physicalCity,
      zip: data.physicalZip,

      // This is necessary because `addressLine2` might be `null`.
      addressLine1: data.physicalAddressLine1,
      addressLine2: data.physicalAddressLine2 ?? null,
      address: [data.physicalAddressLine1, data.physicalAddressLine2].filter(i => !!i).join(' '),

      tenantName: this.schemaName,
    };
  }

  index(businessUnit) {
    const data = this.mapToIndex(businessUnit);

    publish(this.getCtx(), this.schemaName, NON_TENANT_INDEX.recyclingFacilities, data);
  }

  async getAllPopulated({ condition = {}, fields = ['*'] } = {}, trx = this.knex) {
    const businessLinesIdx = fields.indexOf('businessLines');
    if (businessLinesIdx !== -1) {
      fields.splice(1, businessLinesIdx);
    }

    const selects = fields.map(field => `${this.tableName}.${field}`);

    if (fields[0] === '*' || fields.includes('businessLines')) {
      selects.push(
        trx.raw('json_agg(??.*) as ??', [BusinessLineRepo.TABLE_NAME, 'businessLines']),
        trx.raw(`json_agg(??.*) as ??`, [MerchantRepo.TABLE_NAME, 'merchant']),
      );
    }

    const items = await trx(this.tableName)
      .withSchema(this.schemaName)
      .where(unambiguousCondition(this.tableName, condition))
      .leftJoin(
        BusinessUnitLineRepo.TABLE_NAME,
        `${BusinessUnitLineRepo.TABLE_NAME}.businessUnitId`,
        `${this.tableName}.id`,
      )
      .leftJoin(
        BusinessLineRepo.TABLE_NAME,
        `${BusinessUnitLineRepo.TABLE_NAME}.businessLineId`,
        `${BusinessLineRepo.TABLE_NAME}.id`,
      )
      .leftJoin(
        MerchantRepo.TABLE_NAME,
        `${MerchantRepo.TABLE_NAME}.id`,
        `${this.tableName}.merchantId`,
      )
      .select(selects)
      .orderBy(`${this.tableName}.id`)
      .groupBy(`${this.tableName}.id`);

    return items?.map(this.mapFields.bind(this)) ?? [];
  }

  // use only for data syncs (exposes sensitive info)
  async getWithMerchant({ condition: { id }, fields = ['*'] } = {}) {
    const selects = fields.map(field => `${this.tableName}.${field}`);

    const businessUnitLineTable = BusinessUnitLineRepo.TABLE_NAME;
    const businessLine = BusinessLineRepo.TABLE_NAME;

    if (fields[0] === '*' || fields.includes('businessLines')) {
      selects.push(
        this.knex.raw(
          `json_agg(
                        json_build_object(
                            'id', ${businessLine}.id,
                            'billingCycle', ${businessUnitLineTable}.billing_cycle,
                            'billingType', ${businessUnitLineTable}.billing_type,
                            'active', ${businessLine}.active,
                            'name', ${businessLine}.name,
                            'description', ${businessLine}.description,
                            'type', ${businessLine}.type,
                            'created_at', ${businessLine}.created_at,
                            'updated_at', ${businessLine}.updated_at
                        )
                    ) as ??`,
          ['businessLines'],
        ),
      );
    }

    selects.push(this.knex.raw(`json_agg(??.*) as ??`, [MerchantRepo.TABLE_NAME, 'merchant']));

    const result = await this.knex(this.tableName)
      .withSchema(this.schemaName)
      .where(unambiguousCondition(this.tableName, { id }))
      .leftJoin(
        BusinessUnitLineRepo.TABLE_NAME,
        `${BusinessUnitLineRepo.TABLE_NAME}.businessUnitId`,
        `${this.tableName}.id`,
      )
      .leftJoin(
        BusinessLineRepo.TABLE_NAME,
        `${BusinessUnitLineRepo.TABLE_NAME}.businessLineId`,
        `${BusinessLineRepo.TABLE_NAME}.id`,
      )
      .leftJoin(
        MerchantRepo.TABLE_NAME,
        `${MerchantRepo.TABLE_NAME}.id`,
        `${this.tableName}.merchantId`,
      )

      .select(selects)
      .orderBy(`${this.tableName}.id`)
      .groupBy(`${this.tableName}.id`)
      .first();

    return result ? this.mapFields(result) : null;
  }

  async getBy({ condition, fields = ['*'] } = {}, trx = this.knex) {
    const selects = fields.map(field => `${this.tableName}.${field}`);

    const businessUnitLineTable = BusinessUnitLineRepo.TABLE_NAME;
    const businessLine = BusinessLineRepo.TABLE_NAME;

    if (fields[0] === '*' || fields.includes('businessLines')) {
      selects.push(
        trx.raw(
          `json_agg(
                        json_build_object(
                            'id', ${businessLine}.id,
                            'billingCycle', ${businessUnitLineTable}.billing_cycle,
                            'billingType', ${businessUnitLineTable}.billing_type,
                            'active', ${businessLine}.active,
                            'name', ${businessLine}.name,
                            'description', ${businessLine}.description,
                            'type', ${businessLine}.type,
                            'created_at', ${businessLine}.created_at,
                            'updated_at', ${businessLine}.updated_at
                        )
                    ) as ??`,
          ['businessLines'],
        ),
      );
    }

    const result = await trx(this.tableName)
      .withSchema(this.schemaName)
      .where(unambiguousCondition(this.tableName, condition))
      .leftJoin(
        BusinessUnitLineRepo.TABLE_NAME,
        `${BusinessUnitLineRepo.TABLE_NAME}.businessUnitId`,
        `${this.tableName}.id`,
      )
      .leftJoin(
        BusinessLineRepo.TABLE_NAME,
        `${BusinessUnitLineRepo.TABLE_NAME}.businessLineId`,
        `${BusinessLineRepo.TABLE_NAME}.id`,
      )
      .select(selects)
      .orderBy(`${this.tableName}.id`)
      .groupBy(`${this.tableName}.id`)
      .first();

    return result ? this.mapFields(result) : null;
  }

  async updateBy({ condition: { id }, data, fields = ['*'], concurrentData, log } = {}, trx) {
    const _trx = trx || (await this.knex.transaction());

    const { merchant, facilityAddressChanged, jobSiteId, ...updateData } = data;

    let businessUnit = {};
    let upsertedMerchant;
    let facilityJobSite;
    try {
      if (merchant) {
        upsertedMerchant = await MerchantRepo.getInstance(this.ctxState).upsert(
          {
            data: { ...merchant, businessUnitId: id },
          },
          _trx,
        );
      }

      if (upsertedMerchant) {
        updateData.merchantId = upsertedMerchant.id;
      }

      businessUnit = await super.updateBy(
        {
          condition: { id },
          data: updateData,
          fields,
          concurrentData,
          log,
        },
        _trx,
      );

      // @NOTE:We should check if the address has changed instead of running this every update
      const { coordinates } = await this.geocodeBusinessUnitAddress(
        { businessUnit: this.mapFields(businessUnit) },
        trx,
      );

      await super.updateBy({ condition: { id }, data: { coordinates } }, _trx);

      if (facilityAddressChanged && jobSiteId) {
        const { physicalAddress } = this.mapFields(businessUnit);

        const { location } = await this.geocodeBusinessUnitAddress(
          { businessUnit: this.mapFields(businessUnit) },
          trx,
        );

        facilityJobSite = await JobSiteRepo.getInstance(this.ctxState).updateBy(
          {
            condition: { id: jobSiteId },
            data: { ...physicalAddress, coordinates: location.coordinates, location },
            log: true,
          },
          _trx,
        );
      }

      if (!trx) {
        await _trx.commit();
      }
    } catch (error) {
      if (!trx) {
        await _trx.rollback();
      }
      throw error;
    }

    if (businessUnit?.type === BUSINESS_UNIT_TYPE.recyclingFacility) {
      this.index(businessUnit);
    }

    return { businessUnit, facilityJobSite };
  }

  async deleteBy({ condition, buType, log } = {}) {
    const { id } = condition;

    const trx = await this.knex.transaction();

    try {
      await BusinessUnitLineRepo.getInstance(this.ctxState).deleteBy(
        { condition: { businessUnitId: id } },
        trx,
      );

      await super.deleteBy({ condition }, trx);

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }

    log && this.log({ id, action: this.logAction.delete });

    if (buType === BUSINESS_UNIT_TYPE.recyclingFacility) {
      deleteDocument(this.ctxState, NON_TENANT_INDEX.recyclingFacilities, { id });
    }
  }

  async getByIdToLog(id, trx = this.knex) {
    let query = super.getByIdQuery(id, trx);

    const selects = [
      `${this.tableName}.*`,
      this.knex.raw('json_agg(??.*) as ??', [BusinessLineRepo.TABLE_NAME, 'businessLines']),
    ];

    query = query
      .leftJoin(
        BusinessUnitLineRepo.TABLE_NAME,
        `${BusinessUnitLineRepo.TABLE_NAME}.businessUnitId`,
        `${this.tableName}.id`,
      )
      .leftJoin(
        BusinessLineRepo.TABLE_NAME,
        `${BusinessUnitLineRepo.TABLE_NAME}.businessLineId`,
        `${BusinessLineRepo.TABLE_NAME}.id`,
      )
      .leftJoin(
        MerchantRepo.TABLE_NAME,
        `${MerchantRepo.TABLE_NAME}.id`,
        `${this.tableName}.merchantId`,
      )
      .orderBy(`${this.tableName}.id`)
      .groupBy(`${this.tableName}.id`);

    const item = await query.select(selects);

    return item ? compose(this.mapFields, super.mapJoinedFields, super.camelCaseKeys)(item) : null;
  }

  async exists({ condition: { id, type } }, trx = this.knex) {
    const businessUnit = await trx(this.tableName)
      .withSchema(this.schemaName)
      .select()
      .where({ id, type })
      .first();

    return !!businessUnit;
  }

  async addGeneralPriceGroups({ businessUnitId, businessLines, log = false } = {}, trx) {
    const _trx = trx || (await this.knex.transaction());

    try {
      // TODO: integrate new pricing here!
      const bUnitsLinesPriceGroupsData = businessLines?.map(businessLine => ({
        businessUnitId,
        businessLineId: businessLine.id,
        description: 'General Price Group',
        isGeneral: true,
      }));

      await PriceGroupsRepo.getInstance(this.ctxState).insertMany(
        {
          data: bUnitsLinesPriceGroupsData,
        },
        _trx,
      );

      if (!trx) {
        await _trx.commit();
      }

      log && this.log({ id: businessUnitId, action: this.logAction.modify });
    } catch (error) {
      if (!trx) {
        await _trx.rollback();
      }
      throw error;
    }
  }

  async getTimeZone(id, tenantId, trx = this.knex) {
    const [bu, company] = await Promise.all([
      this.getById({ id, fields: ['timeZoneName'] }, trx),
      CompanyRepository.getInstance(this.ctxState).getBy(
        { condition: { tenantId }, fields: ['timeZoneName'] },
        trx,
      ),
    ]);
    return { timeZone: bu?.timeZoneName ?? company?.timeZoneName };
  }
}

BusinessUnitRepository.TABLE_NAME = TABLE_NAME;

export default BusinessUnitRepository;
