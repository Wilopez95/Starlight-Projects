import React, { useCallback, useEffect } from 'react';

import { UnsavedChangesModal as BaseUnsavedChangesModal } from '@root/common/TableTools/TableQuickView/UnsavedChanges/UnsavedChangesModal';

import { useUnsavedChangesContext } from './context';
import { IUnsavedChangesModal } from './types';

export const UnsavedChangesModal: React.FC<IUnsavedChangesModal> = ({ dirty, onSubmit }) => {
  const { isOpen, close, isDirtyRef: shouldOpenModalRef, confirm } = useUnsavedChangesContext();

  const handleSubmit = useCallback(() => {
    confirm();
    onSubmit();
  }, [confirm, onSubmit]);

  useEffect(() => {
    if (shouldOpenModalRef) {
      shouldOpenModalRef.current = dirty;
    }
  }, [dirty, shouldOpenModalRef]);

  return <BaseUnsavedChangesModal isOpen={isOpen} onCancel={close} onSubmit={handleSubmit} />;
};
