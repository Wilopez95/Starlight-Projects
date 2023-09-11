import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts, Typography } from '@starlightpro/shared-components';

import { WayPointType } from '@root/consts';
import { formatAddress } from '@root/helpers';
import { IWayPoint } from '@root/types';

import * as Styles from './styles';
import { IWaypointsDetails } from './types';

const I18N_PATH = 'components.modals.WayPointsDetails.';

export const WaypointDetails: React.FC<IWaypointsDetails> = ({ data, onClosePopup }) => {
  const { t } = useTranslation();

  const { address, type } = data as IWayPoint;

  const wayPointTypeTranslated = {
    [WayPointType.HOME_YARD]: t(`${I18N_PATH}HomeYard`),
    [WayPointType.LANDFILL]: t(`${I18N_PATH}Landfill`),
  }[type];

  return (
    <Styles.Box position="relative" backgroundColor="white">
      <Layouts.Padding padding="3">
        <Typography fontWeight="medium" variant="headerFive" color="information" shade="dark">
          {t(`${I18N_PATH}Title`, { wayPointType: wayPointTypeTranslated })}
        </Typography>
        <Styles.CrossIcon onClick={onClosePopup} role="button" aria-label="close" />
        <Layouts.Margin top="1" />
        <Layouts.Grid columns="160px auto" rowGap="0.5">
          <Typography variant="bodySmall" color="secondary" shade="desaturated">
            {t(`${I18N_PATH}Address`)}
          </Typography>
          <Typography variant="bodySmall" color="secondary" shade="dark">
            {formatAddress(address)}
          </Typography>
        </Layouts.Grid>
      </Layouts.Padding>
    </Styles.Box>
  );
};
