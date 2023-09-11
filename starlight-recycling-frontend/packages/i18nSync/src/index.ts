import path from 'path';
import yargs from 'yargs/yargs';

import { I18nSyncTool } from './i18nSyncTool';
import { loadRcFile } from './loadRcConfig';
import { PoEditorAdapter } from './poEditorAdapter';
import { I18nSyncToolOptions } from './types';

const { poEditor, translationsJsonFolder } = loadRcFile();

const VERSION = '0.0.1';

const options: I18nSyncToolOptions = {
  languages: poEditor.languages,
  api: poEditor.apiUrl,
  apiToken: poEditor.apiKey,
  defaultLanguage: poEditor.defaultLanguage,
  localeFolder: path.resolve(translationsJsonFolder),
  projectName: poEditor.projectName,
};

const argv = yargs(process.argv.slice(2))
  .version(VERSION)
  .options({
    pull: {
      type: 'boolean',
      default: false,
      description: 'pull translations from service',
    },
    push: { type: 'boolean', default: false, description: 'push translations to service' },
    pullOne: { type: 'string', description: 'pull specific translation by language from service' },
  }).argv;

const poClient = new PoEditorAdapter(options, {
  pullSpecificLanguage: argv.pullOne,
  POEditorSpecificLanguageCodes: new Map([
    ['en_UK', 'en-gb'],
    ['en_US', 'en-us'],
    ['fr_CA', 'fr-ca'],
  ]),
});

const app = new I18nSyncTool(poClient);

if (argv.pull || argv.pullOne) {
  app.pull();
}

if (argv.push) {
  app.push();
}
