import React from 'react';
import { Layouts } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { Divider } from '@root/common/TableTools';
import { IConfigurableSubscriptionOrder } from '@root/types';
import { useStores } from '@hooks';

import LineItems from './components/LineItems/LineItems';
import Notes from './components/Notes/Notes';
import { getWorkOrderDataComponent } from './components/WorkOrderData';

const RightPanel: React.FC = () => {
  const { subscriptionOrderStore } = useStores();
  const { values } = useFormikContext<IConfigurableSubscriptionOrder>();

  const subscriptionOrder = subscriptionOrderStore.selectedEntity!;
  const businessLineType = subscriptionOrder.businessLine?.type;

  const isNonService = values.noBillableService;

  const WorkOrderDataComponent = getWorkOrderDataComponent(
    values.billableService?.action,
    values.thirdPartyHaulerId,
    businessLineType,
  );

  return (
    <Layouts.Scroll rounded>
      <Layouts.Padding padding="3">
        <Layouts.Grid rowGap="0.5" columnGap="2" columns={4}>
          {!isNonService && !values.thirdPartyHaulerId && WorkOrderDataComponent ? (
            <WorkOrderDataComponent
              oneTime={subscriptionOrder.oneTime}
              action={values.billableService?.action}
              businessLineType={businessLineType}
            />
          ) : null}
          <Notes />
          <Layouts.Cell left="1" width={4}>
            <Divider bottom />
          </Layouts.Cell>
        </Layouts.Grid>
        <LineItems />
      </Layouts.Padding>
    </Layouts.Scroll>
  );
};

export default observer(RightPanel);
