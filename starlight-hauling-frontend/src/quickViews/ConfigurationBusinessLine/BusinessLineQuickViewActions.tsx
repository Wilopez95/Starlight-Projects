import React from 'react';
import { useFormikContext } from 'formik';

import { useQuickViewContext } from '@root/common';
import { ButtonContainer } from '@root/pages/SystemConfiguration/components';

import { IBusinessLineQuickViewData } from './types';

export const BusinessLineQuickViewActions: React.FC<IBusinessLineQuickViewData> = ({ isNew }) => {
  const { closeQuickView } = useQuickViewContext();
  const { handleSubmit, isSubmitting } = useFormikContext();

  return (
    <ButtonContainer
      isCreating={isNew}
      onSave={() => handleSubmit()}
      onCancel={closeQuickView}
      disabled={isSubmitting}
    />
  );
};
