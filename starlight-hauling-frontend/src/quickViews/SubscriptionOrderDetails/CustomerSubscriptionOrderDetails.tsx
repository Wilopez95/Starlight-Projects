import React, { useCallback } from 'react';
import { Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Divider, TableQuickView, withQuickView } from '@root/common/TableTools';
import FormContainer from '@root/components/FormContainer/FormContainer';
import { useStores } from '@root/hooks';
import { IQuickView } from '@root/quickViews/types';

import ButtonContainer from './ButtonContainer/ButtonContainer';
import LeftPanel from './components/LeftPanel/LeftPanel';
import RightPanel from './components/RightPanel/RightPanel';
import { useInitFormikData } from './hooks/useInitFormikData';

const CustomerSubscriptionOrderDetails: React.FC<IQuickView> = ({ tableContainerRef }) => {
  const { subscriptionOrderStore } = useStores();

  const formik = useInitFormikData();

  const handleClose = useCallback(() => {
    subscriptionOrderStore.closeDetails();
  }, [subscriptionOrderStore]);

  return (
    <TableQuickView
      parentRef={tableContainerRef}
      clickOutContainers={tableContainerRef}
      store={subscriptionOrderStore}
      size="full"
      clickOutHandler={handleClose}
    >
      {({ scrollContainerHeight }) => (
        <FormContainer formik={formik} noValidate>
          <Layouts.Scroll maxHeight={scrollContainerHeight - 70}>
            <Layouts.Flex as={Layouts.Box} height="100%" justifyContent="space-between">
              <LeftPanel />
              <RightPanel />
            </Layouts.Flex>
          </Layouts.Scroll>
          <Divider />
          <Layouts.Padding padding="2">
            <ButtonContainer />
          </Layouts.Padding>
        </FormContainer>
      )}
    </TableQuickView>
  );
};

export default withQuickView(observer(CustomerSubscriptionOrderDetails));
