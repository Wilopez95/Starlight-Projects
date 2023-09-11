import * as Sentry from '@sentry/react';
import { Point } from 'geojson';
import { action, computed, observable } from 'mobx';
import { actionAsync, task } from 'mobx-utils';

import { JobSiteService } from '@root/api';
import { IJobSiteEditData } from '@root/components/forms/JobSiteEdit/types';
import { convertDates, NotificationHelper } from '@root/helpers';
import { ICustomerJobSitePair, IStoreCount, ITaxDistrict } from '@root/types';

import { ApiError } from '@root/api/base/ApiError';
import { ActionCode } from '@root/helpers/notifications/types';
import { BaseStore } from '../base/BaseStore';
import type GlobalStore from '../GlobalStore';

import { JobSite } from './JobSite';
import { sanitizeJobSite } from './sanitize';
import {
  type GetCountOptions,
  type IJobSiteCreateParams,
  type IJobSiteCustomerByIdRequestParams,
  type IJobSiteCustomerRequestParams,
  type IJobSiteRequestParams,
  type JobSiteStoreSortType,
} from './types';

export class JobSiteStore extends BaseStore<JobSite, JobSiteStoreSortType> {
  private readonly service: JobSiteService;
  @observable shouldShowInactive = false;
  @observable location: Point | null = null;
  @observable taxDistricts: ITaxDistrict[] = [];

  @observable counts?: IStoreCount;

  constructor(global: GlobalStore) {
    super(global, 'city', 'asc');

    this.service = new JobSiteService();
  }

  @action.bound
  changeLocation(location: Point) {
    this.location = location;
  }

  @action
  changeShowInactive(value: boolean) {
    this.shouldShowInactive = value;
  }

  @computed
  get filteredValues() {
    const shouldShowInactive = this.shouldShowInactive;
    const jobSites = this.values;

    if (shouldShowInactive) {
      return jobSites;
    }

    return jobSites.filter(x => x.active);
  }

