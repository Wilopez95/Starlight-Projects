import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import {
  QuickViewConfirmModal,
  QuickViewContent,
  useQuickViewContext,
} from '@root/common/QuickView';

import {
  CompanyService,
  ICommonInvoicingRequest,
  InvoicingData,
  IOrderInvoicingRequest,
  OrderService,
} from '../../../../../api';
import { convertDates, NotificationHelper } from '../../../../../helpers';
import { ICompany } from '../../../../../types';

import { ActionButtonContext } from './components/ActionButtonContainer/ActionButtonContainer';
import InvoicesList from './components/InvoicesList/InvoicesList';
import { InvoicingLoader, InvoicingSidebar } from './components';
import {
  getOrdersInvoicesRequestData,
  getSubscriptionsInvoicesRequestData,
  mapRunCommonInvoicingResponse,
  mapRunOrdersInvoicingResponse,
} from './helpers';
import { Container, ContentGrid, ContentWrapper } from './styles';
import {
  type FormikCustomerWithInvoiceDrafts,
  type IGenerateInvoicesQuickViewContent,
  GenerateInvoicingMode,
} from './types';

const I18N_PATH = 'pages.Invoices.RunInvoicingMenu.';

const GenerateInvoicesQuickViewContent: React.FC<IGenerateInvoicesQuickViewContent> = ({
  backToOptions,
  businessUnitId,
  processedOrdersCount,
  invoicingOptions,
  onCloseInvoicing,
  onInvoicesSave,
  processedSubscriptionsCount = 0,
  mode = GenerateInvoicingMode.Orders,
}) => {
  const buttonContainer = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const [invoicingData, setInvoicingData] = useState<InvoicingData>();
  const [company, setCompany] = useState<ICompany>();
  const [loadingInvoicingData, setLoading] = useState(false);
  const { closeQuickView } = useQuickViewContext();

  useEffect(() => {
    (async () => {
      const response = await CompanyService.currentCompany();

      setCompany(convertDates(response));
    })();
  }, []);

  useEffect(() => {
    if (invoicingOptions && !loadingInvoicingData) {
      setLoading(true);
      (async () => {
        try {
          let response;
          let invoices;

          if (mode === GenerateInvoicingMode.Orders) {
            response = await OrderService.runOrdersInvoicing(
              invoicingOptions as IOrderInvoicingRequest,
              { businessUnitId },
            );
            invoices = mapRunOrdersInvoicingResponse(response);
          } else {
            response = await OrderService.runOrdersAndSubscriptionsInvoicing(
              invoicingOptions as ICommonInvoicingRequest,
              { businessUnitId },
            );
            invoices = mapRunCommonInvoicingResponse(response);
          }
          setInvoicingData(invoices);
        } catch {
          backToOptions();
          NotificationHelper.error('runInvoicing');
        }
      })();
    }
  }, [invoicingOptions, backToOptions, businessUnitId, mode, loadingInvoicingData]);

  const handleSave = useCallback(
    (customersInvoices: FormikCustomerWithInvoiceDrafts[], withOverride: boolean) => {
      backToOptions();
      onCloseInvoicing();

      const orderInvoiceRequestData = getOrdersInvoicesRequestData(customersInvoices, withOverride);
      const requestData =
        mode === GenerateInvoicingMode.Orders
          ? orderInvoiceRequestData
          : {
              invoices: orderInvoiceRequestData.invoices.concat(
                getSubscriptionsInvoicesRequestData(customersInvoices).invoices,
              ),
              billingDate: (invoicingOptions as ICommonInvoicingRequest).billingDate,
            };

      onInvoicesSave(requestData);
    },
    [backToOptions, invoicingOptions, mode, onCloseInvoicing, onInvoicesSave],
  );

  return (
    <QuickViewContent
      dirty={true}
      confirmModal={
        <QuickViewConfirmModal
          title={t(`${I18N_PATH}CancelInvoicing`)}
          subTitle={t(`${I18N_PATH}CancelInvoicingSubTitle`)}
          cancelButtonText={t(`${I18N_PATH}BackToDrafts`)}
          submitButtonText={t(`${I18N_PATH}CancelInvoicingButton`)}
        />
      }
      rightPanelElement={
        <Container>
          <ActionButtonContext.Provider value={buttonContainer}>
            {invoicingData && company ? (
              <InvoicesList
                invoicingData={invoicingData}
                currentCompany={company}
                onSave={handleSave}
                onClose={backToOptions}
                mode={mode}
                onCancelInvoicing={closeQuickView}
              />
            ) : (
              <ContentWrapper>
                <ContentGrid columns="1fr 3fr">
                  <InvoicingSidebar
                    loading
                    mode={mode}
                    defaultOrdersCount={processedOrdersCount}
                    defaultSubscriptionsCount={processedSubscriptionsCount}
                    onClose={backToOptions}
                  />
                  <InvoicingLoader />
                </ContentGrid>
              </ContentWrapper>
            )}
          </ActionButtonContext.Provider>
        </Container>
      }
      actionsElement={
        <Layouts.Flex justifyContent="space-between" ref={buttonContainer}>
          {!invoicingData || !company ? (
            <Button onClick={backToOptions}>{t('Text.Cancel')}</Button>
          ) : null}
        </Layouts.Flex>
      }
    />
  );
};

export default observer(GenerateInvoicesQuickViewContent);
