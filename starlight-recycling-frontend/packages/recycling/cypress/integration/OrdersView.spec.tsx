import React from 'react';
import { fixtures } from '../../src/views/OrdersView/test/OrdersView.fixtures';

describe('Orders View Datatable', () => {
  beforeEach(() => {
    cy.viewport(1000, 1000);
    cy.intercept(
      {
        method: 'POST',
        url: '/api/graphql',
      },
      (req) => {
        if (req.body.operationName === 'GetOrdersIndexedWithStatusAggregation') {
          req.reply({
            body: fixtures,
          });
        }
      },
    );
    cy.login();
  });

  it('filters by Order Date correctly', () => {
    cy.visit('http://localhost:8000/starlight/recycling/1/orders/all');

    cy.get('[data-testid="Filter Table-iconButton"]').click();
    cy.getCy('Select Filter').click();
    cy.getCy('Order Date').click();
    cy.getCy('From').click().type('05/14/2021');
    cy.getCy('To').click().type('05/31/2021');
    cy.intercept(
      {
        method: 'POST',
        url: '/api/graphql',
      },
      (req) => {
        if (req.body.operationName === 'GetOrdersIndexedWithStatusAggregation') {
          expect(req.body.variables.search.query.bool.filter[0]).to.deep.equal({
            range: {
              createdAt: {
                gte: '2021-05-14T00:00:00+03:00',
                lte: '2021-05-31T23:59:59+03:00',
              },
            },
          });
        }
      },
    );
    cy.getCy('Apply').click();
  });

  it('filters by Order # correctly', () => {
    cy.visit('http://localhost:8000/starlight/recycling/1/orders/all');

    cy.get('[data-testid="Filter Table-iconButton"]').click();
    cy.getCy('Select Filter').click();
    cy.getCy('Order #').click();
    // NOTE: delay for multiple tests
    // seems like cypress is trying to quick to get filter
    cy.wait(200);
    cy.getCy('Order # Filter').type('41');
    cy.intercept(
      {
        method: 'POST',
        url: '/api/graphql',
      },
      (req) => {
        if (req.body.operationName === 'GetOrdersIndexedWithStatusAggregation') {
          expect(req.body.variables.search.query.bool.filter[0]).to.deep.equal({
            terms: {
              id: [41],
            },
          });
        }
      },
    );
    cy.get('[data-option-index="0"]').click();
  });

  it('filters by Action correctly', () => {
    cy.visit('http://localhost:8000/starlight/recycling/1/orders/all');

    cy.get('[data-testid="Filter Table-iconButton"]').click();
    cy.getCy('Select Filter').click();
    cy.getCy('Action').click();
    cy.intercept(
      {
        method: 'POST',
        url: '/api/graphql',
      },
      (req) => {
        if (req.body.operationName === 'GetOrdersIndexedWithStatusAggregation') {
          expect(req.body.variables.search.query.bool.filter[0]).to.deep.equal({
            terms: {
              'type.keyword': ['DUMP'],
            },
          });
        }
      },
    );
    cy.getCy('Dump').click();
  });

  it('filters by Payment Method correctly', () => {
    cy.visit('http://localhost:8000/starlight/recycling/1/orders/all');

    cy.get('[data-testid="Filter Table-iconButton"]').click();
    cy.getCy('Select Filter').click();
    cy.getCy('Payment Method').click();
    cy.intercept(
      {
        method: 'POST',
        url: '/api/graphql',
      },
      (req) => {
        if (req.body.operationName === 'GetOrdersIndexedWithStatusAggregation') {
          expect(req.body.variables.search.query.bool.filter[0]).to.deep.equal({
            terms: {
              paymentType: ['CASH'],
            },
          });
        }
      },
    );
    cy.getCy('Cash').click();
  });

  it('filters by WO# correctly', () => {
    cy.visit('http://localhost:8000/starlight/recycling/1/orders/all');
    const WONumber = 'zqdQ';

    cy.get('[data-testid="Filter Table-iconButton"]').click();
    cy.getCy('Select Filter').click();
    cy.getCy('WO#').click();
    cy.getCy('WO# Filter').click().type(WONumber);
    cy.get('[data-option-index="0"]').click();
    cy.intercept(
      {
        method: 'POST',
        url: '/api/graphql',
      },
      (req) => {
        if (req.body.operationName === 'GetOrdersIndexedWithStatusAggregation') {
          expect(req.body.variables.search.query.bool.filter[0]).to.deep.equal({
            terms: {
              WONumber: [WONumber],
            },
          });
        }
      },
    );
    cy.getCy('Apply').click();
  });

  it('filters by Material correctly', () => {
    cy.visit('http://localhost:8000/starlight/recycling/1/orders/all');
    const material = { description: 'wood', id: 1 };

    cy.get('[data-testid="Filter Table-iconButton"]').click();
    cy.getCy('Select Filter').click();
    cy.getCy('Material').click();
    cy.getCy('Material Filter').click().type(material.description);
    cy.get('[data-option-index="0"]').click();
    cy.intercept(
      {
        method: 'POST',
        url: '/api/graphql',
      },
      (req) => {
        if (req.body.operationName === 'GetOrdersIndexedWithStatusAggregation') {
          expect(req.body.variables.search.query.bool.filter[0]).to.deep.equal({
            terms: {
              'material.id': [material.id],
            },
          });
        }
      },
    );
    cy.getCy('Apply').click();
  });

  it('filters by Graded correctly', () => {
    cy.visit('http://localhost:8000/starlight/recycling/1/orders/all');
    const graded = true;

    cy.get('[data-testid="Filter Table-iconButton"]').click();
    cy.getCy('Select Filter').click();
    cy.getCy('Graded').click();
    cy.getCy('Yes').click();
    cy.intercept(
      {
        method: 'POST',
        url: '/api/graphql',
      },
      (req) => {
        if (req.body.operationName === 'GetOrdersIndexedWithStatusAggregation') {
          expect(req.body.variables.search.query.bool.filter[0]).to.deep.equal({
            terms: {
              graded: graded,
            },
          });
        }
      },
    );
    cy.getCy('Apply').click();
  });

  it('filters by Balance correctly', () => {
    cy.visit('http://localhost:8000/starlight/recycling/1/orders/all');
    const balance = { min: '100', max: '200' };

    cy.get('[data-testid="Filter Table-iconButton"]').click();
    cy.getCy('Select Filter').click();
    cy.getCy('Balance').click();
    cy.getCy('Range Field From').type(balance.min);
    cy.getCy('Range Field To').type(balance.max);
    cy.intercept(
      {
        method: 'POST',
        url: '/api/graphql',
      },
      (req) => {
        if (req.body.operationName === 'GetOrdersIndexedWithStatusAggregation') {
          expect(req.body.variables.search.query.bool.filter[0]).to.deep.equal({
            range: {
              balance: {
                gte: balance.min,
                lte: balance.max,
              },
            },
          });
        }
      },
    );
    cy.getCy('Apply').click();
  });
});
