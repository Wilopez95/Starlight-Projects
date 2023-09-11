import React, { useCallback, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { Button, Layouts } from '@starlightpro/shared-components';
import { format } from 'date-fns';
import { observer } from 'mobx-react-lite';

import { Badge, Switch, Typography } from '../../../../../common';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableTools,
} from '../../../../../common/TableTools';
import { StatusBadge } from '../../../../../components';
import { useCleanup, useStores } from '../../../../../hooks';
import { CustomerNavigation, CustomerStyles } from '../../../../../pages/Customer';
import { CreditCardQuickView } from '../../components';

import styles from './css/styles.scss';

const CustomerCreditCards: React.FC = () => {
  const { customerStore, creditCardStore, jobSiteStore } = useStores();
  const { t } = useTranslation();
  const tableContainerRef = useRef<HTMLTableSectionElement>(null);

  const customer = customerStore.selectedEntity;
  const selectedCreditCard = creditCardStore.selectedEntity;

  useCleanup(creditCardStore, 'CARD_NICKNAME', 'asc');
  useCleanup(jobSiteStore);

  useEffect(() => {
    if (customer) {
      jobSiteStore.cleanup();
      jobSiteStore.requestByCustomer({
        customerId: customer.id,
      });
      creditCardStore.request({ customerId: customer.id });
    }
  }, [creditCardStore, customer, jobSiteStore]);

  const handleChangeShowInactive = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      creditCardStore.changeShowInactive(e.target.checked);
    },
    [creditCardStore],
  );

  const handleCreateCreditCard = useCallback(() => {
    creditCardStore.toggleQuickView(true);
  }, [creditCardStore]);

  const handleRequest = useCallback(() => {
    if (customer) {
      creditCardStore.request({ customerId: customer.id });
    }
  }, [creditCardStore, customer]);

  return (
    <>
      <Helmet title={t('Titles.CustomerCreditCards', { customerName: customer?.name ?? '' })} />
      <CustomerNavigation />
      <CreditCardQuickView
        clickOutContainers={tableContainerRef}
        isOpen={creditCardStore.isOpenQuickView}
      />
      <CustomerStyles.PageContainer>
        <CustomerStyles.TitleContainer>
          <Typography fontWeight="bold" variant="headerTwo">
            Credit Cards
          </Typography>
          <Layouts.Flex alignItems="center">
            <Layouts.Margin right="3">
              <Switch
                name="ShowInactiveCreditCards"
                value={creditCardStore.shouldShowInactive}
                onChange={handleChangeShowInactive}
              >
                Show Inactive
              </Switch>
            </Layouts.Margin>

            <Button variant="primary" onClick={handleCreateCreditCard}>
              Add Credit Card
            </Button>
          </Layouts.Flex>
        </CustomerStyles.TitleContainer>

        <CustomerStyles.ScrollContainer>
          <Table>
            <TableTools.Header>
              <TableTools.SortableHeaderCell
                store={creditCardStore}
                sortKey="STATUS"
                onSort={handleRequest}
              >
                Status
              </TableTools.SortableHeaderCell>
              <TableTools.SortableHeaderCell
                store={creditCardStore}
                sortKey="CARD_NICKNAME"
                onSort={handleRequest}
              >
                Card Nickname
              </TableTools.SortableHeaderCell>
              <TableTools.SortableHeaderCell
                store={creditCardStore}
                sortKey="CARD_TYPE"
                onSort={handleRequest}
              >
                Card Type
              </TableTools.SortableHeaderCell>
              <TableTools.SortableHeaderCell
                store={creditCardStore}
                sortKey="CARD_NUMBER"
                onSort={handleRequest}
              >
                Card Number
              </TableTools.SortableHeaderCell>
              <TableTools.SortableHeaderCell
                store={creditCardStore}
                sortKey="EXPIRATION_DATE"
                onSort={handleRequest}
              >
                Expiration Date
              </TableTools.SortableHeaderCell>
              <TableTools.HeaderCell>Valid For</TableTools.HeaderCell>
              <TableTools.SortableHeaderCell
                store={creditCardStore}
                sortKey="PAYMENT_GATEWAY"
                onSort={handleRequest}
              >
                Payment Gateway
              </TableTools.SortableHeaderCell>
            </TableTools.Header>
            <TableBody loading={creditCardStore.loading} cells={7} ref={tableContainerRef}>
              {creditCardStore.filteredValues.map(item => (
                <TableRow
                  key={item.id}
                  onClick={() => creditCardStore.selectEntity(item)}
                  selected={selectedCreditCard?.id === item.id}
                >
                  <TableCell>
                    <StatusBadge active={item.active} />
                  </TableCell>
                  <TableCell>{item.nickName}</TableCell>
                  <TableCell>{item.cardBrand}</TableCell>
                  <TableCell>•••• {item.cardNumberLastDigits}</TableCell>
                  <TableCell>
                    {format(item.expDate, 'MM / yyyy')}
                    {item.expiredLabel ? (
                      <Badge color="alert" className={styles.expiredLabel}>
                        Expired
                      </Badge>
                    ) : null}
                  </TableCell>
                  <TableCell titleClassName={styles.validForContainer}>{item.validFor}</TableCell>
                  <TableCell titleClassName={styles.validForContainer}>
                    {item.paymentGateway}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CustomerStyles.ScrollContainer>
      </CustomerStyles.PageContainer>
    </>
  );
};

export default observer(CustomerCreditCards);
