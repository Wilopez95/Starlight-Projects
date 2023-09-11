import { defaultLanguageCannotBeDownloaded, failToError } from './providers/poEditor/errors';
import { POAPIClient } from './providers/poEditor/poEditor';
import { Export, POEditorSpecificOptions, Projects, Upload } from './providers/poEditor/types';
import { notValidProvidedLanguage, poError } from './errors';
import { I18nSyncToolOptions, II18nSyncAdapter } from './types';

export class PoEditorAdapter implements II18nSyncAdapter<Export[], Upload> {
  readonly client: POAPIClient;

  private options: I18nSyncToolOptions;
  private providerOptions: POEditorSpecificOptions;

  constructor(options: I18nSyncToolOptions, providerOptions: POEditorSpecificOptions) {
    this.client = new POAPIClient({
      api: options.api,
      apiToken: options.apiToken,
    });
    this.options = options;
    this.providerOptions = providerOptions;
  }

  async download(): Promise<Export[]> {
    const { projectName, languages, localeFolder } = this.options;
    const { pullSpecificLanguage } = this.providerOptions;
    const id = await this.getProjectId(projectName);

    if (pullSpecificLanguage === undefined) {
      return this.getAllFiles(id, languages, localeFolder);
    } else {
      const result = this.getFile(id, pullSpecificLanguage, localeFolder);

      return result.then(x => [x]);
    }
  }

  async upload(): Promise<Upload> {
    const { localeFolder, defaultLanguage, projectName } = this.options;
    const id = await this.getProjectId(projectName);
    const poLanguageCode = this.mapToPOEditorLanguageCodes(defaultLanguage);

    const result = await this.client.upload<Upload>(
      `projects/upload`,
      `${localeFolder}/${defaultLanguage}.json`,
      {
        id,
        language: poLanguageCode,
        updating: 'terms_translations',
        overwrite: 1,
        sync_terms: 1,
      },
    );

    failToError(result);

    return Promise.resolve(result);
  }

  async getProjectId(projectName: string): Promise<number> {
    const res = await this.client.request<Projects>(`projects/list`);

    failToError(res);

    const { projects } = res.result;
    const id = projects.find(p => p.name === projectName)?.id;

    return Promise.resolve(id ?? -1);
  }

  private async getFile(id: number, language: string, localeFolder: string) {
    const { languages } = this.options;

    // there is no reason to download default language file cause it's source file
    if (language.toLowerCase() === this.options.defaultLanguage.toLowerCase()) {
      defaultLanguageCannotBeDownloaded(language);
    }

    const poLanguageCode = this.mapToPOEditorLanguageCodes(language);

    if (!this.isLanguageInfoValid(this.providerOptions)) {
      notValidProvidedLanguage(languages);
    }

    const exportPayload = await this.client.request<Export>(`projects/export`, {
      id,
      type: 'key_value_json',
      language: poLanguageCode,
    });

    failToError(exportPayload);

    try {
      await this.client.downloadFile(exportPayload.result.url, localeFolder, language);
    } catch (error: unknown) {
      const typedError = error as string;
      poError(typedError);
    }

    return exportPayload;
  }

  private async getAllFiles(id: number, languages: string[], localeFolder: string) {
    // there is no reason to download default language file cause it's source file
    const filteredLanguages = languages.filter(
      l => l.toLowerCase() !== this.options.defaultLanguage.toLowerCase(),
    );

    const results = [];

    for (const language of filteredLanguages) {
      const res = await this.getFile(id, language, localeFolder);

      results.push(res);
    }

    return results;
  }

  private isLanguageInfoValid(providerOptions: POEditorSpecificOptions): boolean {
    const { languages } = this.options;

    if (providerOptions.pullSpecificLanguage) {
      return languages.some(
        l => l.toLocaleLowerCase() === providerOptions.pullSpecificLanguage?.toLocaleLowerCase(),
      );
    } else {
      return true;
    }
  }

  private mapToPOEditorLanguageCodes(lang: string): string {
    return this.providerOptions.POEditorSpecificLanguageCodes.get(lang) ?? lang;
  }
}
