export type ExportType = 'html' | 'pdf' | 'csv' | 'excel' | 'rtf' | 'json';

export interface IWrJsApiError {
  Message: string;
}

export interface IWrExagoApiOptions {
  WebEndpoint: string;
  ApiKey: string;
  ShowErrorDetail?: boolean;
  OnLoad(): void;
  OnError?(err: IWrJsApiError): void;
  OnDisposeContainer?(container: HTMLElement): void;
  businessUnitId?: number;
}

export interface IReportInitOptions {
  options: Omit<IWrExagoApiOptions, 'WebEndpoint' | 'ApiKey'>;
  businessUnitId: string;
  fromDate: string;
  toDate: string;
  reportType: string;
  path?: string;
  selfService?: boolean;
  linesOfBusiness: string;
}

export interface IExagoReportSettings {
  Id: string | null;
  ReportPath: string | null;
  SortsResource: string | null;
  FilterItems: string | null;
  IsError: boolean;
  ErrorList: string | null;
}

export interface IExagoCreateSessionResponse {
  AppUrl: string;
  ApiKey: string;
  Id: string;
  Page: string;
  ApiAction: string;
  ExportType: ExportType | null;
  ShowTabs: boolean;
  ShowErrorDetail: boolean;
  ReportSettings: IExagoReportSettings;
}
