import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Layouts,
  NavigationPanelItem,
  NavigationPanelItemContainer,
} from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Typography } from '@root/common';
import { businessLinesIcons, BusinessLineType, Paths } from '@root/consts';
import { pathToUrl } from '@root/helpers';
import { useStores } from '@root/hooks';

const I18N_PATH = 'pages.SystemConfiguration.components.NavigationPanel.NavigationPanel.';

const BusinessLinesNavigationItems: React.FC = () => {
  const { businessLineStore } = useStores();
  const { t } = useTranslation();

  useEffect(() => {
    businessLineStore.request();
  }, [businessLineStore]);

  const businessLines = businessLineStore.values;

  return (
    <NavigationPanelItemContainer>
      <Layouts.Margin top="2" left="3">
        <Typography
          variant="headerFive"
          color="secondary"
          shade="desaturated"
          textTransform="uppercase"
        >
          {t(`${I18N_PATH}Text.LinesOfBusiness`)}
        </Typography>
      </Layouts.Margin>
      {businessLines.map(({ id, name, type }) => (
        <NavigationPanelItem key={id} title={name} icon={businessLinesIcons[type]}>
          <NavigationPanelItem
            inner
            to={pathToUrl(Paths.SystemBusinessLinesConfigurationModule.BillableItems, { id })}
          >
            {t(`${`${I18N_PATH}CommonText.Billable Items`}`)}
          </NavigationPanelItem>
          <NavigationPanelItem
            inner
            to={pathToUrl(Paths.SystemBusinessLinesConfigurationModule.Materials, { id })}
          >
            {t(`${`${I18N_PATH}CommonText.Materials`}`)}
          </NavigationPanelItem>
          {type !== BusinessLineType.recycling ? (
            <NavigationPanelItem
              inner
              to={pathToUrl(Paths.SystemBusinessLinesConfigurationModule.MaterialProfiles, { id })}
            >
              {t(`${`${I18N_PATH}CommonText.Material Profiles`}`)}
            </NavigationPanelItem>
          ) : null}
          <NavigationPanelItem
            inner
            to={pathToUrl(Paths.SystemBusinessLinesConfigurationModule.EquipmentItems, { id })}
          >
            {t(`${`${I18N_PATH}CommonText.Equipment`}`)}
          </NavigationPanelItem>
        </NavigationPanelItem>
      ))}
    </NavigationPanelItemContainer>
  );
};

export default observer(BusinessLinesNavigationItems);
