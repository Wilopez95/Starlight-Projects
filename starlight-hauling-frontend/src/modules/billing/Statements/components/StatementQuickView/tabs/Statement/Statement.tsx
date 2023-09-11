import React from 'react';
import { Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { PdfViewer } from '@root/common';

import { useStores } from '../../../../../../../hooks';

const Statement: React.FC = () => {
  const { statementStore } = useStores();
  const selectedStatement = statementStore.selectedEntity;

  return (
    <Layouts.Box width="100%" height="100%">
      <PdfViewer url={selectedStatement?.pdfUrl} />
    </Layouts.Box>
  );
};

export default observer(Statement);
