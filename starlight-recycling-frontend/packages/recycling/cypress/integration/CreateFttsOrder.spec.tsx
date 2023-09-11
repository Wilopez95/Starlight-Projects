// @ts-ignore
import faker from 'faker';

describe('create Full Truck To Scale order flow', () => {
  beforeEach(() => {
    cy.login();
  });

  it('creates ftts dump order', () => {
    const CUSTOMER_NAME = 'cool guy 101';
    const MATERIAL_NAME = 'wood';
    cy.visit('http://localhost:8000/starlight/recycling/1/console/');

    cy.getCy('Menu Icon').click();
    cy.getCy('Full Truck To Scale Button').click();
    cy.getCy('Customer Input').click();
    cy.getCy(CUSTOMER_NAME).click();
    cy.getCy('Customer Truck Input').click();
    cy.getCy('New Select Option').click();
    cy.getCy('Description').type(faker.vehicle.vehicle());
    cy.getCy('Type').click();
    cy.get('[data-value="TRACTORTRAILER"]').click();
    cy.getCy('Truck Number').type(faker.vehicle.vrm());
    cy.getCy('Save Changes').click();

    cy.getCy('Material Input').click();
    cy.getCy(MATERIAL_NAME).click();
    cy.getCy('Create Order').click();

    cy.getCy('Close Drawer Icon').click();
  });
});
