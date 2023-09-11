import { orderBy } from 'lodash-es';
import { action, computed, observable } from 'mobx';
import { actionAsync, task } from 'mobx-utils';

import { AttachmentService, IUploadFilesRequest } from '@root/api';
import { NotificationHelper } from '@root/helpers';
import { ActionCode } from '@root/helpers/notifications/types';

import { ApiError } from '@root/api/base/ApiError';
import { Attachment } from '../entities';
import GlobalStore from '../GlobalStore';

export abstract class AttachmentStore {
  private readonly service: AttachmentService;
  globalStore: GlobalStore;

  @observable protected data = new Map<string, Attachment>();
  @observable uploadingFilesCount = 0;
  @observable loading = false;
  @observable loaded = false;

  protected offset = 0;
  protected limit = 25;

  constructor(globalStore: GlobalStore, baseUrl: string) {
    this.globalStore = globalStore;

    this.service = new AttachmentService(baseUrl);
  }

  @action
  setItems(entities: Attachment[]) {
    entities.forEach(entry => {
      this.data.set(entry.id, entry);
    });
  }

  @action
  removeEntity(id: string) {
    this.data.delete(id);
  }

  @computed
  get values(): Attachment[] {
    const values = Array.from(this.data.values());

    return orderBy(values, ['createdAt', 'fileName'], ['desc']);
  }

  @action
  addUploadingFilesCount(count: number) {
    this.uploadingFilesCount += count;
  }

  @action
  removeUploadingFilesCount(count: number) {
    this.uploadingFilesCount -= count;
  }

  @action
  protected validateLoading(responseData: unknown[] = [], limit: number) {
    if (responseData.length === 0 || responseData.length !== limit) {
      this.loaded = true;
    }
  }

  @action
  cleanup() {
    this.loading = false;
    this.loaded = false;
    this.offset = 0;
    this.data.clear();
  }

  @actionAsync
  async uploadFiles(options: IUploadFilesRequest) {
    this.addUploadingFilesCount(options.data.length);

    try {
      const response = await task(this.service.uploadFiles(options));

      const uploadedFiles = response.filter(file => !file.error);
      const rejectedFiles = response.filter(file => !!file.error);
      const files = uploadedFiles.map(file => new Attachment(this, file));

      this.setItems(files);

      const uploadFilesCant = files.length === 1 ? 'uploadAttachment' : 'uploadAttachments';

      if (rejectedFiles.length) {
        NotificationHelper.error('uploadAttachments', ActionCode.INVALID_REQUEST);
      }
      if (files.length) {
        NotificationHelper.success(uploadFilesCant, uploadedFiles.length);
      }
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError.response.code as ActionCode);
    }

    this.removeUploadingFilesCount(options.data.length);
  }

  @actionAsync
  async request(id: string) {
    if (this.loading) {
      return;
    }

    this.loading = true;

    const options = {
      limit: this.limit,
      skip: this.offset,
    };

    try {
      const response = await task(this.service.getMediaFiles(id, options));

      this.validateLoading(response, this.limit);

      const uploadedFiles = response.map(file => new Attachment(this, file));

      this.setItems(uploadedFiles);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.loaded = true;
      NotificationHelper.error('default', typedError.response.code as ActionCode);
    }

    this.loading = false;
    this.offset += this.limit;
  }

  @actionAsync
  async deleteFile(id: string) {
    try {
      await task(this.service.deleteFile(id));

      this.removeEntity(id);
      NotificationHelper.success('deleteAttachment');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError.response.code as ActionCode);
    }
  }
}
