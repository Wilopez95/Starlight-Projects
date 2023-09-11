import React from 'react';
import {
  SortableContainer as sortableContainer,
  SortableElement as sortableElement,
} from 'react-sortable-hoc';

import { DndListItemWrapper } from '@root/common/DndListItemWrapper';

import { DndListItem } from '../../../common';
import { FormDataType } from '../formikData';

const SortableItem = sortableElement(DndListItemWrapper);

interface ISortableList {
  items: FormDataType['workOrders'];
  routeColor?: string;
  onDelete: (id: number) => void;
}

export const SortableList = sortableContainer(({ items, onDelete, routeColor }: ISortableList) => (
  <div>
    {items.map((wordOrder, index) => (
      <SortableItem
        key={index}
        index={index}
        sequence={index + 1}
        color={routeColor}
        id={wordOrder.id}
        onDelete={onDelete}
        readOnly={false}
      >
        <DndListItem workOrder={wordOrder} />
      </SortableItem>
    ))}
  </div>
));
