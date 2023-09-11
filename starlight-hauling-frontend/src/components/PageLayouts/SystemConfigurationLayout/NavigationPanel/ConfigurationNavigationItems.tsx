import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';

import {
  AuditLogIcon,
  BrokersIcon,
  BusinessLinesIcon,
  BusinessUnitIcon,
  CompanyProfileIcon,
  CompanySettingsIcon,
  CustomerGroupsIcon,
  DisposalSitesIcon,
  HelpIcon,
  OperatingCostsIcon,
  TaxDistrictIcon,
  ThirdPartyHaulersIcon,
  TruckIcon,
  UsersAndRolesIcon,
  StatusIcon,
} from '@root/assets';
import { NavigationPanelItem, NavigationPanelItemContainer, Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { Paths } from '@root/consts';
import { enableRecyclingFeatures, isCore } from '@root/consts/env';
import { pathToUrl } from '@root/helpers';

const I18N_PATH = 'pages.SystemConfiguration.components.NavigationPanel.NavigationPanel.';

export const ConfigurationNavigationItems: React.FC = () => {
  const { t } = useTranslation();

  return (
    <NavigationPanelItemContainer>
      <Layouts.Margin bottom="1" left="3">
        <Typography
          variant="headerFive"
          color="secondary"
          shade="desaturated"
          textTransform="uppercase"
        >
          {t(`${I18N_PATH}Text.Company`)}
        </Typography>
      </Layouts.Margin>
      <NavigationPanelItem
        icon={BusinessUnitIcon}
        exact={false}
        to={Paths.SystemConfigurationModule.BusinessUnits}
      >
        {t(`${`${I18N_PATH}Text.Business Units`}`)}
      </NavigationPanelItem>
      <NavigationPanelItem
        icon={UsersAndRolesIcon}
        exact={false}
        to={pathToUrl(Paths.SystemConfigurationModule.UserAndRoles, { subPath: undefined })}
      >
        {t(`${`${I18N_PATH}Text.Users And Roles`}`)}
      </NavigationPanelItem>
      <NavigationPanelItem
        icon={CompanyProfileIcon}
        to={Paths.SystemConfigurationModule.CompanyProfile}
      >
        {t(`${`${I18N_PATH}Text.Company Profile`}`)}
      </NavigationPanelItem>
      {!isCore || enableRecyclingFeatures ? (
        <NavigationPanelItem
          icon={BusinessLinesIcon}
          to={Paths.SystemConfigurationModule.BusinessLines}
        >
          {t(`${`${I18N_PATH}Text.Lines of Business`}`)}
        </NavigationPanelItem>
      ) : null}
      <NavigationPanelItem
        icon={CompanySettingsIcon}
        to={Paths.SystemConfigurationModule.CompanySettings}
      >
        {t(`${`${I18N_PATH}Text.Company Settings`}`)}
      </NavigationPanelItem>
      <NavigationPanelItem
        icon={CustomerGroupsIcon}
        to={Paths.SystemConfigurationModule.CustomerGroups}
      >
        {t(`${`${I18N_PATH}Text.Customer Groups`}`)}
      </NavigationPanelItem>
      <NavigationPanelItem icon={BrokersIcon} to={Paths.SystemConfigurationModule.Brokers}>
        {t(`${`${I18N_PATH}Text.Brokers`}`)}
      </NavigationPanelItem>
      <NavigationPanelItem
        icon={ThirdPartyHaulersIcon}
        to={Paths.SystemConfigurationModule.ThirdPartyHaulers}
      >
        {t(`${`${I18N_PATH}Text.3rd Party Haulers`}`)}
      </NavigationPanelItem>
      <NavigationPanelItem icon={DisposalSitesIcon} to={Paths.SystemConfigurationModule.Waypoints}>
        {t(`${`${I18N_PATH}Text.Waypoints`}`)}
      </NavigationPanelItem>
      <NavigationPanelItem icon={TaxDistrictIcon} to={Paths.SystemConfigurationModule.TaxDistricts}>
        {t(`${`${I18N_PATH}Text.Tax Districts`}`)}
      </NavigationPanelItem>
      <NavigationPanelItem
        icon={OperatingCostsIcon}
        to={Paths.SystemConfigurationModule.OperatingCosts}
      >
        {t(`${`${I18N_PATH}Text.Operating Costs`}`)}
      </NavigationPanelItem>
      <NavigationPanelItem icon={TruckIcon} to={Paths.SystemConfigurationModule.DriversAndTrucks}>
        {t(`${`${I18N_PATH}Text.Drivers and Trucks`}`)}
      </NavigationPanelItem>
      <Layouts.Margin top="1" bottom="1">
        <Divider />
      </Layouts.Margin>
      <NavigationPanelItem icon={AuditLogIcon} to={Paths.SystemConfigurationModule.AuditLog}>
        {t(`${`${I18N_PATH}Text.AuditLog`}`)}
      </NavigationPanelItem>
      <NavigationPanelItem icon={StatusIcon} to={Paths.SystemConfigurationModule.IntegrationLog}>
        {t(`${`${I18N_PATH}Text.QbIntegrationLog`}`)}
      </NavigationPanelItem>
      {!isCore ? (
        <NavigationPanelItem icon={HelpIcon} to={Paths.SystemConfigurationModule.ChangeReasons}>
          {t(`${`${I18N_PATH}Text.ChangeReasons`}`)}
        </NavigationPanelItem>
      ) : null}
    </NavigationPanelItemContainer>
  );
};
