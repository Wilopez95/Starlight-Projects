import React from 'react';

import { ICustomQuickView, QuickView, QuickViewPaths } from '@root/common/QuickView';
import { useStores } from '@root/hooks';

import BatchStatementQuickViewContent from './BatchStatementQuickViewContent';
import { IBatchStatementQuickView } from './types';

const BatchStatementQuickView: React.FC<
  IBatchStatementQuickView & ICustomQuickView & QuickViewPaths
> = ({
  onFinanceChargeQuickViewOpen,
  showSummaryModal,
  setGenerationJob,
  loading,
  setLoading,
  stopCheckingJobResult,
  ...quickViewProps
}) => {
  const { batchStatementStore } = useStores();

  return (
    <QuickView {...quickViewProps} store={batchStatementStore} size="three-quarters">
      <BatchStatementQuickViewContent
        showSummaryModal={showSummaryModal}
        setGenerationJob={setGenerationJob}
        loading={loading}
        setLoading={setLoading}
        stopCheckingJobResult={stopCheckingJobResult}
        onFinanceChargeQuickViewOpen={onFinanceChargeQuickViewOpen}
      />
    </QuickView>
  );
};

export default BatchStatementQuickView;
