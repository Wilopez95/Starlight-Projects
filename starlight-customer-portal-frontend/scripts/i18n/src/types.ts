export interface IAPIBase {
  apiToken: string;
  api: string;
}

export interface I18nSyncToolOptions extends IAPIBase {
  projectName: string;
  languages: string[];
  defaultLanguage: string;
  localeFolder: string;
}

export interface II18nSyncAdapter<D, U> {
  download(): Promise<D>;
  upload(): Promise<U>;
}