  @actionAsync
  async request({ query, filterData = {} }: IJobSiteRequestParams = {}) {
    if (this.loading) {
      return;
    }

    this.loading = true;

    try {
      const jobSitesResponse = await task(
        this.service.get({
          limit: this.limit,
          skip: this.offset,
          sortBy: this.sortBy,
          sortOrder: this.sortOrder,
          query,
          ...filterData,
        }),
      );

      this.validateLoading(jobSitesResponse, this.limit);

      const jobSites = jobSitesResponse.map(jobSite => new JobSite(this, jobSite));

      this.setItems(jobSites);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.loaded = true;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'JobSite',
        data: {
          query,
          filterData,
        },
        message: `Job Sites Request Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.offset += this.limit;
    this.loading = false;
  }

  @actionAsync
  async requestLinkedSearch({
    customerId,
    address,
    activeOnly,
  }: {
    customerId: number;
    address: string;
    activeOnly?: boolean;
  }) {
    this.loading = true;

    try {
      const jobSiteResponse = await task(
        this.service.searchCustomersLinkedJobSites({ customerId, address, activeOnly }),
      );

      if (jobSiteResponse) {
        const jobSiteEntities = jobSiteResponse.map(jobSite => {
          return new JobSite(this, jobSite);
        });

        this.setItems(jobSiteEntities);
      }
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'JobSite',
        data: {
          customerId,
          address,
          activeOnly,
        },
        message: `Job Sites Request Linked To Customer Error ${JSON.stringify(
          typedError?.message,
        )}`,
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
    this.loaded = true;
  }

  @actionAsync
  async requestCount({ query, filterData = {} }: GetCountOptions = {}) {
    try {
      const counts = await task(this.service.getCount({ ...filterData, query }));

      this.counts = counts;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'JobSite',
        data: {
          query,
          filterData,
        },
        message: `Job Sites Count Request Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async requestById(
    id: number,
    {
      includeInactiveTaxDistricts = false,
      shouldOpenQuickView = false,
      jobSiteContactIdHistorical = 0,
    } = {},
  ) {
    this.loading = true;
    try {
      const jobSite = await task(
        this.service.getById(id, { includeInactiveTaxDistricts, jobSiteContactIdHistorical }),
      );
      const jobSiteEntity = new JobSite(this, jobSite);

      this.setItem(jobSiteEntity);

      this.updateSelectedEntity(jobSiteEntity, shouldOpenQuickView);

      this.loading = false;

      return jobSiteEntity;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'JobSite',
        data: {
          id,
          includeInactiveTaxDistricts,
        },
        message: `Job Sites Request By Id Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;

    return null;
  }

  @actionAsync
  async create(
    { data, linkTo, ...countRequestParams }: IJobSiteCreateParams,
    selectAfter?: boolean,
  ): Promise<JobSite | null> {
    sanitizeJobSite(data);

    try {
      const jobSite = await task(
        this.service.create(data, {
          linkTo,
        }),
      );

      jobSite.active = true;

      this.requestCount(countRequestParams);

      const jobSiteEntity = new JobSite(this, jobSite);

      this.setItem(jobSiteEntity);
      this.location = null;

      if (selectAfter) {
        this.selectEntity(jobSiteEntity);
      }

      if (linkTo) {
        NotificationHelper.success('createAndLinkJobSite');
      } else {
        NotificationHelper.success('create', 'Job Site');
      }

      return jobSiteEntity;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('create', typedError?.response?.code as ActionCode, 'Job Site');
      Sentry.addBreadcrumb({
        category: 'JobSite',
        data: {
          linkTo,
          ...data,
          ...countRequestParams,
        },
        message: `Job Sites Create Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    return null;
  }

  @actionAsync
  async linkToCustomer(data: Omit<ICustomerJobSitePair, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const linkedData = await task(this.service.linkToCustomer(data));
      let linkedJobSite = this.getById(data.jobSiteId);

      if (!linkedJobSite) {
        linkedJobSite = await this.requestById(data.jobSiteId);
      }

      if (linkedJobSite) {
        linkedJobSite.active = linkedData.active;
      }

      NotificationHelper.success('linkJobSite');

      return linkedJobSite;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('linkJobSite', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'JobSite',
        data: {
          ...data,
        },
        message: `Job Sites Link to Customer Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    return null;
  }

  @actionAsync
  async updateLink(data: ICustomerJobSitePair) {
    try {
      this.clearPreconditionFailedError();
      const updatedLink = await task(this.service.updateLink(data));

      const jobSite = this.getById(updatedLink.jobSiteId);

      if (jobSite) {
        jobSite.active = updatedLink.active;
      }

      NotificationHelper.success('update', 'Job Site link');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.validatePreconditionError(typedError);

      if (this.isPreconditionFailed) {
        NotificationHelper.error('default', typedError?.response?.code as ActionCode);
        await this.requestById(data.id);
      } else {
        NotificationHelper.error(
          'update',
          typedError?.response?.code as ActionCode,
          'Job Site link',
        );
        Sentry.addBreadcrumb({
          category: 'JobSite',
          data: {
            ...data,
          },
          message: `Job Sites Update Link Error ${JSON.stringify(typedError?.message)}`,
        });
        Sentry.captureException(typedError);
      }
    }
  }

  @actionAsync
  async update(data: IJobSiteEditData, selectAfter?: boolean) {
    sanitizeJobSite(data);
    try {
      this.clearPreconditionFailedError();
      const jobSite = await task(this.service.update(data.id, data));
      const jobSiteEntity = new JobSite(this, jobSite);
      const prevJobSite = this.getById(data.id);

      // to fix issue with "Inactive" label flickering after sequential update jobSite + linked pair
      if (prevJobSite?.active !== undefined) {
        jobSiteEntity.active = prevJobSite.active;
      }

      this.setItem(jobSiteEntity);
      this.location = null;

      if (selectAfter) {
        this.selectEntity(jobSiteEntity);
      }

      NotificationHelper.success('update', 'Job Site');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.validatePreconditionError(typedError);
      if (this.isPreconditionFailed) {
        NotificationHelper.error('default', typedError?.response?.code as ActionCode);
        await this.requestById(data.id);
      } else {
        NotificationHelper.error('update', typedError?.response?.code as ActionCode, 'Job Site');
        Sentry.addBreadcrumb({
          category: 'JobSite',
          data: {
            ...data,
          },
          message: `Job Sites Update Error ${JSON.stringify(typedError?.message)}`,
        });
        Sentry.captureException(typedError);
      }
    }
  }

  @actionAsync
  async requestByCustomer({
    customerId,
    limit = this.limit,
    activeOnly,
    mostRecent,
  }: IJobSiteCustomerRequestParams) {
    if (this.loading) {
      return;
    }

    this.loading = true;

    try {
      const jobSitesResponse = await task(
        this.service.requestByCustomer({
          limit,
          skip: this.offset,
          customerId,
          activeOnly,
          mostRecent,
        }),
      );

      this.validateLoading(jobSitesResponse, this.limit);

      const jobSites = jobSitesResponse.map(jobSite => new JobSite(this, jobSite));

      this.setItems(jobSites);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'JobSite',
        data: {
          customerId,
          limit,
          activeOnly,
          mostRecent,
        },
        message: `Job Sites Request By Customer Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.offset += this.limit;
    this.loading = false;
  }

  @actionAsync
  async requestByCustomerById({ customerId, jobSiteId }: IJobSiteCustomerByIdRequestParams) {
    try {
      const jobSiteResponse = await task(
        this.service.requestByCustomerById({
          customerId,
          id: jobSiteId,
        }),
      );

      const jobSite = new JobSite(this, jobSiteResponse);

      this.setItem(jobSite);
      this.updateSelectedEntity(jobSite);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'JobSite',
        data: {
          customerId,
          jobSiteId,
        },
        message: `Job Sites Request By Customer By Id Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async updateWithTaxDistricts(jobSite: IJobSiteEditData, taxDistrictIds: number[]) {
    this.loading = true;
    await task(this.update(jobSite, true));
    await task(this.service.updateTaxDistricts(jobSite.id, taxDistrictIds));
    await task(this.requestById(jobSite.id));
  }

  @actionAsync
  async requestTaxDistrictsForCustomer({
    customerId,
    jobSiteId,
  }: {
    customerId: number;
    jobSiteId: number;
  }) {
    try {
      const taxDistricts = await task(
        JobSiteService.getCustomerJobSiteAvailableDistricts(customerId, jobSiteId),
      );

      this.taxDistricts = taxDistricts.map(convertDates);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'JobSite',
        data: {
          customerId,
          jobSiteId,
        },
        message: `Job Sites Request Tax Districts For Customer Error ${JSON.stringify(
          typedError.message,
        )}`,
      });
      Sentry.captureException(typedError);
    }

    return this.taxDistricts;
  }

  @action
  cleanup() {
    super.cleanup();

    this.taxDistricts = [];
  }
}
