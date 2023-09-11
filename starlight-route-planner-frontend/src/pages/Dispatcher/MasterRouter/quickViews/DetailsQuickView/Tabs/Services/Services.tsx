import React from 'react';

import { DndListItemWrapper } from '@root/common/DndListItemWrapper';
import { DndListItem } from '@root/pages/Dispatcher/MasterRouter/common';
import { ICustomizedServiceItem } from '@root/providers/MasterRoutesMapProvider';
import { IMasterRouteServiceItem } from '@root/types';

import { MasterRouteDriverTruck } from '../types';

interface IServicesTab {
  onPopup: (data: IMasterRouteServiceItem) => void;
}

export const ServicesTab: React.FC<MasterRouteDriverTruck & IServicesTab> = ({
  serviceItems,
  onPopup,
}) => {
  return (
    <>
      {serviceItems.map((serviceItem, index) => (
        <DndListItemWrapper
          key={serviceItem.id}
          id={serviceItem.id}
          sequence={index + 1}
          readOnly
          onClick={() => onPopup(serviceItem)}
        >
          <DndListItem serviceItem={serviceItem as ICustomizedServiceItem} />
        </DndListItemWrapper>
      ))}
    </>
  );
};
