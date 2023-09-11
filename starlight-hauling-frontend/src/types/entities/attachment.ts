export interface IAdditionalAttachmentFields {
  extension: string;
  isImage: boolean;
  isPdf: boolean;
  fileIsNoViewable: boolean;
  category: string;
}

export interface IAttachment extends IAdditionalAttachmentFields {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  customerId: number;
  fileName: string;
  url: string;
  src: string;
  category: string;
  timestamp: Date;
  author?: string;
  hideAuthor?: boolean;
}
