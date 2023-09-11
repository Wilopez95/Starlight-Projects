import React from 'react';
import { observer } from 'mobx-react-lite';

import { ICustomQuickView, QuickView } from '@root/common/QuickView';
import { useStores } from '@root/hooks';

import StatementQuickViewContent from './StatementQuickViewContent';
import { IStatementQuickView } from './types';

const StatementQuickView: React.FC<IStatementQuickView & ICustomQuickView> = ({
  onFinanceChargeQuickViewOpen,
  request,
  ...quickViewProps
}) => {
  const { statementStore } = useStores();
  const selectedStatement = statementStore.selectedEntity;

  return (
    <QuickView
      {...quickViewProps}
      store={statementStore}
      size={selectedStatement ? 'half' : 'default'}
    >
      <StatementQuickViewContent
        onFinanceChargeQuickViewOpen={onFinanceChargeQuickViewOpen}
        request={request}
      />
    </QuickView>
  );
};

export default observer(StatementQuickView);
