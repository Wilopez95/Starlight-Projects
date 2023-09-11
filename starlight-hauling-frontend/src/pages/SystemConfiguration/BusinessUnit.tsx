import React, { useMemo } from 'react';
import { Redirect, Route, Switch, useParams } from 'react-router-dom';
import { Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { PageHeader } from '@root/components';
import { BusinessLineType, Paths, RouteModules } from '@root/consts';
import { pathToUrl } from '@root/helpers';
import { useBusinessContext, useFetchBusinessUnit, useStores } from '@root/hooks';
import { type IBusinessUnitLinesParams } from '@root/pages/SystemConfiguration/types';

import BusinessUnitNavigation from './components/NavigationPanel/BusinessUnitNavigation';
import {
  businessUnitConfig,
  businessUnitNoNavConfig,
  recyclingBusinessUnitConfig,
} from './tables/configs';

import styles from './css/styles.scss';

//TODO refactor full page
const BusinessUnit: React.FC = () => {
  // TODO: refactor to use useCurrentBusinessUnitAndLine hook
  const { path } = useParams<IBusinessUnitLinesParams>();
  const { businessLineId, businessUnitId, businessLineType } = useBusinessContext();

  const { businessUnitStore } = useStores();

  const currentBUConfig = useMemo(
    () =>
      businessLineType === BusinessLineType.recycling
        ? recyclingBusinessUnitConfig
        : businessUnitConfig,
    [businessLineType],
  );

  const selectedBusinessUnit = businessUnitStore.getById(businessUnitId);
  const defaultBusinessUnitLine = selectedBusinessUnit?.businessLines[0];

  useFetchBusinessUnit();

  const selectedTab =
    [...currentBUConfig, ...businessUnitNoNavConfig].find(config => config.path === path) ?? null;

  if (!selectedTab && selectedBusinessUnit && defaultBusinessUnitLine) {
    const url = pathToUrl(Paths.BusinessUnitConfigurationModule.GeneralRackRates, {
      businessUnit: selectedBusinessUnit.id,
      businessLine: defaultBusinessUnitLine.id,
    });

    return <Redirect to={url} />;
  }

  // eslint-disable-next-line react/no-unstable-nested-components
  const NavRoutes = () =>
    selectedBusinessUnit &&
    selectedTab && (
      <div className={styles.systemConfigurationPage}>
        <BusinessUnitNavigation
          selectedUnit={selectedBusinessUnit}
          businessLineId={businessLineId}
        />
        <Switch>
          {currentBUConfig.map(({ Component, path: pathData }) => (
            <Route
              key={`${businessLineId}${path}`}
              path={`${RouteModules.BusinessUnitConfiguration}/${pathData}`}
            >
              <Layouts.Scroll>
                <Component />
              </Layouts.Scroll>
            </Route>
          ))}
        </Switch>
      </div>
    );

  return (
    <>
      <PageHeader />
      {selectedBusinessUnit ? (
        <Switch>
          {businessUnitNoNavConfig.map(({ Component, path: pathData }) => (
            <Route
              key={`${businessLineId}${path}`}
              path={`${RouteModules.BusinessUnitConfiguration}/${pathData}`}
            >
              <Component />
            </Route>
          ))}

          <Route path="*">
            <NavRoutes />
          </Route>
        </Switch>
      ) : null}
    </>
  );
};

export default observer(BusinessUnit);
