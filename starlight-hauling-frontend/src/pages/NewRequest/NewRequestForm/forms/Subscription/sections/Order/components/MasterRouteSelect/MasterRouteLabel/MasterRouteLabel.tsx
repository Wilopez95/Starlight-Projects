import React from 'react';
import { useTranslation } from 'react-i18next';
import { Badge, Layouts } from '@starlightpro/shared-components';

import { Typography } from '@root/common';

import { RouteColor } from '../RouteColor/RouteColor';
import WeekDays from '../WeekDays/WeekDays';

import { IMasterRouteLabel } from './types';

const I18N_PATH =
  'pages.NewRequest.NewRequestForm.forms.Subscription.sections.Order.components.MasterRouteSelect.Text.';

const MasterRouteLabel: React.FC<IMasterRouteLabel> = ({ route, disabled }) => {
  const { t } = useTranslation();

  return (
    <Layouts.Flex alignItems="center" justifyContent="space-between">
      <Layouts.Margin right="1">
        <RouteColor color={route.color} />
      </Layouts.Margin>
      <Typography ellipsis as={Layouts.Box} maxWidth={disabled ? '80px' : '135px'}>
        {route.name}
      </Typography>
      <Typography color="secondary" shade="desaturated">
        ・{route.numberOfStops} {t(`${I18N_PATH}Stops`)}・
      </Typography>
      <WeekDays serviceDays={route.serviceDaysList} />
      {disabled ? (
        <Layouts.Margin left="1">
          <Badge>{t(`${I18N_PATH}Updating`)}</Badge>
        </Layouts.Margin>
      ) : null}
    </Layouts.Flex>
  );
};

export default MasterRouteLabel;
