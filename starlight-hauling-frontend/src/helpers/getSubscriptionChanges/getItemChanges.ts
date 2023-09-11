import { isEmpty, pick } from 'lodash-es';

import { UpdateSubscriptionItemType } from '@root/consts';
import { shallowDiff } from '@root/helpers/shallowDiff';

import { IGetSubscriptionChangesOptions, Item, ItemChanges } from './types';

export const getItemChanges = <T extends Item>(
  item: T,
  initialItems: T[],
  editableItemProps: (keyof T)[],
  options: IGetSubscriptionChangesOptions,
): ItemChanges<T> | undefined => {
  if (!item.id) {
    let updatedItem = {
      eventType: UpdateSubscriptionItemType.add,
      id: item.id,
      currentValues: item,
    };

    if (!options.skipComparisonAddedItem) {
      updatedItem = {
        ...updatedItem,
        ...pick(item, editableItemProps),
      };
    }

    return updatedItem;
  } else {
    const initialItem = initialItems.find(el => el.id === item.id);

    if (item.quantity === 0) {
      let updatedItem = {
        eventType: UpdateSubscriptionItemType.remove,
        id: item.id,
        currentValues: item,
        previousValues: initialItem,
      };

      if (!options.skipComparisonPropsForRemoved) {
        const itemChangedProps = shallowDiff(
          pick(initialItem, editableItemProps),
          pick(item, editableItemProps),
        );

        updatedItem = {
          ...updatedItem,
          ...itemChangedProps,
        };
      }

      return updatedItem;
    } else {
      const itemChangedProps = shallowDiff(
        pick(initialItem, editableItemProps),
        pick(item, editableItemProps),
      );

      if (!isEmpty(itemChangedProps)) {
        return {
          ...itemChangedProps,
          eventType: UpdateSubscriptionItemType.edit,
          id: item.id,
          currentValues: item,
          previousValues: initialItem,
        };
      }

      return undefined;
    }
  }
};
