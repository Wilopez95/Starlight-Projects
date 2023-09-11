/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to select DOM element by data-cy attribute.
     * @example cy.getCy('greeting')
     */
    getCy(value: string): Chainable;
    login(): Chainable;
    waitUntil(Function): Chaiable;
  }
}
