import React, { useCallback, useMemo } from 'react';
import { matchPath } from 'react-router-dom';
import {
  Button,
  Layouts,
  NavigationPanel,
  NavigationPanelItem,
  NavigationPanelItemContainer,
} from '@starlightpro/shared-components';
import { Location } from 'history';
import sortBy from 'lodash-es/sortBy';

import {
  ArrowLeftIcon,
  CommercialIcon,
  PortableToiletIcon,
  RecyclingIcon,
  ResidentialIcon,
  RollOffIcon,
} from '@root/assets';
import { Typography } from '@root/common';
import { OrderStatusRoutes, Paths, RouteModules, Routes } from '@root/consts';
import { BusinessLineType } from '@root/consts/businessLine';
import { isCore } from '@root/consts/env';
import { pathToUrl } from '@root/helpers';
import { useIsRecyclingFacilityBU } from '@root/hooks';

import { businessUnitConfig, recyclingBusinessUnitConfig } from '../../tables/configs';
import PermitsConfig from '../../tables/Permits/config';

import { type IBusinessLineIcons, type IBusinessUnitNavigation } from './types';

export const navIcons: IBusinessLineIcons = {
  [BusinessLineType.rollOff]: RollOffIcon,
  [BusinessLineType.commercialWaste]: CommercialIcon,
  [BusinessLineType.residentialWaste]: ResidentialIcon,
  [BusinessLineType.portableToilets]: PortableToiletIcon,
  [BusinessLineType.recycling]: RecyclingIcon,
};

const isRouteVisible = (path: string, businessLineType: BusinessLineType) => {
  if (path === PermitsConfig.path) {
    return [BusinessLineType.rollOff, BusinessLineType.portableToilets].includes(businessLineType);
  }

  return true;
};

const BusinessUnitNavigation: React.FC<IBusinessUnitNavigation> = ({
  selectedUnit,
  businessLineId,
}) => {
  const { businessLines } = selectedUnit;

  const sortedBusinessLines = isCore
    ? sortBy(businessLines, 'id').filter(businessLine =>
        [BusinessLineType.rollOff, BusinessLineType.recycling].includes(businessLine.type),
      )
    : sortBy(businessLines, 'id');

  const handleConfigActive = useCallback((path: string, location: Location): boolean => {
    return !!matchPath(location.pathname, {
      path: `${RouteModules.BusinessUnitConfiguration}/${path}`,
    });
  }, []);

  const items = useMemo(() => {
    return sortedBusinessLines.map(({ id, name, type }) => {
      const configs =
        type === BusinessLineType.recycling ? recyclingBusinessUnitConfig : businessUnitConfig;

      return (
        <NavigationPanelItem
          key={id}
          title={name}
          icon={navIcons[type]}
          active={id.toString() === businessLineId}
        >
          {configs.map(
            ({ title, path }) =>
              isRouteVisible(path, type) && (
                <NavigationPanelItem
                  key={title}
                  isActive={(_, location) => handleConfigActive(`${id}/${path}`, location)}
                  inner
                  to={`/${Routes.BusinessUnits}/${selectedUnit.id}/${Routes.Configuration}/${id}/${path}`}
                >
                  {title}
                </NavigationPanelItem>
              ),
          )}
        </NavigationPanelItem>
      );
    });
  }, [businessLineId, selectedUnit.id, sortedBusinessLines, handleConfigActive]);

  const isRecyclingFacilityBU = useIsRecyclingFacilityBU();

  const orderPath = pathToUrl(Paths.OrderModule.Orders, {
    businessUnit: selectedUnit.id,
    subPath: isRecyclingFacilityBU ? OrderStatusRoutes.All : OrderStatusRoutes.InProgress,
  });

  return (
    <NavigationPanel>
      <Layouts.Margin left="3" right="3">
        <Button full size="medium" variant="secondary" to={orderPath}>
          <Layouts.Flex alignItems="center" justifyContent="center">
            <Layouts.IconLayout color="white" shade="standard">
              <ArrowLeftIcon />
            </Layouts.IconLayout>
            <Typography variant="bodyMedium" color="white">
              Back to Order List
            </Typography>
          </Layouts.Flex>
        </Button>
      </Layouts.Margin>
      <NavigationPanelItemContainer>{items}</NavigationPanelItemContainer>
    </NavigationPanel>
  );
};

export default BusinessUnitNavigation;
