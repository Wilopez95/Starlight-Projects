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

export enum Languages {
  EN_US = 'en-US',
  EN_UK = 'en-UK',
  FR_CA = 'fr-CA',
}

export interface I18nSyncRcConfig {
  translationsJsonFolder: string;
  poEditor: {
    apiKey: string;
    apiUrl: string;
    projectName: string;
    languages: Languages[];
    defaultLanguage: Languages;
  };
}
