import React from 'react';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { useQuickViewContext } from '@root/common';
import { useCrudPermissions } from '@root/hooks';
import { ButtonContainer } from '@root/pages/SystemConfiguration/components';

const MaterialMappingQuickViewActions: React.FC = () => {
  const { closeQuickView } = useQuickViewContext();
  const { handleSubmit } = useFormikContext();
  const [, canUpdateDisposalSites] = useCrudPermissions('configuration', 'disposal-sites');

  return (
    <ButtonContainer
      onSave={canUpdateDisposalSites ? () => handleSubmit() : undefined}
      onCancel={closeQuickView}
    />
  );
};

export default observer(MaterialMappingQuickViewActions);
