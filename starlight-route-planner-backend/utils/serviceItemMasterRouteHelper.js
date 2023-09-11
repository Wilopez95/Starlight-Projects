/* eslint-disable no-unused-vars */
import { UserInputError } from 'apollo-server-core';

import { MASTER_ROUTE_ERRORS } from '../consts/masterRoute.js';

const findClosestAvailableDay = (masterRouteServiceDays, serviceItemServiceDays, day) => {
  const possibleClosestDays = masterRouteServiceDays.filter(
    availableDay => !serviceItemServiceDays.includes(availableDay),
  );

  if (!possibleClosestDays.length) {
    return null;
  }

  const nextAvailableDay = possibleClosestDays.find(availableDay => availableDay > day);
  const previousAvailableDay = possibleClosestDays.find(availableDay => availableDay < day);
  const existPreviousAvailableDay = previousAvailableDay || previousAvailableDay === 0;

  if (existPreviousAvailableDay) {
    return previousAvailableDay;
  }

  return nextAvailableDay;
};

export const getServiceItemMasterRouteAndUpdateServiceItemsDaysData = options => {
  const { masterRouteId, masterRouteName, serviceItems, masterRouteServiceDays, serviceItemRepo } =
    options;

  const MONTHLY_FREQUENCY_ID = 108;
  const masterRouteServiceDaysSorted = masterRouteServiceDays.sort((a, b) => a - b);

  const masterRouteInsertData = serviceItems.reduce(
    (res, serviceItem, idx) => {
      const serviceDaysOfWeekEntries = Object.entries(serviceItem.serviceDaysOfWeek).map(
        ([day, dayInfo]) => [Number(day), dayInfo],
      );

      const serviceItemServiceDays = serviceDaysOfWeekEntries.map(([day]) => day);
      const isAllServiceDaysOfWeekRequiredByCustomer = serviceDaysOfWeekEntries.every(
        ([_, dayInfo]) => dayInfo.requiredByCustomer,
      );
      const atLeastOneDayFitMasterRoute = serviceItemServiceDays.some(serviceDay =>
        masterRouteServiceDays.includes(serviceDay),
      );

      if (isAllServiceDaysOfWeekRequiredByCustomer && !atLeastOneDayFitMasterRoute) {
        throw new UserInputError(MASTER_ROUTE_ERRORS.serviceDaysDoNotFit);
      }

      const serviceItemMasterRouteTemplate = {
        masterRouteId,
        serviceItemId: serviceItem.id,
        sequence: idx,
      };

      const isMonthlyServiceItem = serviceItem.serviceFrequencyId === MONTHLY_FREQUENCY_ID;
      if (isMonthlyServiceItem) {
        const serviceDay = masterRouteServiceDaysSorted[0];

        res.serviceItemMasterRouteInsertData.push({
          ...serviceItemMasterRouteTemplate,
          serviceDay,
        });
        res.updateServiceItemsRoutesPromises.push(
          serviceItemRepo.updateServiceDaysOfWeekRoute(serviceItem.id, serviceDay, masterRouteName),
        );
      }

      for (const [day, dayInfo] of serviceDaysOfWeekEntries) {
        const dayExistInMasterRouteServiceDays = masterRouteServiceDaysSorted.includes(day);

        if (dayExistInMasterRouteServiceDays) {
          res.serviceItemMasterRouteInsertData.push({
            ...serviceItemMasterRouteTemplate,
            serviceDay: day,
          });
          res.updateServiceItemsRoutesPromises.push(
            serviceItemRepo.updateServiceDaysOfWeekRoute(serviceItem.id, day, masterRouteName),
          );
        } else {
          const isDayRequiredByCustomer = dayInfo.requiredByCustomer;

          if (!isDayRequiredByCustomer) {
            const closestAvailableDay = findClosestAvailableDay(
              masterRouteServiceDaysSorted,
              serviceItemServiceDays,
              day,
            );

            if (closestAvailableDay !== null) {
              res.serviceItemMasterRouteInsertData.push({
                ...serviceItemMasterRouteTemplate,
                serviceDay: closestAvailableDay,
              });

              serviceItemServiceDays.push(closestAvailableDay);

              res.updateServiceItemsDaysPromises.push(
                serviceItemRepo.updateServiceDaysOfWeekDay(
                  serviceItem.id,
                  day,
                  closestAvailableDay,
                ),
              );

              res.updateServiceItemsRoutesPromises.push(
                serviceItemRepo.updateServiceDaysOfWeekRoute(
                  serviceItem.id,
                  closestAvailableDay,
                  masterRouteName,
                ),
              );
            }
          }
        }
      }

      return res;
    },
    {
      serviceItemMasterRouteInsertData: [],
      updateServiceItemsDaysPromises: [],
      updateServiceItemsRoutesPromises: [],
    },
  );

  return masterRouteInsertData;
};

export const detectChangedServiceItems = (initialItems, updatedItems) => {
  const realUpdates = updatedItems.filter(({ id, serviceDaysOfWeek }) => {
    const initial = initialItems.find(el => el.id === id);

    if (!initial) {
      return false;
    }

    return Object.entries(serviceDaysOfWeek).some(([day, dayInfo]) => {
      const info = initial.serviceDaysOfWeek[day];

      return !info || info.route !== dayInfo.route;
    });
  });

  return realUpdates;
};

// both itemsToUpdateBefore and itemsToUpdateIncoming should have equal amount of items with same ids
export const detectServiceItemsRouteChanges = (existingItems, incomingItems) => {
  const updates = incomingItems.reduce(
    (res, incomingItem) => {
      const current = existingItems?.find(el => el.id === incomingItem.id);

      // there can be no current - meaning incomingItem is a brand new serviceItem
      const { serviceDaysOfWeek: currentServiceDays } = current || {};
      const { serviceDaysOfWeek: incomingServiceDays } = incomingItem;

      const daysOfWeek = [...Array(7).keys()];

      // run through all days and detect changes in routes field
      const currentRouteChanges = daysOfWeek.reduce((acc, day) => {
        const currentRoute = currentServiceDays?.[day]?.route ?? '';
        const incomingRoute = incomingServiceDays?.[day]?.route ?? '';

        // detect that update in route field happened
        if ((!!currentRoute || !!incomingRoute) && currentRoute !== incomingRoute) {
          res.serviceItemsToUpsert.add(incomingItem);

          acc.push({
            serviceItemId: incomingItem.id,
            serviceDay: day,
            previousRoute: currentRoute,
            newRoute: incomingRoute,
          });
        }

        return acc;
      }, []);

      if (currentRouteChanges.length) {
        res.relationUpdates.push(...currentRouteChanges);
      }

      return res;
    },
    {
      // will contain objects of type:
      // {
      //      serviceItemId: 123,
      //      serviceDay: 1,
      //      previousRoute: 'Test',
      //      newRoute: 'TestTest'
      // }
      relationUpdates: [],
      serviceItemsToUpsert: new Set(),
    },
  );

  return updates;
};
