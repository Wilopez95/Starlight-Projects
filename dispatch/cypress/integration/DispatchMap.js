describe('Dispatch Map Tests', function() {
  beforeEach(() => {
    cy.visit('http://localhost:3001/dispatcher');
    cy.get('[name=username]')
      .click()
      .type('sam.konnick@starlightpro.com');
    cy.get('[name=password]')
      .click()
      .type('password');
    cy.get('[type=submit]').click();
  });

  it('Logs in and creates 2 work orders', () => {
    cy.get('[href="/dispatcher/create"]').click();
    cy.get('[name=contactName]')
      .click()
      .type('test');
    cy.get('.Select')
      .eq(0)
      .click();
    cy.get('.Select-menu-outer')
      .eq(0)
      .click();
    cy.get('.Select')
      .eq(1)
      .click();
    cy.get('.Select-menu-outer')
      .eq(0)
      .click();
    cy.get('.Select--single')
      .eq(3)
      .click();
    cy.get('.Select-menu-outer')
      .eq(0)
      .click();
    cy.get('.react-autosuggest__input')
      .eq(0)
      .click()
      .type('2200 Market St');
    cy.get('li[role=option]').click();
    cy.get('[type=submit]').click();
    cy.wait(1000);

    cy.get('[href="/dispatcher/create"]').click();
    cy.get('[name=contactName]')
      .click()
      .type('test');
    cy.get('.Select')
      .eq(0)
      .click();
    cy.get('.Select-menu-outer')
      .eq(0)
      .click();
    cy.get('.Select')
      .eq(1)
      .click();
    cy.get('.Select-menu-outer')
      .eq(0)
      .click();
    cy.get('.Select--single')
      .eq(3)
      .click();
    cy.get('.Select-menu-outer')
      .eq(0)
      .click();
    cy.get('.react-autosuggest__input')
      .eq(0)
      .click()
      .type('2200 Market St');
    cy.get('li[role=option]').click();
    cy.get('[type=submit]').click();
    cy.wait(1000);
  });

  it('Reorders workorders within the same list', () => {
    cy.wait(1000);
    cy.get('.puzzleMainDiv')
      .closest('[data-react-beautiful-dnd-drag-handle]')
      .eq(0)
      .focus()
      .trigger('keydown', { keyCode: 32 })
      .trigger('keydown', { keyCode: 40, force: true })
      .wait(1000)
      .trigger('keydown', { keyCode: 32, force: true });
  });

  it('Confirms added work orders are on the map and list', () => {
    cy.wait(1000);
    cy.get('.dispatch-row').should('have.length', 4);

    cy.get('[draggable=true]').should('have.length', 2);
  });

  it('Confirms context menu can remove work order', () => {
    cy.wait(1000);
    cy.get('.dispatch-row')
      .eq(0)
      .trigger('contextmenu', { force: true });

    cy.get('.contextMenu--option')
      .eq(1)
      .click();

    cy.get('.dispatch-row').should('have.length', 2);

    cy.wait(1000);

    cy.get('.dispatch-row')
      .eq(0)
      .trigger('contextmenu', { force: true });

    cy.get('.contextMenu--option')
      .eq(1)
      .click();

    cy.get('.dispatch-row').should('have.length', 2);

    cy.wait(1000);
  });

  it('Logs in and creates a work order assigned to a driver', function() {
    cy.get('[href="/dispatcher/create"]').click();
    cy.get('[name=contactName]')
      .click()
      .type('test');
    cy.get('.Select')
      .eq(0)
      .click();
    cy.get('.Select-menu-outer')
      .eq(0)
      .click();
    cy.get('.Select')
      .eq(1)
      .click();
    cy.get('.Select-menu-outer')
      .eq(0)
      .click();
    cy.get('.Select--single')
      .eq(3)
      .click();
    cy.get('.Select-menu-outer')
      .eq(0)
      .click();
    cy.get('.Select')
      .eq(4)
      .click();
    cy.get('.Select-menu-outer')
      .eq(0)
      .click();
    cy.get('.react-autosuggest__input')
      .eq(0)
      .click()
      .type('2200 Market St');
    cy.get('li[role=option]').click();
    cy.get('[type=submit]').click();
    cy.wait(1000);
  });

  it('Confirms context menu options update locations properly', () => {
    cy.wait(1000);
    cy.contains('Add All Drivers')
      .eq(0)
      .click();

    cy.get('.driver-list-item')
      .eq(1)
      .click({ force: true });

    // Newly added order has location1 and not location2
    cy.get('.labelOrderLocation1')
      .eq(0)
      .then(label => {
        expect(label).to.have.text('2200 Market St, Denver, CO 80205, USA');
      });

    // Set landfill location and confirm text update
    cy.get('.dispatch-row')
      .eq(0)
      .trigger('contextmenu', { force: true });

    cy.get('.contextMenu--option')
      .eq(2)
      .trigger('mouseover');

    cy.get('.subOption')
      .eq(0)
      .click({ force: true });

    cy.wait(2000);

    cy.get('.labelOrderLocation2')
      .eq(0)
      .then(label => {
        expect(label).to.have.text(
          'Landfill: Denver Intl Airport, 8500 Peña Blvd, Denver, CO 80249',
        );
      });

    // Create pickup can and confirm text update
    cy.get('.dispatch-row')
      .eq(0)
      .trigger('contextmenu', { force: true });

    cy.get('.contextMenu--option')
      .eq(3)
      .trigger('mouseover');

    cy.get('.subOption')
      .eq(0)
      .click({ force: true });

    cy.wait(2000);

    cy.get('.labelOrderLocation1')
      .eq(0)
      .then(label => {
        expect(label).to.have.text('8500 Peña Blvd, Denver, CO 80249');
      });

    // Create dropoff can and confirm text update
    cy.get('.dispatch-row')
      .eq(0)
      .trigger('contextmenu', { force: true });

    cy.get('.contextMenu--option')
      .eq(4)
      .trigger('mouseover');

    cy.get('.subOption')
      .eq(1)
      .click({ force: true });

    cy.wait(2000);

    cy.get('.labelOrderLocation2')
      .eq(0)
      .then(label => {
        expect(label).to.have.text(
          'Landfill: 5280 Home Yard, 605 W 62nd Ave, Denver, CO 80216',
        );
      });
  });

  it('Confirms remove driver button takes driver out of active list', () => {
    cy.wait(1000);
    cy.contains('Add All Drivers')
      .eq(0)
      .click();

    cy.get('[name=deleteDriver]')
      .eq(0)
      .click();

    cy.get('.listview')
      .children()
      .then(element => {
        const initialLength = element.length;
        cy.get('[name=deleteDriver]')
          .eq(0)
          .click();
        cy.get('.listview')
          .children()
          .then(element => {
            expect(element.length).to.be.lessThan(initialLength);
          });
      });
  });

  it('should have driver order added from last test', () => {
    cy.contains('Add All Drivers')
      .eq(0)
      .click();

    cy.wait(1000);
    cy.get('.draggable-map-driver-order').should('exist');
  });

  it('Confirms add drivers panel filters drivers and adds correctly', () => {
    cy.wait(1000);
    cy.get('#addDriverButton').click();
    cy.wait(1000);

    cy.get('.listview')
      .children()
      .then(element => {
        const initialLength = element.length;
        cy.get('#searchText')
          .click({ force: true })
          .type('J', { force: true });

        cy.get('.listview')
          .children()
          .then(element => {
            expect(element.length).to.be.lessThan(initialLength);
          });

        cy.get('#addDriverIcon').click({ force: true });

        cy.get('#searchText')
          .click({ force: true })
          .clear({ force: true });

        cy.get('.listview')
          .children()
          .then(element => {
            expect(element.length).to.be.lessThan(initialLength);
          });
      });
  });
});
