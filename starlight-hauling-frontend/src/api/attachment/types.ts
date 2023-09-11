export interface IUploadFilesRequest {
  data: File[];
  id: string;
  queryParams?: {
    draftId: string;
  };
}
