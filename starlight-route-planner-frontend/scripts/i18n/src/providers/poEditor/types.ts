export interface IResponse {
  status: 'fail' | 'success';
  code: string;
  message: string;
}

export interface IProject {
  id: number;
  name: string;
  public: number;
  open: number;
  created: Date;
}

export interface IProjects {
  projects: IProject[];
}

export interface IPOBaseResponse<T> {
  response: IResponse;
  result: T;
}

export interface IExportPayload {
  url: string;
}

export interface ITerms {
  parsed: number;
  added: number;
  deleted: number;
}

export interface ITranslations {
  parsed: number;
  added: number;
  updated: number;
}

export interface IUploadResult {
  terms: ITerms;
  translations: ITranslations;
}

export interface POEditorSpecificOptions {
  pullSpecificLanguage?: string;
  POEditorSpecificLanguageCodes: Map<string, string>;
}

export type Export = IPOBaseResponse<IExportPayload>;
export type Projects = IPOBaseResponse<IProjects>;
export type Upload = IPOBaseResponse<IUploadResult>;
