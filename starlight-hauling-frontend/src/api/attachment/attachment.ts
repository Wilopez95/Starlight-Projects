import { IAttachment } from '@root/types';
import { IResponseAttachment } from '@root/types/responseEntities';

import { haulingHttpClient, RequestQueryParams } from '../base';

import { IUploadFilesRequest } from './types';

export class AttachmentService {
  baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  uploadFiles(options: IUploadFilesRequest) {
    return haulingHttpClient.sendFiles<File, IResponseAttachment[]>({
      url: `${this.baseUrl}/${options.id}`,
      headers: {
        'File-Upload-Method': 'stream',
      },
      ...options,
    });
  }

  getMediaFiles(id: string, options: RequestQueryParams = {}) {
    return haulingHttpClient.get<IAttachment, IResponseAttachment[]>(
      `${this.baseUrl}/${id}`,
      options,
    );
  }

  deleteFile(id: string) {
    return haulingHttpClient.delete(`${this.baseUrl}/${id}`);
  }
}
