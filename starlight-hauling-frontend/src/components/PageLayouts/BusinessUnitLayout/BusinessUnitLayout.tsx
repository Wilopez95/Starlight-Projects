import React from 'react';
import { observer } from 'mobx-react-lite';

import { useFetchBusinessUnit, useStores } from '@hooks';

import * as PageStyles from '../styles';

import { BusinessUnitHeader } from './Header/Header';
import BusinessUnitNavigationPanel from './NavigationPanel/NavigationPanel';
import { IBusinessUnitLayout } from './types';

const BusinessUnitLayoutComponent: React.FC<IBusinessUnitLayout> = ({
  children,
  showNavigation = true,
}) => {
  const { businessUnitStore } = useStores();

  useFetchBusinessUnit();

  if (
    !businessUnitStore.selectedEntity ||
    (businessUnitStore.loading && !businessUnitStore.selectedEntity)
  ) {
    return null;
  }

  return (
    <PageStyles.PageLayout>
      <BusinessUnitHeader />
      <PageStyles.PageContainer>
        {showNavigation ? <BusinessUnitNavigationPanel /> : null}
        {children}
      </PageStyles.PageContainer>
    </PageStyles.PageLayout>
  );
};

export const BusinessUnitLayout = observer(BusinessUnitLayoutComponent);
