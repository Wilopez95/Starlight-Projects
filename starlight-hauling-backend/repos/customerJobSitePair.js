import compose from 'lodash/fp/compose.js';
import isEmpty from 'lodash/isEmpty.js';
import isEqual from 'lodash/fp/isEqual.js';
import difference from 'lodash/difference.js';
import omit from 'lodash/omit.js';

import { unambiguousCondition } from '../utils/dbHelpers.js';
import ApiError from '../errors/ApiError.js';
import { LEVEL_APPLIED } from '../consts/purchaseOrder.js';
import VersionedRepository from './_versioned.js';

import TaxDistrictCustomerJobSiteRepo from './taxDistrictCustomerJobSite.js';
import JobSiteRepo from './jobSite.js';
import CustomerRepo from './customer.js';
import CJSPurchaseOrderRepo from './customerJobSitePairPurchaseOrder.js';
import ProjectRepo from './project.js';
import PurchaseOrderRepo from './purchaseOrder.js';

const TABLE_NAME = 'customer_job_site';

class CustomerJobSitePairRepository extends VersionedRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
    this.upsertConstraints = ['jobSiteId', 'customerId'];
  }

  mapFields(obj) {
    return compose(super.mapJoinedFields, super.camelCaseKeys, super.mapFields)(obj);
  }

  async validateBooleans(
    { id, customerId, jobSiteId },
    { poRequired, signatureRequired }, // permitRequired - no limits
    trx = this.knex,
  ) {
    let customer;
    if (id) {
      const pair = await this.getBy({ condition: { id }, excludeTaxDistricts: true }, trx);

      if (pair) {
        ({ customer } = pair);
      } else {
        throw ApiError.notFound(`CJS pair with id ${id} does not exist`);
      }
    } else {
      [customer] = await Promise.all([
        customerId
          ? CustomerRepo.getInstance(this.ctxState).getById(
              {
                id: customerId,
                fields: ['poRequired', 'signatureRequired'],
              },
              trx,
            )
          : Promise.resolve(),
        jobSiteId && jobSiteId !== '*'
          ? JobSiteRepo.getInstance(this.ctxState).getById(
              {
                id: jobSiteId,
                fields: ['alleyPlacement', 'cabOver'],
              },
              trx,
            )
          : Promise.resolve(),
      ]);
    }

    const error = prop =>
      ApiError.invalidRequest(
        `CJS pair booleans do not meet func requirements for property ${prop}`,
      );

    if (customer) {
      if (customer.poRequired && !poRequired) {
        throw error('poRequired');
      }
      if (customer.signatureRequired && !signatureRequired) {
        throw error('signatureRequired');
      }
    }

    return true;
  }

  async createOne({ data, condition, fields = ['*'], log }, trx) {
    let obj;
    const _trx = trx || (await this.knex.transaction());

    if (!isEmpty(condition)) {
      await this.validateBooleans(condition, data, trx);
    }

    try {
      const dataToCreate = omit(data, ['defaultPurchaseOrders']);

      obj = await super.createOne({ data: dataToCreate, fields }, _trx);

      obj.taxDistricts = await this.setUpDefaultTaxDistrictsAfterCreate(
        { pairId: obj.id, jobSiteId: obj.jobSiteId },
        _trx,
      );

      const { defaultPurchaseOrders } = data;

      if (defaultPurchaseOrders) {
        await this.proceedPurchaseOrders(
          { purchaseOrdersIds: defaultPurchaseOrders, customerJobsitePairId: obj.id },
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

    log && this.log({ id: obj.id, action: this.logAction.create });

    return obj;
  }

  async getBy({ condition, fields = ['*'], excludeTaxDistricts = false } = {}, trx = this.knex) {
    const taxDistrictsIdx = fields.indexOf('taxDistricts');
    // `taxDistricts` is not a field of the underlying table, so remove it.
    if (taxDistrictsIdx !== -1) {
      fields.splice(1, taxDistrictsIdx);
    }

    const includeTaxDistricts =
      taxDistrictsIdx !== -1 || fields.includes('*') || !excludeTaxDistricts;
    // If `taxDistricts` was passed in `fields`, we need to ensure `id` is fetched.
    if (includeTaxDistricts && !(fields.includes('*') || fields.includes('id'))) {
      fields.push(`${TABLE_NAME}.id`);
    }

    const [customerColumns, jobSiteColumns] = await Promise.all([
      CustomerRepo.getInstance(this.ctxState).getColumnsToSelect('customer'),
      JobSiteRepo.getInstance(this.ctxState).getColumnsToSelect('jobSite'),
    ]);

    const query = super
      .getBy(
        {
          condition: unambiguousCondition(this.tableName, condition),
          fields: [
            ...fields.map(field => `${this.tableName}.${field}`),
            ...customerColumns,
            ...jobSiteColumns,
          ],
        },
        trx,
      )
      .innerJoin(
        CustomerRepo.TABLE_NAME,
        `${CustomerRepo.TABLE_NAME}.id`,
        `${this.tableName}.customerId`,
      )
      .innerJoin(
        JobSiteRepo.TABLE_NAME,
        `${JobSiteRepo.TABLE_NAME}.id`,
        `${this.tableName}.jobSiteId`,
      )
      .orderBy(`${this.tableName}.id`, 'desc');

    const item = await query;

    if (item) {
      if (item.id) {
        if (includeTaxDistricts) {
          item.taxDistricts = await TaxDistrictCustomerJobSiteRepo.getInstance(
            this.ctxState,
          ).getTaxDistrictsByPairId(item.id, trx);
        }
        const purchaseOrderCondition = {
          [`${CJSPurchaseOrderRepo.TABLE_NAME}.customerJobSitePairId`]: item.id,
        };
        item.purchaseOrders = await PurchaseOrderRepo.getInstance(this.ctxState).getAll(
          { condition: purchaseOrderCondition },
          trx,
        );
      }
      return this.mapFields(item);
    }
    return null;
  }

  async updateBy({ condition, data, fields = ['*'], concurrentData, log }, trx) {
    const taxDistrictsIdx = fields.indexOf('taxDistricts');
    // `taxDistricts` is not a field of the underlying table, so remove it.
    if (taxDistrictsIdx !== -1) {
      fields.splice(1, taxDistrictsIdx);
    }

    const includeTaxDistricts = taxDistrictsIdx !== -1 || fields.includes('*');
    // If `taxDistricts` was passed in `fields`, we need to ensure `id` is fetched.
    if (includeTaxDistricts && !(fields.includes('*') || fields.includes('id'))) {
      fields.push('id');
    }

    const _trx = trx || (await this.knex.transaction());

    let obj;
    try {
      await this.validateBooleans(condition, data, _trx);

      const updateCondition = { ...condition };
      if (updateCondition.jobSiteId === '*') {
        delete updateCondition.jobSiteId;
      }

      const dataToUpdate = omit(data, ['defaultPurchaseOrders']);

      obj = await super.updateBy(
        {
          condition: updateCondition,
          concurrentData,
          data: dataToUpdate,
          fields: log ? '*' : fields,
        },
        _trx,
      );

      const projectRepo = ProjectRepo.getInstance(this.ctxState);
      const { poRequired, permitRequired } = data;
      const { id, customerId, jobSiteId } = condition;

      if (id && (poRequired || permitRequired)) {
        const projectData = { customerJobSiteId: id };
        const projectExists = await projectRepo.getBy({
          condition: projectData,
          fields: [],
        });
        if (projectExists) {
          if (poRequired) {
            projectData.poRequired = true;
          }
          if (permitRequired) {
            projectData.permitRequired = true;
          }

          await projectRepo.updateBy(
            {
              condition: { customerJobSiteId: id },
              data: projectData,
              fields: [],
              log,
            },
            _trx,
          );
        }
      } else if (customerId && jobSiteId === '*' && poRequired) {
        const projects = await _trx(ProjectRepo.TABLE_NAME)
          .withSchema(this.schemaName)
          .select('id')
          .whereIn(
            'customerJobSiteId',
            _trx(this.tableName)
              .withSchema(this.schemaName)
              .select('id')
              .where(unambiguousCondition(this.tableName, { customerId })),
          );

        if (projects?.length) {
          await projectRepo.updateByIds(
            // eslint-disable-next-line no-shadow
            { ids: projects.map(({ id }) => id), data: { poRequired: true }, log },
            _trx,
          );
        }
      }

      if (includeTaxDistricts) {
        obj.taxDistricts = await TaxDistrictCustomerJobSiteRepo.getInstance(
          this.ctxState,
        ).getTaxDistrictsByPairId(obj.id, _trx);
      }

      await this.proceedPurchaseOrders(
        { purchaseOrdersIds: data.defaultPurchaseOrders, customerJobsitePairId: obj.id },
        _trx,
      );

      if (!trx) {
        await _trx.commit();
      }
    } catch (error) {
      if (!trx) {
        await _trx.rollback();
      }
      throw error;
    }

    log && this.log({ id: obj.id, action: this.logAction.modify });

    return obj;
  }

  async setUpDefaultTaxDistrictsAfterCreate({ pairId, jobSiteId }, trx) {
    let defaultDistricts = await JobSiteRepo.getInstance(this.ctxState).getDefaultTaxDistricts(
      { jobSiteId },
      trx,
    );

    if (!defaultDistricts) {
      defaultDistricts = [];
    }

    const taxDistrictIds = defaultDistricts.map(({ id }) => id);

    await this.updateDefaultTaxDistricts({ pairId, taxDistrictIds, shouldDelete: false }, trx);

    return defaultDistricts;
  }

  async updateDefaultTaxDistricts({ pairId, taxDistrictIds, shouldDelete = true, log }, trx) {
    const districtPairRepo = TaxDistrictCustomerJobSiteRepo.getInstance(this.ctxState);

    if (shouldDelete) {
      await districtPairRepo.deleteBy({ condition: { customerJobSitePairId: pairId } }, trx);
    }

    if (isEmpty(taxDistrictIds)) {
      return taxDistrictIds;
    }

    await districtPairRepo.insertMany(
      {
        data: taxDistrictIds.map(taxDistrictId => ({
          taxDistrictId,
          customerJobSitePairId: pairId,
        })),
      },
      trx,
    );

    log && this.log({ id: pairId, action: this.logAction.modify });

    return taxDistrictIds;
  }

  async getByIdToLog(id, trx = this.knex) {
    const item = await this.getBy({ condition: { id }, fields: ['*'] }, trx);

    return item || null;
  }

  async proceedPurchaseOrders({ purchaseOrdersIds = [], customerJobsitePairId }, trx = this.knex) {
    const oldPurchaseOrders = await CJSPurchaseOrderRepo.getInstance(this.ctxState).getAll(
      {
        condition: {
          customerJobSitePairId: customerJobsitePairId,
        },
      },
      trx,
    );

    const oldDefaultPurchaseOrdersIds = oldPurchaseOrders?.map(po => po.purchaseOrderId).sort();

    if (!isEqual(oldDefaultPurchaseOrdersIds, purchaseOrdersIds?.sort())) {
      const newDefaultPurchaseOrdersIds = difference(
        purchaseOrdersIds,
        oldDefaultPurchaseOrdersIds,
      );

      if (!isEmpty(newDefaultPurchaseOrdersIds)) {
        await CJSPurchaseOrderRepo.getInstance(this.ctxState).upsertMany(
          {
            data: newDefaultPurchaseOrdersIds.map(id => ({
              purchaseOrderId: id,
              customerJobSitePairId: customerJobsitePairId,
            })),
          },
          trx,
        );
        await Promise.all(
          newDefaultPurchaseOrdersIds.map(po =>
            PurchaseOrderRepo.getInstance(this.ctxState).applyLevelAppliedValue(
              {
                id: po,
                applicationLevel: LEVEL_APPLIED.customerJobsitePair,
              },
              trx,
            ),
          ),
        );
      }

      const defaultPurchaseOrdersToRemove = oldPurchaseOrders?.filter(
        ({ purchaseOrderId }) => !purchaseOrdersIds?.includes(purchaseOrderId),
      );

      if (!isEmpty(defaultPurchaseOrdersToRemove)) {
        await trx(CJSPurchaseOrderRepo.TABLE_NAME)
          .withSchema(this.schemaName)
          .delete()
          .whereIn(
            'purchaseOrderId',
            defaultPurchaseOrdersToRemove.map(({ purchaseOrderId }) => purchaseOrderId),
          )
          .andWhere(qb => {
            qb.whereIn(
              'customerJobSitePairId',
              defaultPurchaseOrdersToRemove.map(
                ({ customerJobSitePairId }) => customerJobSitePairId,
              ),
            );

            return qb;
          });

        await Promise.all(
          defaultPurchaseOrdersToRemove.map(({ purchaseOrderId }) =>
            PurchaseOrderRepo.getInstance(this.ctxState).removeLevelAppliedValue(
              {
                id: purchaseOrderId,
                applicationLevelToRemove: LEVEL_APPLIED.customerJobsitePair,
              },
              trx,
            ),
          ),
        );
      }
    }
  }

  async upsertOne({ customerId, jobSiteId, data }, trx = this.knex) {
    let linkedCjsPair = await this.getBy(
      {
        condition: { customerId, jobSiteId },
      },
      trx,
    );

    let created = false;
    if (!linkedCjsPair) {
      const newPair = await this.createOne(
        {
          data: { ...data, customerId, jobSiteId, active: true },
          condition: { customerId, jobSiteId },
        },
        trx,
      );
      created = true;

      linkedCjsPair = await this.getBy({ condition: { id: newPair.id } }, trx);
    }

    return { linkedCjsPair, created };
  }
}

CustomerJobSitePairRepository.TABLE_NAME = TABLE_NAME;

export default CustomerJobSitePairRepository;
