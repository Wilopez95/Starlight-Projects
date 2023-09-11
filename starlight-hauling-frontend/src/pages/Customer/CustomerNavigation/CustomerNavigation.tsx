import React from 'react';
import { Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { TableTools } from '@root/common/TableTools';
import { useStores } from '@hooks';

import { useNavigation } from './config';
import { ICustomerNavigation } from './types';

const CustomerNavigation: React.ForwardRefRenderFunction<HTMLDivElement, ICustomerNavigation> = (
  { onSearch, searchPlaceholder },
  ref,
) => {
  const { customerStore } = useStores();
  const customer = customerStore.selectedEntity;

  const routes = useNavigation(customer);

  return (
    <Layouts.Margin top="3">
      <TableTools.HeaderNavigation
        onSearch={onSearch}
        placeholder={searchPlaceholder}
        routes={routes}
        navigationRef={ref as React.MutableRefObject<HTMLDivElement | null>}
      />
    </Layouts.Margin>
  );
};

export default observer(CustomerNavigation, {
  forwardRef: true,
});
