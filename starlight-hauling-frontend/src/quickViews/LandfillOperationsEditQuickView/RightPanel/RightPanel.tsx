import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';

import { Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';

import { ArrivalSection } from './ArrivalSection';
import { DepartureSection } from './DepartureSection';
import { MaterialsAndMiscellaneous } from './MaterialsAndMiscellaneous';
import MaterialSection from './MaterialSection';
import { MediaSection } from './MediaSection';
import { NetSection } from './NetSection';
import { TruckSection } from './TruckSection';

const I18N_PATH = 'components.forms.LandfillOperationEdit.RightPanel.';

export const RightPanel: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Layouts.Scroll>
      <Layouts.Padding padding="3">
        <Layouts.Margin bottom="2">
          <Typography variant="headerThree">{t(`${I18N_PATH}OperationDetails`)}</Typography>
        </Layouts.Margin>
        <MaterialSection />
        <Divider both />
        <TruckSection />
        <Divider both />
        <ArrivalSection />
        <DepartureSection />
        <Divider both />
        <NetSection />
        <Divider both />
        <MaterialsAndMiscellaneous />
        <Divider both />
        <MediaSection />
      </Layouts.Padding>
    </Layouts.Scroll>
  );
};
