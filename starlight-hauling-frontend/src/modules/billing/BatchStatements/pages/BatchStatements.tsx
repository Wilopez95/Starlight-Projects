import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { observer } from 'mobx-react-lite';

import { ActionCode } from '@root/helpers/notifications/types';

import { TableInfiniteScroll, TablePageContainer, TableTools } from '../../../../common/TableTools';
import { Paths } from '../../../../consts';
import { NotificationHelper, pathToUrl } from '../../../../helpers';
import {
  useBoolean,
  useBusinessContext,
  useCleanup,
  usePermission,
  useStores,
} from '../../../../hooks';
import { FinanceChargeDraftQuickView } from '../../components';
import { GenerationJobService } from '../../shared/api';
import { type IGenerationJobResult } from '../../shared/types';
import BatchStatementQuickView from '../components/BatchStatementQuickView/BatchStatementQuickView';
import BatchStatementsTable from '../components/BatchStatementsTable/BatchStatementsTable';
import BatchStatementSummaryModal from '../components/BatchStatementSummaryModal/BatchStatementSummaryModal';
import Header from '../components/Header/Header';
import { BatchStatement } from '../store/BatchStatement';

const I18N_PATH = 'pages.BatchStatements.BatchStatements.';

const BatchStatements: React.FC = () => {
  const { batchStatementStore, statementStore } = useStores();

  useCleanup(batchStatementStore, 'STATEMENT_DATE', 'desc');

  const canAccessStatements = usePermission('billing:batch-statements:full-access');
  const tableContainerRef = useRef<HTMLTableElement>(null);
  const [generationJobId, setGenerationJob] = useState<string>();
  const generationJobService = useRef(new GenerationJobService());
  const [jobStatus, setJobStatus] = useState<IGenerationJobResult | null>(null);
  const intervalHandle = useRef<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [statementsTotal, setStatementsTotal] = useState<number>(0);
  const [isSummaryModalOpen, showSummaryModal, hideSummaryModal] = useBoolean();

  const { t } = useTranslation();

  const { businessUnitId } = useBusinessContext();
  const { id } = useParams<{ id?: string }>();
  const [statementsIds, setStatementsIds] = useState<number[]>([]);

  const loadMore = useCallback(() => {
    if (!canAccessStatements) {
      NotificationHelper.error('default', ActionCode.ACCESS_DENIED);
      batchStatementStore.markLoaded();

      return;
    }

    batchStatementStore.request({ businessUnitId });
  }, [batchStatementStore, businessUnitId, canAccessStatements]);

  useEffect(() => {
    if (id) {
      batchStatementStore.toggleQuickView(true);
    }
  }, [id, batchStatementStore]);

  const handleCleanUpStatements = useCallback(() => {
    setStatementsIds([]);
  }, []);

  const handleRowClick = useCallback(
    (batchStatement: BatchStatement) => {
      batchStatementStore.selectEntity(batchStatement);
    },
    [batchStatementStore],
  );

  const openBatchStatementUrl = pathToUrl(`${Paths.BillingModule.BatchStatements}`, {
    businessUnit: businessUnitId,
    id: batchStatementStore.selectedEntity?.id,
  });
  const closeBatchStatementUrl = pathToUrl(Paths.BillingModule.BatchStatements, {
    businessUnit: businessUnitId,
    id: undefined,
  });

  const handleBatchStatementGenerationFailure = useCallback(() => {
    NotificationHelper.error('default');
    batchStatementStore.toggleQuickView(false);
  }, [batchStatementStore]);

  const stopCheckingJobResult = useCallback(() => {
    if (intervalHandle.current !== null) {
      window.clearInterval(intervalHandle.current);
      intervalHandle.current = null;
    }
  }, []);

  useEffect(() => {
    const checkGenerationJobResult = async (genJobId: string) => {
      try {
        const response = await generationJobService.current.getJobStatus({
          id: genJobId,
        });

        const { generationJobStatus } = response;

        setJobStatus(generationJobStatus);

        if (
          generationJobStatus?.status === 'FINISHED' ||
          (generationJobStatus &&
            generationJobStatus.expectedCount ===
              generationJobStatus.failedCount + generationJobStatus.count)
        ) {
          stopCheckingJobResult();

          const jobResultResponse = await generationJobService.current.getStatementsResult({
            id: genJobId,
          });

          const { statementGenerationJob } = jobResultResponse;

          if (statementGenerationJob) {
            setStatementsTotal(statementGenerationJob.total);
            setLoading(false);
            if (statementGenerationJob.batchStatementId) {
              batchStatementStore.cleanup();
              batchStatementStore.request({ businessUnitId });
            }
          } else {
            handleBatchStatementGenerationFailure();
          }
        }
      } catch {
        stopCheckingJobResult();
        handleBatchStatementGenerationFailure();
      }
    };

    if (generationJobId && !intervalHandle.current) {
      intervalHandle.current = window.setInterval(() => {
        checkGenerationJobResult(generationJobId);
      }, 3000);
    }
  }, [
    batchStatementStore,
    businessUnitId,
    generationJobId,
    handleBatchStatementGenerationFailure,
    showSummaryModal,
    statementStore,
    stopCheckingJobResult,
  ]);

  return (
    <>
      <BatchStatementQuickView
        isOpen={batchStatementStore.isOpenQuickView}
        onFinanceChargeQuickViewOpen={setStatementsIds}
        setGenerationJob={setGenerationJob}
        showSummaryModal={showSummaryModal}
        loading={loading}
        setLoading={setLoading}
        stopCheckingJobResult={stopCheckingJobResult}
        closeUrl={closeBatchStatementUrl}
        openUrl={openBatchStatementUrl}
        clickOutContainers={tableContainerRef}
      />
      <FinanceChargeDraftQuickView
        statementIds={statementsIds}
        isOpen={statementsIds.length > 0}
        onClose={handleCleanUpStatements}
      />
      <BatchStatementSummaryModal
        jobStatus={jobStatus}
        isOpen={isSummaryModalOpen}
        onClose={hideSummaryModal}
        loading={loading}
        statementsTotal={statementsTotal}
      />

      <TablePageContainer>
        <Header />
        <TableTools.ScrollContainer>
          <BatchStatementsTable
            tableBodyContainer={tableContainerRef}
            onSelect={handleRowClick}
            onSort={loadMore}
          />
          <TableInfiniteScroll
            onLoaderReached={loadMore}
            loaded={batchStatementStore.loaded}
            loading={batchStatementStore.loading}
          >
            {t(`${I18N_PATH}LoadingBatchStatements`)}
          </TableInfiniteScroll>
        </TableTools.ScrollContainer>
      </TablePageContainer>
    </>
  );
};

export default observer(BatchStatements);
