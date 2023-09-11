import React from 'react';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { useCrudPermissions, useStores } from '@root/hooks';
import { ButtonContainer } from '@root/pages/SystemConfiguration/components';

const DisposalRatesQuickView: React.FC = () => {
  const { handleSubmit, isSubmitting } = useFormikContext();
  const { disposalSiteStore } = useStores();
  const [_, canUpdateOperatingCosts] = useCrudPermissions('configuration', 'operating-costs');

  if (!canUpdateOperatingCosts) {
    return null;
  }

  return (
    <ButtonContainer
      onSave={() => handleSubmit()}
      onCancel={() => disposalSiteStore.closeRates()}
      disabled={isSubmitting}
    />
  );
};

export default observer(DisposalRatesQuickView);
