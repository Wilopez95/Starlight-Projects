import React, { useCallback, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';

import { NotificationHelper } from '@root/helpers';
import { ActionCode } from '@root/helpers/notifications/types';

import { TableInfiniteScroll, TablePageContainer, TableTools } from '../../../../common/TableTools';
import { useBusinessContext, useCleanup, usePermission, useStores } from '../../../../hooks';
import { BankDepositsTable, PageHeader } from '../components';
import BankDepositQuickView from '../components/BankDepositQuickView/BankDepositQuickView';
import { type BankDeposit } from '../store/BankDeposit';

import styles from './css/styles.scss';

const BankDepositsPage: React.FC = () => {
  const { bankDepositStore } = useStores();
  const canViewBankDeposits = usePermission('billing:bank-deposits:full-access');

  const pageContainer = useRef<HTMLDivElement>(null);

  const tableBodyContainerRef = useRef<HTMLTableElement>(null);
  const { t } = useTranslation();

  useCleanup(bankDepositStore, 'DATE', 'desc');

  const { businessUnitId } = useBusinessContext();

  const handleSelect = useCallback(
    (bankDeposit: BankDeposit) => {
      bankDepositStore.selectEntity(bankDeposit);
    },
    [bankDepositStore],
  );

  const loadMore = useCallback(() => {
    if (!canViewBankDeposits) {
      NotificationHelper.error('default', ActionCode.ACCESS_DENIED);
      bankDepositStore.markLoaded();

      return;
    }

    bankDepositStore.request({ businessUnitId });
  }, [bankDepositStore, businessUnitId, canViewBankDeposits]);

  return (
    <>
      <Helmet title={t('Titles.BankDeposits')} />
      <TablePageContainer ref={pageContainer} className={styles.tableContainer}>
        <PageHeader />
        <BankDepositQuickView
          isOpen={bankDepositStore.isOpenQuickView}
          clickOutContainers={tableBodyContainerRef}
        />
        <TableTools.ScrollContainer>
          <BankDepositsTable
            tableRef={tableBodyContainerRef}
            onSort={loadMore}
            onSelect={handleSelect}
          />
          <TableInfiniteScroll
            onLoaderReached={loadMore}
            loaded={bankDepositStore.loaded}
            loading={bankDepositStore.loading}
          >
            Loading Bank Deposits
          </TableInfiniteScroll>
        </TableTools.ScrollContainer>
      </TablePageContainer>
    </>
  );
};

export default observer(BankDepositsPage);
