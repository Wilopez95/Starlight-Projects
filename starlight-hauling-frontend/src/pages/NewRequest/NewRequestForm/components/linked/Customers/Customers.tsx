import React, { useEffect } from 'react';
import { Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Typography } from '@root/common';
import { LinkedCustomer } from '@root/components';
import { useBusinessContext, useStores } from '@root/hooks';

import { ILinkedCustomers } from './types';

const requestLimit = 6;

const LinkedCustomers: React.FC<ILinkedCustomers> = ({ jobSiteId, onCustomerSelect }) => {
  const { customerStore } = useStores();

  const { businessUnitId } = useBusinessContext();

  useEffect(() => {
    if (jobSiteId) {
      customerStore.cleanup();
      customerStore.requestByJobSite({ jobSiteId, businessUnitId, requestLimit });
    }
  }, [jobSiteId, businessUnitId, customerStore]);

  return (
    <>
      <Layouts.Padding bottom="3">
        <Typography
          variant="bodySmall"
          color="secondary"
          shade="light"
          textTransform="uppercase"
          fontWeight="medium"
        >
          {customerStore.values.length} Linked Customers
        </Typography>
      </Layouts.Padding>
      <Layouts.Scroll maxHeight={250}>
        <Layouts.Flex $wrap>
          {customerStore.values.map(customer => (
            <Layouts.Box key={customer.id} width="50%">
              <LinkedCustomer entity={customer} onClick={onCustomerSelect} />
            </Layouts.Box>
          ))}
        </Layouts.Flex>
      </Layouts.Scroll>
    </>
  );
};

export default observer(LinkedCustomers);
