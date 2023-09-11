import React, { useCallback, useEffect, useRef } from 'react';
import { useParams } from 'react-router';
import { format } from 'date-fns';
import { observer } from 'mobx-react-lite';

import { Badge } from '@root/common';
import { Table, TableBody, TableCell, TableRow, TableTools } from '@root/common/TableTools';
import { StatusBadge } from '@root/components';
import { CustomerJobSiteNavigation } from '@root/components/PageLayouts/CustomerJobSiteLayout';
import { Paths } from '@root/consts';
import { pathToUrl } from '@root/helpers';
import { useBusinessContext, useCleanup, useStores } from '@root/hooks';
import { CreditCardQuickView } from '@root/modules/billing/CreditCards/components';
import styles from '@root/modules/billing/CreditCards/pages/CustomerCreditCards/css/styles.scss';

import { ICustomerJobSiteSubPage } from '../CustomerJobSites/types';

const CustomerJobSiteCreditCards: React.FC<ICustomerJobSiteSubPage> = () => {
  const { creditCardStore, jobSiteStore, customerStore } = useStores();
  const { id } = useParams<{ id?: string }>();

  const tableContainerRef = useRef<HTMLTableSectionElement>(null);

  const { businessUnitId } = useBusinessContext();

  useCleanup(creditCardStore, 'CARD_NICKNAME', 'asc');

  const selectedCreditCard = creditCardStore.selectedEntity;
  const selectedJobSite = jobSiteStore.selectedEntity;
  const selectedCustomer = customerStore.selectedEntity;

  useEffect(() => {
    if (id && !selectedCreditCard) {
      const maybeCreditCard = creditCardStore.getById(id);

      if (maybeCreditCard) {
        creditCardStore.selectEntity(maybeCreditCard);
      }
    }
  }, [creditCardStore, id, selectedCreditCard]);

  const handleRequest = useCallback(() => {
    if (selectedCustomer) {
      creditCardStore.request({
        customerId: selectedCustomer.id,
        jobSiteId: selectedJobSite?.id,
      });
    }
  }, [creditCardStore, selectedCustomer, selectedJobSite?.id]);

  useEffect(() => {
    handleRequest();
  }, [handleRequest]);

  const openCreditCardUrl = pathToUrl(Paths.CustomerJobSiteModule.CreditCards, {
    businessUnit: businessUnitId,
    customerId: selectedCustomer?.id,
    jobSiteId: selectedJobSite?.id,
    id: selectedCreditCard?.id,
  });

  const closeCreditCardUrl = pathToUrl(Paths.CustomerJobSiteModule.CreditCards, {
    businessUnit: businessUnitId,
    customerId: selectedCustomer?.id,
    jobSiteId: selectedJobSite?.id,
    id: undefined,
  });

  return (
    <>
      <CustomerJobSiteNavigation />
      <CreditCardQuickView
        isOpen={creditCardStore.isOpenQuickView}
        clickOutContainers={tableContainerRef}
        closeUrl={closeCreditCardUrl}
        openUrl={openCreditCardUrl}
        viewMode
      />
      <TableTools.ScrollContainer>
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
            <TableTools.SortableHeaderCell
              store={creditCardStore}
              sortKey="PAYMENT_GATEWAY"
              onSort={handleRequest}
            >
              Payment Gateway
            </TableTools.SortableHeaderCell>
          </TableTools.Header>
          <TableBody loading={creditCardStore.loading} cells={6} ref={tableContainerRef}>
            {creditCardStore.filteredValues.map(item => (
              <TableRow
                key={item.id}
                onClick={() => {
                  creditCardStore.selectEntity(item);
                }}
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
                <TableCell>{item.paymentGateway}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableTools.ScrollContainer>
    </>
  );
};

export default observer(CustomerJobSiteCreditCards);
