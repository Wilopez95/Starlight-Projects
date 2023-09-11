import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';

import { ICustomQuickView, QuickView, QuickViewContent } from '@root/common/QuickView';
import FormContainer from '@root/components/FormContainer/FormContainer';
import { useStores } from '@root/hooks';

import ButtonContainer from './ButtonContainer/ButtonContainer';
import LeftPanel from './components/LeftPanel/LeftPanel';
import RightPanel from './components/RightPanel/RightPanel';
import { useInitFormikData } from './hooks/useInitFormikData';

const SubscriptionOrderDetails: React.FC<ICustomQuickView> = quickViewProps => {
  const { subscriptionOrderStore } = useStores();

  const formik = useInitFormikData();

  const handleClose = useCallback(() => {
    subscriptionOrderStore.closeDetails();
  }, [subscriptionOrderStore]);

  return (
    <QuickView
      overlay
      size="three-quarters"
      store={subscriptionOrderStore}
      onAfterClose={handleClose}
      {...quickViewProps}
    >
      <FormContainer formik={formik} noValidate>
        <QuickViewContent
          rightPanelElement={<RightPanel />}
          leftPanelElement={<LeftPanel />}
          actionsElement={<ButtonContainer />}
        />
      </FormContainer>
    </QuickView>
  );
};

export default observer(SubscriptionOrderDetails);
