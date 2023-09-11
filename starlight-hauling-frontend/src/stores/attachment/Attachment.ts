import { parseDate } from '@root/helpers';
import { IAttachment, JsonConversions } from '@root/types';
import { IResponseAttachment } from '@root/types/responseEntities';

import { AttachmentStore } from './AttachmentStore';
import { getAdditionalFields } from './helpers';

export class Attachment implements IAttachment {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  customerId: number;
  fileName: string;
  url: string;
  src: string;
  extension: string;
  isImage: boolean;
  isPdf: boolean;
  fileIsNoViewable: boolean;
  category: string;
  timestamp: Date;
  author?: string;

  store: AttachmentStore;

  constructor(store: AttachmentStore, entity: JsonConversions<IResponseAttachment>) {
    const { extension, isImage, isPdf, fileIsNoViewable, category } = getAdditionalFields(entity);

    this.store = store;
    this.id = entity.id;
    this.createdAt = parseDate(entity.createdAt);
    this.updatedAt = parseDate(entity.updatedAt);
    this.customerId = entity.customerId;
    this.fileName = entity.fileName;
    this.url = entity.url;
    this.src = entity.url;
    this.author = entity.author;
    this.extension = extension;
    this.isImage = isImage;
    this.isPdf = isPdf;
    this.fileIsNoViewable = fileIsNoViewable;
    this.category = category;
    this.timestamp = parseDate(entity.createdAt);
  }
}
