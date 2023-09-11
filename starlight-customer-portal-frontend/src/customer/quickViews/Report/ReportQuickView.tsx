import React from 'react';
import { observer } from 'mobx-react-lite';

import { TableQuickView, withQuickView } from '@root/core/common/TableTools';
import { useStores } from '@root/core/hooks';

import ReportQuickViewContent from './ReportQuickViewContent';
import { IReportQuickView } from './types';

const ReportQuickView: React.FC<IReportQuickView> = ({ parentRef }) => {
  const { reportStore } = useStores();

  return (
    <TableQuickView
      clickOutSelectors={['#exagomastercontainer']}
      store={reportStore}
      size='three-quarters'
      parentRef={parentRef}
    >
      {({ onCancel }) => <ReportQuickViewContent onClose={onCancel} />}
    </TableQuickView>
  );
};

export default withQuickView(observer(ReportQuickView));
