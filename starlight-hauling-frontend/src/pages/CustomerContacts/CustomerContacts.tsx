import React, { useCallback, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { Button, Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Phone, Switch, Typography } from '@root/common';
import {
  Divider,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableTools,
} from '@root/common/TableTools';
import { StatusBadge } from '@root/components';
import { useCleanup, usePermission, useStores } from '@root/hooks';
import { CustomerContactQuickView } from '@root/quickViews';

import { CustomerNavigation, CustomerStyles } from '../Customer';

const I18N_PATH = 'pages.CustomerContacts.Text.';

const CustomerContacts: React.FC = () => {
  const { customerStore, contactStore } = useStores();
  const { t } = useTranslation();

  useCleanup(contactStore, 'name', 'asc');

  const tableRef = useRef<HTMLTableSectionElement>(null);

  const canManageContacts = usePermission('customers:contacts:perform');
  const customer = customerStore.selectedEntity;

  useEffect(() => {
    if (customer) {
      contactStore.cleanup();
      contactStore.requestByCustomer({ customerId: customer.id });
    }
  }, [contactStore, customer]);

  const handleChangeShowInactive = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      contactStore.changeShowInactive(e.target.checked);
    },
    [contactStore],
  );

  const handleCreateContact = useCallback(() => {
    contactStore.toggleQuickView(true);
  }, [contactStore]);

  const handleRequest = useCallback(() => {
    if (customer) {
      contactStore.requestByCustomer({ customerId: customer.id });
    }
  }, [contactStore, customer]);

  const selectedContact = contactStore.selectedEntity;

  return (
    <>
      <Helmet title={t('Titles.CustomerContacts', { customerName: customer?.name ?? '' })} />
      <CustomerNavigation />
      <CustomerContactQuickView
        isOpen={contactStore.isOpenQuickView}
        clickOutContainers={tableRef}
      />
      <CustomerStyles.PageContainer>
        <CustomerStyles.TitleContainer>
          <Typography fontWeight="bold" variant="headerTwo">
            {t(`${I18N_PATH}Contacts`)}
          </Typography>
          <Layouts.Flex alignItems="center">
            <Layouts.Margin right="3">
              <Switch
                name="showInactiveCreditCards"
                value={contactStore.shouldShowInactive}
                onChange={handleChangeShowInactive}
              >
                {t(`${I18N_PATH}ShowInactive`)}
              </Switch>
            </Layouts.Margin>
            {canManageContacts ? (
              <Button variant="primary" onClick={handleCreateContact}>
                {t(`${I18N_PATH}AddContact`)}
              </Button>
            ) : null}
          </Layouts.Flex>
        </CustomerStyles.TitleContainer>

        <CustomerStyles.ScrollContainer>
          <Table>
            <TableTools.Header>
              <TableTools.SortableHeaderCell
                store={contactStore}
                onSort={handleRequest}
                sortKey="status"
              >
                {t(`Text.Status`)}
              </TableTools.SortableHeaderCell>
              <TableTools.SortableHeaderCell
                store={contactStore}
                onSort={handleRequest}
                sortKey="name"
              >
                {t(`Text.Name`)}
              </TableTools.SortableHeaderCell>
              <TableTools.SortableHeaderCell
                store={contactStore}
                onSort={handleRequest}
                sortKey="title"
              >
                {t(`Text.Title`)}
              </TableTools.SortableHeaderCell>
              <TableTools.HeaderCell>{t(`Text.Phone`)}</TableTools.HeaderCell>
              <TableTools.SortableHeaderCell
                store={contactStore}
                onSort={handleRequest}
                sortKey="email"
              >
                {t(`Text.Email`)}
              </TableTools.SortableHeaderCell>
            </TableTools.Header>
            <TableBody
              loading={contactStore.loading}
              cells={5}
              noResult={contactStore.noResult}
              ref={tableRef}
            >
              {contactStore.filteredValues.map((item, index) => {
                const mainNumber = item.phoneNumbers?.find(phone => phone.type === 'main')?.number;

                return (
                  <React.Fragment key={item.id}>
                    <TableRow
                      onClick={() => contactStore.selectEntity(item)}
                      selected={selectedContact?.id === item.id}
                    >
                      <TableCell>
                        <StatusBadge active={item.active} />
                      </TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>
                        {item.main ? (
                          <Typography fontWeight="bold">{t(`${I18N_PATH}MainContact`)}</Typography>
                        ) : null}
                        {item.main && item.jobTitle ? ' ・ ' : null}
                        {item.jobTitle ?? ''}
                      </TableCell>
                      <TableCell>{mainNumber ? <Phone number={mainNumber} /> : null}</TableCell>
                      <TableCell>{item.email}</TableCell>
                    </TableRow>
                    {!index ? <Divider colSpan={7} /> : null}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </CustomerStyles.ScrollContainer>
      </CustomerStyles.PageContainer>
    </>
  );
};

export default observer(CustomerContacts);
