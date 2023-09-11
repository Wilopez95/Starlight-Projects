import React, { useCallback, useEffect } from 'react';
import { useParams } from 'react-router';
import { useRouteMatch } from 'react-router-dom';
import { IBaseComponent, Loadable } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Paths } from '@root/core/consts';
import { useStores, useUserContext } from '@root/core/hooks';

const CustomerBasePage: React.FC<IBaseComponent> = ({ children }) => {
  const { customerId } = useParams<{ customerId: string }>();
  const { customerStore, contactStore } = useStores();
  const { userTokens, currentUser } = useUserContext();
  const profilePathMatch = useRouteMatch<{ customerId: string }>(`${Paths.Profile}`);

  const customer = customerStore.selectedEntity;
  const myContact = contactStore.me;
  const customerIsFetched = !!customer;
  const myContactIsFetched = !!myContact;
  const profilePathMatchExact = profilePathMatch?.isExact;
  const showLoading = customerStore.loading && (!customer || customer.id !== +customerId);

  const fetchData = useCallback(() => {
    (async () => {
      await customerStore.requestById(+customerId);
      await Promise.all([
        customerStore.selectedEntity?.requestBalances(),
        contactStore.requestMyContact(),
      ]);
    })();
  }, [contactStore, customerId, customerStore]);

  useEffect(() => {
    if (profilePathMatchExact && userTokens && currentUser) {
      fetchData();
    }
  }, [currentUser, userTokens, fetchData, profilePathMatchExact]);

  useEffect(() => {
    if (!customerIsFetched && !profilePathMatchExact && !myContactIsFetched) {
      fetchData();
    }
  }, [customerIsFetched, fetchData, myContactIsFetched, profilePathMatchExact]);

  return <>{showLoading ? <Loadable /> : children}</>;
};

export default observer(CustomerBasePage);
