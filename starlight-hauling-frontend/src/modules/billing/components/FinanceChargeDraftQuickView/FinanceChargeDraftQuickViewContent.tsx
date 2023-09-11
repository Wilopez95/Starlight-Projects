import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Sentry from '@sentry/react';
import { Button, Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { FinanceChargeService } from '@root/modules/billing/FinanceCharges/api/financeCharge';
import { IFinanceChargeDraftData } from '@root/modules/billing/types';

import { ApiError } from '@root/api/base/ApiError';
import { CustomerGroupService } from '../../../../api';
import { InvoicePlaceholder } from '../../../../assets';
import { QuickViewContent, Typography, useQuickViewContext } from '../../../../common';
import { convertDates } from '../../../../helpers';
import { useBoolean, useBusinessContext, useStores } from '../../../../hooks';
import { ICustomerGroup, ICustomerWithFinalChargeDraft } from '../../../../types';

import { CustomerHeader } from './CustomerHeader/CustomerHeader';
import { CustomerInvoicesTable } from './CustomerInvoicesTable/CustomerInvoicesTable';
import LeftPanel from './LeftPanel/LeftPanel';
import StatusModal from './StatusModal/StatusModal';

import styles from './css/styles.scss';

const I18N_PATH = 'quickViews.FinanceChargeDraftQuickView.FinanceChargeDraftQuickView.';

const FinanceChargeDraftQuickView: React.FC<{ statementIds: number[] }> = ({ statementIds }) => {
  const { financeChargeStore } = useStores();
  const { closeQuickView } = useQuickViewContext();
  const { businessUnitId } = useBusinessContext();

  const [customers, setCustomers] = useState<ICustomerWithFinalChargeDraft[]>([]);
  const [currentCustomerIndex, setCurrentCustomerIndex] = useState<number | null>(null);
  const [customerGroups, setCustomerGroups] = useState<Record<string, ICustomerGroup>>({});
  const [error, setError] = useState(false);
  const [financeChargeDraftData, setFinanceChargeDraftData] = useState<
    IFinanceChargeDraftData[] | null
  >(null);
  const [summaryModalOpen, openSummaryModalOpen, closeSummaryModalOpen] = useBoolean();

  const { t } = useTranslation();
  const loading = financeChargeStore.quickViewLoading;

  useEffect(() => {
    const query = async () => {
      try {
        const customersResponse = await FinanceChargeService.getFinancialChargesDrafts(
          statementIds,
        );
        const customerIds: number[] = [];

        setCustomers(
          customersResponse.map(c => {
            customerIds.push(c.id);

            return convertDates(c);
          }),
        );
        setCurrentCustomerIndex(customersResponse.length === 0 ? null : 0);
        const customerGroupsResponse = await CustomerGroupService.getCustomerGroupsById(
          customerIds,
        );

        const resolvedDates: Record<string, ICustomerGroup> = Object.entries(
          customerGroupsResponse,
        ).reduce((cur, [key, value]) => {
          return {
            ...cur,
            [key]: convertDates(value),
          };
        }, {});

        setCustomerGroups(resolvedDates);
      } catch (err: unknown) {
        const typedError = err as ApiError;
        setError(true);
        Sentry.addBreadcrumb({
          category: 'FinanceCharge',
          message: `Finance Charge Draft Error ${JSON.stringify(typedError?.message)}`,
          level: 'warning',
        });
        Sentry.captureException(typedError);
      }
    };

    query();
  }, [statementIds]);

  const handleRemoveCustomer = useCallback(() => {
    if (currentCustomerIndex !== null) {
      setCustomers(customersData => {
        customersData.splice(currentCustomerIndex, 1);

        let nextCustomerIndex: number | null = null;

        if (customers[currentCustomerIndex]) {
          nextCustomerIndex = currentCustomerIndex;
        } else if (customersData[currentCustomerIndex - 1]) {
          nextCustomerIndex = currentCustomerIndex - 1;
        } else if (customersData[0]) {
          nextCustomerIndex = 0;
        }

        setCurrentCustomerIndex(nextCustomerIndex);

        return [...customers];
      });
    }
  }, [currentCustomerIndex]);

  const handleCreateFinancialCharge = useCallback(() => {
    if (!customers.length) {
      return;
    }

    const draftData: IFinanceChargeDraftData[] = customers.map(customer => ({
      businessUnitId: +businessUnitId,
      customerId: customer.id,
      financeChargeApr: +customer.financeChargeApr,
      financeChargeInvoices: customer.invoices.map(invoice => ({
        statementId: invoice.statementId ?? 0,
        invoiceId: invoice.id,
        fine: invoice.fine ?? 0,
      })),
    }));

    setFinanceChargeDraftData(draftData);
    openSummaryModalOpen();
  }, [businessUnitId, customers, openSummaryModalOpen]);

  return (
    <>
      {financeChargeDraftData ? (
        <StatusModal
          isOpen={summaryModalOpen}
          data={financeChargeDraftData}
          onClose={() => {
            closeQuickView();
            closeSummaryModalOpen();
          }}
        />
      ) : null}
      <QuickViewContent
        leftPanelElement={
          <LeftPanel
            customers={customers}
            currentCustomerIndex={currentCustomerIndex}
            onNavigationChange={setCurrentCustomerIndex}
          />
        }
        rightPanelElement={
          <Layouts.Scroll>
            <Layouts.Padding padding="3">
              {currentCustomerIndex !== null ? (
                <>
                  <CustomerHeader
                    customerGroup={customerGroups[customers[currentCustomerIndex].id]}
                    customer={customers[currentCustomerIndex]}
                    onRemove={handleRemoveCustomer}
                    removable={customers.length > 1}
                  />
                  <CustomerInvoicesTable invoices={customers[currentCustomerIndex].invoices} />
                </>
              ) : (
                <div className={styles.loader}>
                  <Layouts.Margin margin="2">
                    <InvoicePlaceholder />
                  </Layouts.Margin>
                  <Typography
                    color="secondary"
                    shade="desaturated"
                    textAlign="center"
                    variant="bodyMedium"
                  >
                    {error ? t(`${I18N_PATH}InvoicesNotFound`) : t(`${I18N_PATH}PleaseWait`)}
                  </Typography>
                </div>
              )}
            </Layouts.Padding>
          </Layouts.Scroll>
        }
        actionsElement={
          <Layouts.Flex justifyContent="space-between">
            <Button onClick={closeQuickView}>{t('Text.Cancel')}</Button>
            <Button
              variant="primary"
              disabled={loading || customers.length === 0}
              onClick={handleCreateFinancialCharge}
            >
              {t(`${I18N_PATH}GenerateFinanceCharges`)}
            </Button>
          </Layouts.Flex>
        }
      />
    </>
  );
};

export default observer(FinanceChargeDraftQuickView);
