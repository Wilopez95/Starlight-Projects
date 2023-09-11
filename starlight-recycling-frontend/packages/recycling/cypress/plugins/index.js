/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)
import { readFileSync } from 'fs';
import path from 'path';

/**
 * @type {Cypress.PluginConfig}
 */
// eslint-disable-next-line no-unused-vars
export default (on, config) => {
  if (config.testingType === 'component') {
    require('@cypress/react/plugins/react-scripts')(on, config);
  }

  on('task', {
    getSchema() {
      return readFileSync(path.resolve(__dirname, '../../src/graphql/api.graphql'), 'utf8');
    },
  });

  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config

  return config;
};
