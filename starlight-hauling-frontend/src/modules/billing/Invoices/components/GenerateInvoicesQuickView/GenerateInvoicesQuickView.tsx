import React from 'react';

import { QuickView } from '../../../../../common';
import { useStores } from '../../../../../hooks';

import GenerateInvoicesQuickViewContent from './GenerateInvoicesQuickViewContent';
import { type IGenerateInvoicesQuickView } from './types';

const GenerateInvoicesQuickView: React.FC<IGenerateInvoicesQuickView> = ({
  isOpen,
  backToOptions,
  ...contentProps
}) => {
  const { orderStore } = useStores();

  return (
    <QuickView
      isOpen={isOpen}
      onClose={backToOptions}
      store={orderStore}
      size="three-quarters"
      shouldDeselect={false}
      overlay
    >
      <GenerateInvoicesQuickViewContent backToOptions={backToOptions} {...contentProps} />
    </QuickView>
  );
};

export default GenerateInvoicesQuickView;
