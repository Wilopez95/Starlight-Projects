import React from 'react';
import { Layouts } from '@starlightpro/shared-components';

import { DaysStatusPreview } from '@root/common';
import { ICustomizedServiceItem } from '@root/providers/MasterRoutesMapProvider';

import { TimeToCome } from './styles';

interface IDndListItem {
  serviceItem: ICustomizedServiceItem;
}

export const DndListItem: React.FC<IDndListItem> = ({ serviceItem }) => (
  <Layouts.Flex direction="column" flexGrow={1}>
    <div className="address">
      {serviceItem.jobSite.address.addressLine1}
      <br />
      {serviceItem.jobSite.address.addressLine2}
    </div>
    <Layouts.Flex justifyContent="space-between">
      <DaysStatusPreview serviceDaysOfWeek={serviceItem.serviceDaysOfWeek} />
      <TimeToCome>
        {serviceItem.bestTimeToComeFrom}–{serviceItem.bestTimeToComeTo}
      </TimeToCome>
    </Layouts.Flex>
  </Layouts.Flex>
);
