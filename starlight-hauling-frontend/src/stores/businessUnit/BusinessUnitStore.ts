import * as Sentry from '@sentry/react';
import { trim } from 'lodash-es';
import { action } from 'mobx';
import { actionAsync, task } from 'mobx-utils';

import { NotificationHelper } from '@root/helpers';

import { ApiError } from '@root/api/base/ApiError';
import { ActionCode } from '@root/helpers/notifications/types';
import { BusinessUnitService } from '../../api';
import { IBusinessLine, IBusinessUnit, IServiceDaysAndTime } from '../../types';
import { ConfigurationDataBaseStore } from '../base/ConfigurationDataBaseStore';
import GlobalStore from '../GlobalStore';

import { BusinessUnit } from './BusinessUnit';

export class BusinessUnitStore extends ConfigurationDataBaseStore<BusinessUnit> {
  private readonly service: BusinessUnitService;
  selectOnCreate = false;

  constructor(global: GlobalStore) {
    super(global, ['email']);
    this.service = new BusinessUnitService();
  }

  @action
  // this method is used to omit side-effects since BU is fundamental entity in the system
  selectBusinessUnit(businessUnit: BusinessUnit) {
    this.selectedEntity = businessUnit;
  }

  @actionAsync
  async request() {
    this.loading = true;
    try {
      const businessUnitsResponse = await task(this.service.get());

      this.setItems(businessUnitsResponse.map(unit => new BusinessUnit(this, unit)));
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'BusinessUnit',
        message: `BusinessUnits Request Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
  }

  @actionAsync
  async requestById(id: number | string) {
    this.loading = true;

    try {
      const unit = await task(this.service.getById(+id));
      const entity = new BusinessUnit(this, unit);

      try {
        // error of this request is required to be ignored (error is possible in case of permission lack)
        await task(entity?.getServiceDays());
      } finally {
        this.setItem(entity);
        this.selectBusinessUnit(entity);
      }

      return entity;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'BusinessUnit',
        data: {
          id,
        },
        message: `BusinessUnits Request By Id Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
  }

  @actionAsync
  async create(data: IBusinessUnit) {
    this.loading = true;

    const payload = {
      ...data,
      nameLine2: data.nameLine2 ? trim(data.nameLine2) : null,
      businessLines: data.businessLines.map(({ id, billingType, billingCycle }) => ({
        id,
        billingCycle,
        billingType,
      })),
    };

    try {
      let unit;

      if (data.logo) {
        unit = await task(this.service.createWithForm(payload));
      } else {
        unit = await task(this.service.create(payload));
      }

      NotificationHelper.success('create', 'Business Unit');

      const entity = new BusinessUnit(this, unit);

      this.setItem(entity);
      this.globalStore.lobbyStore.clearResources();

      return entity;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('createBusinessUnit', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'BusinessUnit',
        data: {
          ...payload,
        },
        message: `BusinessUnits Create Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
    this.loading = false;
  }

  @actionAsync
  async update({ businessLines, ...data }: IBusinessUnit) {
    this.loading = true;

    try {
      let updateMethod;
      const payload = {
        ...data,
        nameLine2: data.nameLine2 ? trim(data.nameLine2) : null,
      };

      if (data.logo) {
        updateMethod = this.service.updateWithForm(data.id, payload);
      } else {
        updateMethod = this.service.update(data.id, payload);
      }

      await task(this.addLinesOfBusiness(data.id, businessLines));
      const unit = await task(updateMethod);

      const entity = new BusinessUnit(this, unit);

      await task(entity.getServiceDays());

      this.setItem(entity);
      this.updateSelectedEntity(entity);

      NotificationHelper.success('update', 'Business Unit');

      return entity;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('updateBusinessUnit', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'BusinessUnit',
        data: {
          businessLines,
          ...data,
        },
        message: `BusinessUnits Update Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
    this.loading = false;
  }

  @actionAsync
  async addLinesOfBusiness(entityId: number | string, businessLines: IBusinessLine[]) {
    const entity = this.getById(entityId);

    const editedBusinessLines = businessLines
      .filter(
        (item, index) =>
          entity?.businessLines[index]?.id === item.id &&
          (entity?.businessLines[index].billingCycle !== item.billingCycle ||
            entity?.businessLines[index].billingType !== item.billingType),
      )
      .map(({ id, billingCycle, billingType }) => ({ id, billingCycle, billingType }));

    const businessLinesInfo = businessLines
      .filter(item => !entity?.businessLines.find(({ id: loBId }) => item.id === loBId))
      .map(({ id, billingCycle, billingType }) => ({ id, billingCycle, billingType }));

    if (!businessLinesInfo.length && !editedBusinessLines.length) {
      // do not update when data is the same
      return false;
    }
    try {
      if (businessLinesInfo.length !== 0) {
        await task(this.service.addLinesOfBusiness(entityId, businessLinesInfo));
      }
      if (editedBusinessLines.length !== 0) {
        await task(this.service.updateLinesOfBusiness(entityId, editedBusinessLines));
      }
      NotificationHelper.success('update', 'Lines of Business');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error(
        'update',
        typedError?.response?.code as ActionCode,
        'Lines of Business',
      );
      Sentry.addBreadcrumb({
        category: 'BusinessUnit',
        data: {
          entityId,
          businessLines,
        },
        message: `BusinessUnits Add Line Of Business Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async setServiceDays(id: number | string, serviceDays: IServiceDaysAndTime[], isCreate = false) {
    try {
      if (isCreate) {
        await task(this.service.addServiceDays(+id, serviceDays));
      } else {
        await task(this.service.updateServiceDays(+id, serviceDays));
      }
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error(
        'update',
        typedError?.response?.code as ActionCode,
        'Service Days an Time',
      );

      Sentry.addBreadcrumb({
        category: 'BusinessUnit',
        data: {
          id,
          serviceDays,
        },
        message: `BusinessUnits Add Service Days and Time Error ${JSON.stringify(
          typedError?.message,
        )}`,
      });
      Sentry.captureException(typedError);
    }
  }
}
