import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layouts } from '@starlightpro/shared-components';
import cx from 'classnames';

import { OrderService } from '../../../../../api';
import { InvoicePlaceholder } from '../../../../../assets';
import { Modal, Typography } from '../../../../../common';
import { type IModal } from '../../../../../common/Modal/types';
import { Divider } from '../../../../../common/TableTools';
import { Paths, Routes } from '../../../../../consts';
import { pathToUrl } from '../../../../../helpers';
import { useBusinessContext } from '../../../../../hooks';
import { useIntl } from '../../../../../i18n/useIntl';
import { GenerateInvoicesRequest } from '../../../../../modules/billing/types';
import { GenerationJobService } from '../../../shared/api';
import { IInvoiceGenerationJobResult } from '../../../shared/types';
import { GenerateInvoicingMode } from '../GenerateInvoicesQuickView/types';

import styles from './css/styles.scss';

interface IInvoicingStatusModal extends IModal {
  data: GenerateInvoicesRequest;
  mode?: GenerateInvoicingMode;
  onInvoicesGenerated(): void;
}

const I18N_PATH = 'components.OrderTable.modals.InvoicingStatusModal.Text.';

const MAX_RETRIES_COUNT = 3;

const InvoicingStatusModal: React.FC<IInvoicingStatusModal> = ({
  data,
  onInvoicesGenerated,
  isOpen,
  onClose,
  mode = GenerateInvoicingMode.Orders,
}) => {
  const generationJobService = useRef(new GenerationJobService());
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [generationJobId, setGenerationJob] = useState<string>();
  const { businessUnitId } = useBusinessContext();
  const [generationResult, setGenerationResult] = useState<IInvoiceGenerationJobResult>();
  const intervalHandle = useRef<number | null>(null);
  const retriesCount = useRef<number>(0);
  const { formatCurrency } = useIntl();
  const { t } = useTranslation();

  useEffect(() => {
    (async () => {
      const invoiceRequest =
        mode === GenerateInvoicingMode.Orders
          ? OrderService.saveOrderInvoices
          : OrderService.saveCommonInvoices;

      try {
        const { generationJobId: generationJobIdData } = await invoiceRequest({
          ...data,
          businessUnitId: +businessUnitId,
        });

        setGenerationJob(generationJobIdData);
      } catch {
        setFailed(true);
      }
    })();
  }, [data, businessUnitId, mode]);

  const stopCheckingJobResult = useCallback(() => {
    if (intervalHandle.current !== null) {
      window.clearInterval(intervalHandle.current);
    }
  }, []);

  useEffect(() => {
    const checkGenerationJobResult = async (generationJobIdInfo: string) => {
      try {
        const response = await generationJobService.current.getJobStatus({
          id: generationJobIdInfo,
        });

        const { generationJobStatus } = response;

        if (
          generationJobStatus?.status === 'FINISHED' ||
          (generationJobStatus &&
            generationJobStatus.expectedCount ===
              generationJobStatus.failedCount + generationJobStatus.count)
        ) {
          stopCheckingJobResult();

          const jobResultResponse = await generationJobService.current.getInvoicingResult({
            id: generationJobIdInfo,
          });

          if (jobResultResponse.invoiceGenerationJob) {
            setGenerationResult(jobResultResponse.invoiceGenerationJob);
            setLoading(false);
            onInvoicesGenerated();
          } else {
            setFailed(true);
          }
        }
      } catch {
        retriesCount.current++;

        if (retriesCount.current >= MAX_RETRIES_COUNT) {
          stopCheckingJobResult();
          setFailed(true);
        }
      }
    };

    let minData = data.invoices?.length < 5;

    if (minData) {
      const count = data.invoices.reduce(
        (acc: number, item) => acc + (item.orders?.length ?? 0) + (item.subscriptions?.length ?? 0),
        0,
      );

      minData = count < 15;
    }

    if (generationJobId && !intervalHandle.current) {
      intervalHandle.current = window.setInterval(
        () => {
          checkGenerationJobResult(generationJobId);
        },
        minData ? 500 : 2500,
      );
    }
  }, [stopCheckingJobResult, generationJobId, onInvoicesGenerated, data.invoices]);

  useEffect(() => () => stopCheckingJobResult(), [stopCheckingJobResult]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} className={cx(styles.modal, failed && styles.failed)}>
      {loading && !failed ? (
        <div className={styles.loader}>
          <Layouts.Margin margin="2">
            <InvoicePlaceholder />
          </Layouts.Margin>
          <Typography color="secondary" shade="desaturated" textAlign="center" variant="bodyMedium">
            {t(`${I18N_PATH}LoadingText`)}
          </Typography>
        </div>
      ) : (
        <Layouts.Flex direction="column">
          <Layouts.Padding top="3" right="5" left="5">
            <Typography variant="headerThree">{t(`${I18N_PATH}InvoicingSummary`)}</Typography>
          </Layouts.Padding>
          <Layouts.Padding padding="5">
            <Typography variant="bodyMedium" color="secondary">
              {t(`${I18N_PATH}${failed ? 'ErrorProcessInvoices' : 'SuccessProcessInvoices'}`)}
            </Typography>
          </Layouts.Padding>
          {!failed && generationResult ? (
            <Layouts.Flex direction="column" flexGrow={1}>
              <Layouts.Padding left="5" right="5" bottom="2">
                <Layouts.Padding bottom="1">
                  <Layouts.Flex justifyContent="space-between">
                    <Typography color="secondary" variant="bodyMedium">
                      {t(`${I18N_PATH}ProcessedOrders`)}:
                    </Typography>
                    <Typography variant="bodyMedium">{generationResult.processedOrders}</Typography>
                  </Layouts.Flex>
                </Layouts.Padding>
                {mode === GenerateInvoicingMode.OrdersAndSubscriptions ? (
                  <Layouts.Padding bottom="1">
                    <Layouts.Flex justifyContent="space-between">
                      <Typography color="secondary" variant="bodyMedium">
                        {t(`${I18N_PATH}ProcessedSubscriptions`)}:
                      </Typography>
                      <Typography variant="bodyMedium">
                        {generationResult.processedSubscriptions}
                      </Typography>
                    </Layouts.Flex>
                  </Layouts.Padding>
                ) : null}
                <Layouts.Padding bottom="1">
                  <Layouts.Flex justifyContent="space-between">
                    <Typography color="secondary" variant="bodyMedium">
                      {t(`${I18N_PATH}CustomersIncluded`)}:
                    </Typography>
                    <Typography variant="bodyMedium">
                      {generationResult.customersIncluded}
                    </Typography>
                  </Layouts.Flex>
                </Layouts.Padding>
                <Layouts.Padding bottom="1">
                  <Layouts.Flex justifyContent="space-between">
                    <Typography color="secondary" variant="bodyMedium">
                      {t(`${I18N_PATH}GeneratedInvoices`)}:
                    </Typography>
                    <Typography variant="bodyMedium">
                      {generationResult.generatedInvoices}
                    </Typography>
                  </Layouts.Flex>
                </Layouts.Padding>
                <Layouts.Padding bottom="1">
                  <Layouts.Flex justifyContent="space-between">
                    <Typography color="secondary" variant="headerFour" fontWeight="bold">
                      {t(`${I18N_PATH}InvoicesTotal`)}:
                    </Typography>
                    <Typography variant="headerFour" fontWeight="bold">
                      {formatCurrency(generationResult.invoicesTotal)}
                    </Typography>
                  </Layouts.Flex>
                </Layouts.Padding>
              </Layouts.Padding>
            </Layouts.Flex>
          ) : null}
          <Layouts.Flex direction="column">
            <Divider />
            <Layouts.Padding padding="4" left="5" right="5">
              <Layouts.Flex justifyContent="space-between">
                {failed ? (
                  <Layouts.Margin left="auto">
                    <Button variant="conversePrimary" onClick={onClose}>
                      {t('Text.Close')}
                    </Button>
                  </Layouts.Margin>
                ) : mode === GenerateInvoicingMode.Orders ? (
                  <>
                    <Button
                      variant="conversePrimary"
                      to={pathToUrl(Paths.BillingModule.Invoices, {
                        businessUnit: businessUnitId,
                        subPath: Routes.Invoices,
                        id: undefined,
                      })}
                    >
                      {t(`${I18N_PATH}ViewInvoices`)}
                    </Button>
                    <Button variant="primary" onClick={onClose}>
                      {t('Text.Close')}
                    </Button>
                  </>
                ) : (
                  <Layouts.Margin left="auto">
                    <Button variant="primary" onClick={onClose}>
                      {t('Text.Thanks')}
                    </Button>
                  </Layouts.Margin>
                )}
              </Layouts.Flex>
            </Layouts.Padding>
          </Layouts.Flex>
        </Layouts.Flex>
      )}
    </Modal>
  );
};

export default InvoicingStatusModal;
