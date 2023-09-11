import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layouts } from '@starlightpro/shared-components';
import cx from 'classnames';

import { useIntl } from '@root/i18n/useIntl';
import { FinanceChargeService } from '@root/modules/billing/FinanceCharges/api/financeCharge';
import { GenerationJobService } from '@root/modules/billing/shared/api';
import { type IFinChargeGenerationJobResult } from '@root/modules/billing/shared/types';

import { InvoicePlaceholder } from '../../../../../assets';
import { Modal, Typography } from '../../../../../common';
import { Divider } from '../../../../../common/TableTools';
import { useStores } from '../../../../../hooks';

import { IStatusModal } from './types';

import styles from './css/styles.scss';

const I18N_PATH = 'quickViews.FinanceChargeDraftQuickView.StatusModal.';

const InvoicingStatusModal: React.FC<IStatusModal> = ({ data, isOpen, onClose }) => {
  const { financeChargeStore } = useStores();
  const generationJobService = useRef(new GenerationJobService());
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [generationJobId, setGenerationJob] = useState<string>();
  const [generationResult, setGenerationResult] = useState<IFinChargeGenerationJobResult>();
  const intervalHandle = useRef<number | null>(null);
  const { formatCurrency } = useIntl();
  const { t } = useTranslation();

  useEffect(() => {
    const query = async () => {
      const generationJobIdData = await financeChargeStore.create(data);

      if (generationJobIdData) {
        setGenerationJob(generationJobIdData);
      } else {
        setFailed(true);
      }
    };

    query();
  }, [data, financeChargeStore]);

  const stopCheckingJobResult = useCallback(() => {
    if (intervalHandle.current !== null) {
      window.clearInterval(intervalHandle.current);
    }
  }, []);

  useEffect(() => {
    const checkGenerationJobResult = async (generationJobIdData: string) => {
      try {
        const response = await generationJobService.current.getJobStatus({
          id: generationJobIdData,
        });

        const { generationJobStatus } = response;

        if (
          generationJobStatus?.status === 'FINISHED' ||
          (generationJobStatus &&
            generationJobStatus.expectedCount ===
              generationJobStatus.failedCount + generationJobStatus.count)
        ) {
          stopCheckingJobResult();

          const jobResultResponse = await generationJobService.current.getFinChargesResult({
            id: generationJobIdData,
          });

          if (jobResultResponse.finChargeGenerationJob) {
            setGenerationResult(jobResultResponse.finChargeGenerationJob);
            setLoading(false);
          } else {
            setFailed(true);
          }
        }
      } catch {
        stopCheckingJobResult();
        setFailed(true);
      }
    };

    if (generationJobId && !intervalHandle.current) {
      intervalHandle.current = window.setInterval(() => {
        checkGenerationJobResult(generationJobId);
      }, 3000);
    }
  }, [generationJobId, stopCheckingJobResult]);

  useEffect(() => () => stopCheckingJobResult(), [stopCheckingJobResult]);

  const handleSendFinanceCharges = useCallback(() => {
    if (generationResult) {
      financeChargeStore.sendFinanceCharges({ ids: generationResult.financeChargeIds });
    }

    onClose?.();
  }, [financeChargeStore, generationResult, onClose]);

  const handleFinChargesDownload = useCallback(() => {
    if (generationResult) {
      FinanceChargeService.downloadFinanceCharges(
        generationResult.financeChargeIds.map(id => `ids=${id}`).join('&'),
      );
    }
  }, [generationResult]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} className={cx(styles.modal, failed && styles.failed)}>
      {loading && !failed ? (
        <div className={styles.loader}>
          <Layouts.Margin margin="2">
            <InvoicePlaceholder />
          </Layouts.Margin>
          <Typography color="secondary" shade="desaturated" textAlign="center" variant="bodyMedium">
            {t(`${I18N_PATH}PleaseWait`)}
          </Typography>
        </div>
      ) : (
        <Layouts.Flex direction="column">
          <Layouts.Padding top="3" right="5" left="5">
            <Typography variant="headerThree">{t(`${I18N_PATH}FinanceChangesSummary`)}</Typography>
          </Layouts.Padding>
          <Layouts.Padding padding="5">
            <Typography variant="bodyMedium" color="secondary">
              {failed ? t(`${I18N_PATH}ErrorText`) : t(`${I18N_PATH}SuccessText`)}
            </Typography>
          </Layouts.Padding>
          {!failed && generationResult ? (
            <Layouts.Flex direction="column" flexGrow={1}>
              <Layouts.Padding left="5" right="5" bottom="2">
                <Layouts.Padding bottom="1">
                  <Layouts.Flex justifyContent="space-between">
                    <Typography color="secondary" variant="bodyMedium">
                      {t(`${I18N_PATH}Customers`)}
                    </Typography>
                    <Typography variant="bodyMedium">{generationResult.customersCount}</Typography>
                  </Layouts.Flex>
                </Layouts.Padding>
                <Layouts.Padding bottom="1">
                  <Layouts.Flex justifyContent="space-between">
                    <Typography color="secondary" variant="bodyMedium">
                      {t(`${I18N_PATH}OverdueInvoices`)}
                    </Typography>
                    <Typography variant="bodyMedium">{generationResult.invoicesCount}</Typography>
                  </Layouts.Flex>
                </Layouts.Padding>

                <Layouts.Padding bottom="1">
                  <Layouts.Flex justifyContent="space-between">
                    <Typography color="secondary" variant="headerFour" fontWeight="bold">
                      {t(`${I18N_PATH}FinanceChargesTotal`)}
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
              <Layouts.Flex justifyContent="flex-end">
                {failed ? (
                  <Layouts.Margin left="auto">
                    <Button variant="conversePrimary" onClick={onClose}>
                      {t('Text.Close')}
                    </Button>
                  </Layouts.Margin>
                ) : (
                  <>
                    <Button variant="conversePrimary" onClick={handleSendFinanceCharges}>
                      {t('Text.Send')}
                    </Button>
                    {generationResult && generationResult.financeChargeIds.length > 0 ? (
                      <Layouts.Margin left="2">
                        <Button variant="conversePrimary" onClick={handleFinChargesDownload}>
                          {t('Text.Download')}
                        </Button>
                      </Layouts.Margin>
                    ) : null}
                    <Layouts.Margin left="2">
                      <Button variant="primary" onClick={onClose}>
                        {t('Text.Close')}
                      </Button>
                    </Layouts.Margin>
                  </>
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
