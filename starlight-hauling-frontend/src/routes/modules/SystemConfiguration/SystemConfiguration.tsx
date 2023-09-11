import React from 'react';
import { Redirect, Route, Switch } from 'react-router';

import { SystemConfigurationLayout } from '@root/components/PageLayouts';
import { Paths, RouteModules } from '@root/consts';
import { enableRecyclingFeatures, isCore } from '@root/consts/env';
import ConfigurationAuditLog from '@root/pages/ConfigurationAuditLog/ConfigurationAuditLog';
import IntegrationLog from '@root/pages/IntegrationLog/IntegrationLog';
import ConfigurationBrokers from '@root/pages/ConfigurationBrokers/ConfigurationBrokers';
import ConfigurationBusinessLines from '@root/pages/ConfigurationBusinessLines/ConfigurationBusinessLines';
import ConfigurationBusinessUnit from '@root/pages/ConfigurationBusinessUnit/ConfigurationBusinessUnit';
import ConfigurationBusinessUnits from '@root/pages/ConfigurationBusinessUnits/ConfigurationBusinessUnits';
import ConfigurationChangeReasons from '@root/pages/ConfigurationChangeReasons/ConfigurationChangeReasons';
import ConfigurationCompanyProfile from '@root/pages/ConfigurationCompanyProfile/ConfigurationCompanyProfile';
import ConfigurationCompanySettings from '@root/pages/ConfigurationCompanySettings/ConfigurationCompanySettings';
import IntegrationSettings from '@root/pages/ConfigurationCompanySettings/IntegrationSettings/IntegrationSettings';
import ConfigurationCustomerGroups from '@root/pages/ConfigurationCustomerGroups/ConfigurationCustomerGroups';
import ConfigurationDisposalSites from '@root/pages/ConfigurationDisposalSites/ConfigurationDisposalSites';
import ConfigurationTaxDistricts from '@root/pages/ConfigurationTaxDistricts/ConfigurationTaxDistricts';
import ConfigurationThirdPartyHaulers from '@root/pages/ConfigurationThirdPartyHaulers/ConfigurationThirdPartyHaulers';
import ConfigurationTrucksAndDrivers from '@root/pages/ConfigurationTrucksAndDrivers/ConfigurationTrucksAndDrivers';
import { ConfigurationUsersAndRoles } from '@root/pages/ConfigurationUsersAndRoles/ConfigurationUsersAndRoles';
import { configs } from '@root/pages/SystemConfiguration/tables/configs';

export const SystemConfigurationModuleRoutes: React.FC = () => (
  <SystemConfigurationLayout>
    <Switch>
      <Route path={Paths.SystemConfigurationModule.BusinessUnit}>
        <ConfigurationBusinessUnit />
      </Route>

      <Route path={Paths.SystemConfigurationModule.BusinessUnits}>
        <ConfigurationBusinessUnits />
      </Route>
      <Route path={Paths.SystemConfigurationModule.UserAndRoles}>
        <ConfigurationUsersAndRoles />
      </Route>
      <Route path={Paths.SystemConfigurationModule.CompanyProfile}>
        <ConfigurationCompanyProfile />
      </Route>
      {configs.map(({ Component, path, exact = true }) => (
        <Route exact={exact} key={path} path={`${RouteModules.SystemConfiguration}/${path}`}>
          <Component />
        </Route>
      ))}
      {!isCore || enableRecyclingFeatures ? (
        <Route path={Paths.SystemConfigurationModule.BusinessLines}>
          <ConfigurationBusinessLines />
        </Route>
      ) : null}
      <Route path={Paths.SystemConfigurationModule.CompanySettings}>
        <ConfigurationCompanySettings />
      </Route>
      <Route path={Paths.SystemConfigurationModule.AccountingSettings}>
        <IntegrationSettings />
      </Route>
      <Route path={Paths.SystemConfigurationModule.CustomerGroups}>
        <ConfigurationCustomerGroups />
      </Route>
      <Route path={Paths.SystemConfigurationModule.Brokers}>
        <ConfigurationBrokers />
      </Route>
      <Route path={Paths.SystemConfigurationModule.ThirdPartyHaulers}>
        <ConfigurationThirdPartyHaulers />
      </Route>
      <Route path={Paths.SystemConfigurationModule.TaxDistricts}>
        <ConfigurationTaxDistricts />
      </Route>
      <Route path={Paths.SystemConfigurationModule.Waypoints}>
        <ConfigurationDisposalSites />
      </Route>
      <Route path={Paths.SystemConfigurationModule.DriversAndTrucks}>
        <ConfigurationTrucksAndDrivers />
      </Route>
      {!isCore ? (
        <Route path={Paths.SystemConfigurationModule.ChangeReasons}>
          <ConfigurationChangeReasons />
        </Route>
      ) : null}

      <Route path={Paths.SystemConfigurationModule.AuditLog}>
        <ConfigurationAuditLog />
      </Route>

      <Route path={Paths.SystemConfigurationModule.IntegrationLog}>
        <IntegrationLog />
      </Route>

      {configs.map(({ Component, path, exact = true }) => (
        <Route exact={exact} key={path} path={`${RouteModules.SystemConfiguration}/${path}`}>
          <Component />
        </Route>
      ))}
      <Route path="*">
        <Redirect to={Paths.SystemConfigurationModule.BusinessUnits} />
      </Route>
    </Switch>
  </SystemConfigurationLayout>
);
