import * as Sentry from '@sentry/react';
import { actionAsync, task } from 'mobx-utils';

import { RequestQueryParams } from '@root/api/base';
import { ProjectService } from '@root/api/project/project';
import { NotificationHelper } from '@root/helpers';
import { IProject } from '@root/types';

import { ApiError } from '@root/api/base/ApiError';
import { ActionCode } from '@root/helpers/notifications/types';
import { BaseStore } from '../base/BaseStore';
import GlobalStore from '../GlobalStore';

import { Project } from './Project';

export class ProjectStore extends BaseStore<Project> {
  private service: ProjectService;

  constructor(global: GlobalStore) {
    super(global);

    this.service = new ProjectService();
  }

  @actionAsync
  async requestAll({ customerJobSiteId }: { customerJobSiteId?: number }) {
    this.loading = true;
    try {
      const response = await task(this.service.requestAll({ customerJobSiteId }));

      this.setItems(response.map(project => new Project(this, project)));
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Project',
        message: `Projects Request All Error ${JSON.stringify(typedError?.message)}`,
        data: {
          customerJobSiteId,
        },
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
  }

  @actionAsync
  async request({
    customerJobSiteId,
    currentOnly,
    limit,
    mostRecent,
  }: {
    customerJobSiteId?: number;
    mostRecent?: boolean;
    currentOnly?: boolean;
  } & RequestQueryParams) {
    this.loading = true;
    try {
      await task(
        this.service.get({
          customerJobSiteId,
          limit,
          mostRecent,
          currentOnly,
        }),
      );
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Project',
        message: `Projects Request Error ${JSON.stringify(typedError?.message)}`,
        data: {
          customerJobSiteId,
          limit,
          mostRecent,
        },
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
  }

  @actionAsync
  async requestByCustomer({
    customerId,
    limit,
    mostRecent,
  }: {
    customerId: number;
    limit?: number;
    mostRecent?: boolean;
  }) {
    this.loading = true;
    try {
      const response = await task(
        this.service.requestByCustomer({
          customerId,
          limit,
          mostRecent,
        }),
      );

      this.setItems(response.map(project => new Project(this, project)));
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Project',
        message: `Projects Request By Customer Error ${JSON.stringify(typedError?.message)}`,
        data: {
          customerId,
          limit,
          mostRecent,
        },
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
  }

  @actionAsync
  async create(data: IProject, selectAfter?: boolean) {
    this.loading = true;
    try {
      const project = await task(this.service.create(data));

      const projectEntity = new Project(this, project);

      this.setItem(projectEntity);

      if (selectAfter) {
        this.selectEntity(projectEntity);
      }

      NotificationHelper.success('create', 'Project');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('create', typedError?.response?.code as ActionCode, 'Project');
      Sentry.addBreadcrumb({
        category: 'Project',
        message: `Projects Create Error ${JSON.stringify(typedError?.message)}`,
        data: {
          ...data,
        },
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
  }

  @actionAsync
  async update(entity: IProject) {
    try {
      const projectEntity = await task(this.service.update(entity.id, entity));
      const project = new Project(this, projectEntity);

      this.setItem(project);
      this.updateSelectedEntity(project);
      NotificationHelper.success('update', 'Project');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('update', typedError?.response?.code as ActionCode, 'Project');
      Sentry.addBreadcrumb({
        category: 'Project',
        message: `Projects Update Error ${JSON.stringify(typedError?.message)}`,
        data: {
          ...entity,
        },
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async requestById(id: number, shouldOpenQuickView = false) {
    this.loading = true;
    let project: Project | null = null;

    try {
      const projectResponse = await task(this.service.getById(id));

      project = new Project(this, projectResponse);
      this.setItem(project);
      this.selectEntity(project, shouldOpenQuickView);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Project',
        data: {
          id,
        },
        message: `Project Request By Id Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;

    return project;
  }
}
