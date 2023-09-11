import React, { useCallback } from 'react';
import { Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Divider, TableQuickView, withQuickView } from '@root/common/TableTools';
import { useStores } from '@root/hooks';

import * as QuickViewStyles from '../styles';

import Actions from './components/Actions/Actions';
import FormContainer from './components/FormContainer/FormContainer';
import LeftPanel from './components/LeftPanel/LeftPanel';
import RightPanel from './components/RightPanel/RightPanel';
import { ICustomerSubscriptionOrderEditQuickView } from './types';

const CustomerSubscriptionOrderEdit: React.FC<ICustomerSubscriptionOrderEditQuickView> = ({
  tableScrollContainerRef,
  tbodyContainerRef,
}) => {
  const { subscriptionOrderStore } = useStores();

  const handleClose = useCallback(() => {
    subscriptionOrderStore.closeEdit();
  }, [subscriptionOrderStore]);

  return (
    <TableQuickView
      parentRef={tableScrollContainerRef}
      clickOutContainers={tbodyContainerRef}
      store={subscriptionOrderStore}
      size="full"
      clickOutHandler={handleClose}
    >
      {({ scrollContainerHeight }) => (
        <FormContainer>
          <Layouts.Scroll maxHeight={scrollContainerHeight - 70}>
            <QuickViewStyles.CrossIcon
              onClick={() => {
                handleClose();
              }}
            />
            <Layouts.Flex as={Layouts.Box} height="100%" justifyContent="space-between">
              <Layouts.Box width="33.33%" backgroundColor="grey" backgroundShade="desaturated">
                <LeftPanel />
              </Layouts.Box>
              <RightPanel />
            </Layouts.Flex>
          </Layouts.Scroll>
          <Divider />
          <Layouts.Padding padding="2">
            <Actions />
          </Layouts.Padding>
        </FormContainer>
      )}
    </TableQuickView>
  );
};

export default withQuickView(observer(CustomerSubscriptionOrderEdit));
