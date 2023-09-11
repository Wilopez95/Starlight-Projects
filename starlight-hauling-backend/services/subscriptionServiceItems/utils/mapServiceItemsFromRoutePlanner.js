import isEqual from 'lodash/fp/isEqual.js';

export const mapServiceItemsFromRoutePlanner = (originalServiceItems, serviceItemsInputMap) =>
  originalServiceItems.map(item => {
    const { serviceDaysOfWeek } = serviceItemsInputMap[item.id];

    return {
      ...item,
      needRegenerate: !isEqual(
        Object.keys(serviceDaysOfWeek).sort(),
        Object.keys(item.serviceDaysOfWeek).sort(),
      ),
      serviceDaysOfWeek: { ...serviceItemsInputMap[item.id].serviceDaysOfWeek },
    };
  });
