import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';

import { ICustomQuickView, QuickView, QuickViewContent } from '@root/common/QuickView';
import { useStores } from '@root/hooks';

import Actions from './components/Actions/Actions';
import FormContainer from './components/FormContainer/FormContainer';
import LeftPanel from './components/LeftPanel/LeftPanel';
import RightPanel from './components/RightPanel/RightPanel';

const SubscriptionOrderEdit: React.FC<ICustomQuickView> = ({ ...quickViewProps }) => {
  const { subscriptionOrderStore } = useStores();

  const handleClose = useCallback(() => {
    subscriptionOrderStore.closeEdit();
  }, [subscriptionOrderStore]);

  return (
    <QuickView
      overlay
      size="three-quarters"
      store={subscriptionOrderStore}
      onClose={handleClose}
      {...quickViewProps}
    >
      <FormContainer closeOnSubmit>
        <QuickViewContent
          leftPanelElement={<LeftPanel />}
          rightPanelElement={<RightPanel />}
          actionsElement={<Actions />}
        />
      </FormContainer>
    </QuickView>
  );
};

export default observer(SubscriptionOrderEdit);
