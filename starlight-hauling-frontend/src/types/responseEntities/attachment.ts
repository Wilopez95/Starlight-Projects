export interface IResponseAttachment {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  customerId: number;
  fileName: string;
  url: string;
  author?: string;
  error?: string;
}
