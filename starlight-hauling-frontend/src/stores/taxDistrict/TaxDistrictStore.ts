import * as Sentry from '@sentry/react';
import { kebabCase } from 'lodash-es';
import { actionAsync, task } from 'mobx-utils';

import { TaxDistrictService } from '@root/api';
import { RequestQueryParams } from '@root/api/base';
import { NotificationHelper } from '@root/helpers';
import { ITaxDistrict, LineItemTax, Tax, TaxGroup, TaxKey } from '@root/types';
import { AtLeast } from '@root/types/helpers/atLeast';

import { ApiError } from '@root/api/base/ApiError';
import { ActionCode } from '@root/helpers/notifications/types';
import { ConfigurationDataBaseStore } from '../base/ConfigurationDataBaseStore';
import GlobalStore from '../GlobalStore';

import { TaxDistrict } from './TaxDistrict';

export class TaxDistrictStore extends ConfigurationDataBaseStore<TaxDistrict> {
  private service: TaxDistrictService;
  constructor(globalStore: GlobalStore) {
    super(globalStore, ['description']);
    this.service = new TaxDistrictService();
  }

  @actionAsync
  async request(options: RequestQueryParams = {}) {
    this.cleanup();
    this.loading = true;

    try {
      const response = await task(this.service.get(options));

      this.setItems(
        response.map(item => {
          return new TaxDistrict(this, item);
        }),
      );
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'TaxDistrict',
        message: `TaxDistricts Request Error ${JSON.stringify(typedError?.message)}`,
        data: {
          ...options,
        },
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
  }

  @actionAsync
  async create(entity: Omit<ITaxDistrict, TaxGroup>) {
    try {
      const response = await task(this.service.create(entity));
      const taxDistrict = new TaxDistrict(this, response);

      this.setItem(taxDistrict);
      NotificationHelper.success('create', 'Tax District');

      return taxDistrict;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('create', typedError?.response?.code as ActionCode, 'Tax District');
      Sentry.addBreadcrumb({
        category: 'TaxDistrict',
        message: `TaxDistricts Create Error ${JSON.stringify(typedError?.message)}`,
        data: {
          ...entity,
        },
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async requestById(id: number) {
    this.loading = true;
    try {
      const response = await task(this.service.getById(id));
      const taxDistrict = new TaxDistrict(this, response);

      this.setItem(taxDistrict);
      this.selectEntity(taxDistrict);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'TaxDistrict',
        message: `TaxDistricts Request By Id Error ${JSON.stringify(typedError?.message)}`,
        data: {
          id,
        },
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
  }

  @actionAsync
  async update(entity: AtLeast<ITaxDistrict, 'id'>) {
    try {
      this.clearPreconditionFailedError();
      const response = await task(this.service.updateTaxDistrict(entity, entity.id));

      const updatedDistrict = new TaxDistrict(this, response);

      this.setItem(updatedDistrict);
      this.selectEntity(updatedDistrict, false);

      NotificationHelper.success('update', 'Tax District');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.validatePreconditionError(typedError);
      if (this.isPreconditionFailed) {
        await task(this.requestById(entity.id));
      }
      NotificationHelper.error('update', typedError?.response?.code as ActionCode, 'Tax District');
      Sentry.addBreadcrumb({
        category: 'TaxDistrict',
        message: `TaxDistricts Update Error ${JSON.stringify(typedError?.message)}`,
        data: {
          ...entity,
        },
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async updateTaxDistrictRates(
    commercial: boolean,
    taxDistrictId: number,
    businessLineId: number,
    taxKey: TaxKey,
    tax: Tax | LineItemTax,
  ) {
    const preparedTaxGroupKey = kebabCase(taxKey);

    try {
      await task(
        this.service.updateTaxDistrictRates(
          taxDistrictId,
          businessLineId,
          preparedTaxGroupKey,
          tax,
          commercial,
        ),
      );
      await task(this.requestById(taxDistrictId));
      NotificationHelper.success('update', 'Taxes');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('update', typedError?.response?.code as ActionCode, 'Taxes');
      Sentry.addBreadcrumb({
        category: 'TaxDistrict',
        message: `TaxDistricts Update Rates Error ${JSON.stringify(typedError?.message)}`,
        data: {
          taxDistrictId,
          businessLineId,
          taxKey,
          tax,
        },
      });
      Sentry.captureException(typedError);
    }
  }
}
