import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';

import { useBusinessContext, useStores } from '@root/hooks';

import * as PageStyles from '../styles';

import { BusinessUnitHeader } from './Header/Header';
import BusinessUnitNavigationPanel from './NavigationPanel/NavigationPanel';
import * as Styles from './styles';
import { IBusinessUnitLayout } from './types';

const BusinessUnitLayout: React.FC<IBusinessUnitLayout> = ({ children, showNavigation = true }) => {
  const { businessUnitId } = useBusinessContext();

  const { businessUnitStore } = useStores();

  useEffect(() => {
    const query = () => {
      const businessUnit = businessUnitStore.getById(businessUnitId);

      if (businessUnit) {
        businessUnitStore.selectEntity(businessUnit);
      }
    };

    query();

    return () => {
      businessUnitStore.unSelectEntity();
    };
  }, [businessUnitId, businessUnitStore, businessUnitStore.values]);

  return (
    <PageStyles.PageLayout>
      <BusinessUnitHeader />
      <Styles.Layout>
        {showNavigation && <BusinessUnitNavigationPanel />}
        {children}
      </Styles.Layout>
    </PageStyles.PageLayout>
  );
};

export default observer(BusinessUnitLayout);
