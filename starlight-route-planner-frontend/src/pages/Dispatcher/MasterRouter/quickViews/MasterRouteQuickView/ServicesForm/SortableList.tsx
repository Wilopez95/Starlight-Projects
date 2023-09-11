import React from 'react';
import {
  SortableContainer as sortableContainer,
  SortableElement as sortableElement,
} from 'react-sortable-hoc';

import { DndListItemWrapper } from '@root/common/DndListItemWrapper';

import { DndListItem } from '../../../common';
import { IMasterRouteCustomizedFormValues } from '../types';

const SortableItem = sortableElement(DndListItemWrapper);

interface ISortableList {
  items: IMasterRouteCustomizedFormValues['serviceItems'];
  routeColor?: string;
  onDelete: (id: number) => void;
}

export const SortableList = sortableContainer(({ items, onDelete, routeColor }: ISortableList) => (
  <div>
    {items.map((serviceItem, index) => (
      <SortableItem
        key={index}
        index={index}
        sequence={index + 1}
        color={routeColor}
        id={serviceItem.id}
        onDelete={onDelete}
        readOnly={false}
      >
        <DndListItem serviceItem={serviceItem} />
      </SortableItem>
    ))}
  </div>
));
