/// <reference types="cypress" />

import { temporaryToken } from '../helpers/temporaryToken';
import 'cypress-wait-until';

Cypress.Commands.add('login', () => {
  // TODO: create function on BE to create token and write to Redis
  // TODO: change to json
  localStorage.setItem('login-starlight:recycling:1', temporaryToken);

  cy.waitUntil(() =>
    cy.window().then((win) => win.localStorage['login-starlight:recycling:1'] === temporaryToken),
  );
});

Cypress.Commands.add('getCy', (selector, ...args) => {
  return cy.get(`[data-cy='${selector}']`, ...args);
});

Cypress.Commands.add('getCyLike', (selector, ...args) => {
  return cy.get(`[data-cy*='${selector}']`, ...args);
});
