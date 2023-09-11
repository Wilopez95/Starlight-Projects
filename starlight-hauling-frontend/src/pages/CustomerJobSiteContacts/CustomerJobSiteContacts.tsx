import React, { useCallback, useEffect, useRef } from 'react';
import { useParams } from 'react-router';
import { observer } from 'mobx-react-lite';

import { Phone, Typography } from '@root/common';
import { Table, TableBody, TableCell, TableRow, TableTools } from '@root/common/TableTools';
import { StatusBadge } from '@root/components';
import { CustomerJobSiteNavigation } from '@root/components/PageLayouts/CustomerJobSiteLayout';
import { Paths } from '@root/consts';
import { pathToUrl } from '@root/helpers';
import { useBusinessContext, useCleanup, useStores } from '@root/hooks';
import { CustomerContactQuickView } from '@root/quickViews';

import { ICustomerJobSiteSubPage } from '../CustomerJobSites/types';

const CustomerJobSiteContacts: React.FC<ICustomerJobSiteSubPage> = () => {
  const { contactStore, customerStore, jobSiteStore } = useStores();
  const { id } = useParams<{ id?: string }>();

  const innerTableRef = useRef<HTMLTableElement>(null);

  const jobSiteNavigationRef = useRef<HTMLDivElement>(null);
  const { businessUnitId } = useBusinessContext();

  useCleanup(contactStore, 'name', 'asc');

  const selectedJobSite = jobSiteStore.selectedEntity;
  const selectedCustomer = customerStore.selectedEntity;
  const selectedContact = contactStore.selectedEntity;

  const handleRequestContacts = useCallback(() => {
    if (!(selectedCustomer && selectedJobSite)) {
      return;
    }

    contactStore.cleanup();
    contactStore.unSelectEntity();

    contactStore.requestJobSiteOrderContacts(selectedCustomer.id, selectedJobSite.id);
  }, [contactStore, selectedCustomer, selectedJobSite]);

  const handleLoadMore = useCallback(() => {
    if (!(selectedCustomer && selectedJobSite)) {
      return;
    }

    contactStore.requestJobSiteOrderContacts(selectedCustomer.id, selectedJobSite.id);
  }, [contactStore, selectedCustomer, selectedJobSite]);

  useEffect(() => {
    handleRequestContacts();
  }, [handleRequestContacts]);

  useEffect(() => {
    if (selectedContact || !id) {
      return;
    }

    const query = async () => {
      const maybeNewContact = await contactStore.requestById(+id);

      if (maybeNewContact) {
        contactStore.selectEntity(maybeNewContact);
      }
    };

    query();
  }, [contactStore, id, selectedContact]);

  const openContactUrl = pathToUrl(Paths.CustomerJobSiteModule.Contacts, {
    businessUnit: businessUnitId,
    customerId: selectedCustomer?.id,
    jobSiteId: selectedJobSite?.id,
    id: selectedContact?.id,
  });

  const closeContactUrl = pathToUrl(Paths.CustomerJobSiteModule.Contacts, {
    businessUnit: businessUnitId,
    customerId: selectedCustomer?.id,
    jobSiteId: selectedJobSite?.id,
  });

  return (
    <>
      <CustomerJobSiteNavigation ref={jobSiteNavigationRef} />
      <TableTools.ScrollContainer>
        <CustomerContactQuickView
          openUrl={openContactUrl}
          closeUrl={closeContactUrl}
          clickOutContainers={innerTableRef}
          isOpen={contactStore.isOpenQuickView}
        />
        <Table ref={innerTableRef}>
          <TableTools.Header>
            <TableTools.SortableHeaderCell
              store={contactStore}
              sortKey="status"
              onSort={handleLoadMore}
            >
              Status
            </TableTools.SortableHeaderCell>
            <TableTools.SortableHeaderCell
              store={contactStore}
              sortKey="name"
              onSort={handleLoadMore}
            >
              Name
            </TableTools.SortableHeaderCell>
            <TableTools.SortableHeaderCell
              store={contactStore}
              sortKey="title"
              onSort={handleLoadMore}
            >
              Title
            </TableTools.SortableHeaderCell>
            <TableTools.HeaderCell>Phone</TableTools.HeaderCell>
            <TableTools.SortableHeaderCell
              store={contactStore}
              sortKey="email"
              onSort={handleLoadMore}
            >
              Email
            </TableTools.SortableHeaderCell>
          </TableTools.Header>
          <TableBody loading={contactStore.loading} noResult={contactStore.noResult} cells={5}>
            {contactStore.filteredValues.map(contact => {
              const mainNumber = contact.phoneNumbers?.find(phone => phone.type === 'main')?.number;

              return (
                <TableRow
                  selected={contact.id === contactStore.selectedEntity?.id}
                  key={contact.id}
                  onClick={() => contactStore.selectEntity(contact)}
                >
                  <TableCell>
                    <StatusBadge active={contact.active} />
                  </TableCell>
                  <TableCell>
                    <Typography color="information">{contact.name}</Typography>
                  </TableCell>
                  <TableCell fallback="-">
                    {contact.main ? <Typography fontWeight="bold">Main Contact</Typography> : null}
                    {contact.main && contact.jobTitle ? ' ・ ' : null}
                    {contact.jobTitle ?? ''}
                  </TableCell>
                  <TableCell fallback="-">
                    {mainNumber ? <Phone number={mainNumber} /> : null}
                  </TableCell>
                  <TableCell fallback="-">{contact.email}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableTools.ScrollContainer>
    </>
  );
};

export default observer(CustomerJobSiteContacts);
