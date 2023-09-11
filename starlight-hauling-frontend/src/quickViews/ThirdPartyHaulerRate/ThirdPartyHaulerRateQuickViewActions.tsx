import React from 'react';
import { useFormikContext } from 'formik';
import { noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { useQuickViewContext } from '@root/common';
import { useCrudPermissions } from '@root/hooks';
import { ButtonContainer } from '@root/pages/SystemConfiguration/components';

const ThirdPartyHaulerRateQuickViewActions: React.FC = () => {
  const [_, canUpdateOperatingCosts] = useCrudPermissions('configuration', 'operating-costs');
  const { closeQuickView } = useQuickViewContext();
  const { handleSubmit } = useFormikContext();

  return (
    <ButtonContainer
      onCancel={closeQuickView}
      disabled={!canUpdateOperatingCosts}
      onSave={
        canUpdateOperatingCosts
          ? () => {
              handleSubmit();
            }
          : noop
      }
    />
  );
};

export default observer(ThirdPartyHaulerRateQuickViewActions);
