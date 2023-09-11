/* eslint-disable prefer-object-spread */
import { combineReducers } from 'redux';
import * as t from './actionTypes';

const ME_ELECTRICAL = 'ME Elecmetal';

const isLoading = (state = false, action) => {
  switch (action.type) {
    case t.FETCH_HAULS_REQUEST:
    case t.FETCH_CANS_ON_TRUCKS_REQUEST:
    case t.FETCH_CANS_AT_WP_REQUEST:
      return true;
    case t.FETCH_HAULS_SUCCESS:
    case t.FETCH_HAULS_FAILURE:
    case t.FETCH_CANS_ON_TRUCKS_SUCCESS:
    case t.FETCH_CANS_ON_TRUCKS_FAILURE:
    case t.FETCH_CANS_AT_WP_SUCCESS:
    case t.FETCH_CANS_AT_WP_FAILURE:
      return false;
    default:
      return state;
  }
};

const initialHaulState = {
  tallySizes: {},
  totalPerSizeMapping: {},
  tallyOnTruckSizes: {},
  workorders: [],
  currentInventory: [],
  endingInventory: [],
  finals: [],
};

function hauls(state = initialHaulState, action) {
  switch (action.type) {
    case t.FETCH_CANS_ON_TRUCKS_SUCCESS: {
      // Filters Out Of Service out because it is related to current inventory NOT
      // the hauls side. If it is OUT OF SERVICE it means you cannot use it and therefore
      // it should NOT be counted.
      const tallyOnTruckSizes = action.payload
        .filter((can) => can.truckId !== null)
        .reduce((aggregator, truckData) => {
          const {
            size,
            outOfService,
            location: { type: locationName },
            truckId,
          } = truckData;

          if (!aggregator[locationName]) {
            aggregator[locationName] = Object.assign({}, action.allCansOnTruckSizesWith0Count);
          }

          if (outOfService !== 1 && locationName !== ME_ELECTRICAL && truckId !== null) {
            // tallyOnTruckSizes
            aggregator[locationName][size] += 1;
          }
          return aggregator;
        }, {});

      return Object.assign({}, state, {
        tallyOnTruckSizes,
      });
    }

    // Grab data from the workorders api
    case t.FETCH_HAULS_SUCCESS: {
      // filter the data for hauls
      const workOrdersFiltered = action.payload.filter(
        (wo) =>
          // filter out workorder.action = DROPOFF CAN
          wo.action !== 'DROPOFF CAN' &&
          // filter out workorder.action = PICKUP CAN
          wo.action !== 'PICKUP CAN' &&
          // filter out workorder.status = CANCELED
          wo.status !== 'CANCELED' &&
          // hotfix for pyramid services, filter out ME Elecmetal 5857 South Kyrene Road, Tempe, AZ, 85283
          wo.customerName !== ME_ELECTRICAL,
      );
      // Now we are left with what "should" be the correct group workorders for today + 3 more days

      return Object.assign({}, state, {
        workorders: [...workOrdersFiltered],
        currentInventory: [
          ...action.payload.filter(
            (wo) => wo.action === 'SPOT' && wo.customerName !== ME_ELECTRICAL,
          ),
        ],
        endingInventory: [
          ...action.payload.filter(
            (wo) => wo.action === 'SPOT' && wo.customerName !== ME_ELECTRICAL,
          ),
        ],
        finals: [
          ...action.payload.filter(
            (wo) => wo.action === 'FINAL' && wo.customerName !== ME_ELECTRICAL,
          ),
        ],
      });
    }

    default:
      return state;
  }
}

const initialState = {
  inventoryData: {},
  cansOnTrucksTally: {},
  tallySizes: {},
};

function inventory(state = initialState, action) {
  switch (action.type) {
    case t.FETCH_CANS_AT_WP_SUCCESS: {
      const tallySizes = action.payload.reduce((aggregator, truckData) => {
        const { size, outOfService } = truckData;
        const locationName = truckData.location.description || truckData.location.name;

        if (!aggregator[locationName] && locationName !== ME_ELECTRICAL) {
          aggregator[locationName] = Object.assign({}, action.allSizesWith0Count);
        }
        // outOfService param doesn't work in api call, filter out workaround
        // pyramid service fix, remove ME Elecmetal from their inventory board
        if (outOfService !== 1 && locationName !== ME_ELECTRICAL) {
          // tallyOnTruckSizes
          aggregator[locationName][size] += 1;
        }
        return aggregator;
      }, {});

      return Object.assign({}, state, {
        tallySizes,
      });
    }

    case t.FETCH_CANS_ON_TRUCKS_SUCCESS: {
      // Out of service and requires maintenance ARE included in these totals...
      const cansOnTrucksTally = action.payload
        .filter((can) => can.truckId !== null)
        .reduce((aggregator, truckData) => {
          const {
            size,
            location: { type: locationName },
            truckId,
          } = truckData;

          if (!aggregator[locationName]) {
            aggregator[locationName] = {
              ...action.allCansOnTruckSizesWith0Count,
            };
          }

          if (locationName !== ME_ELECTRICAL && truckId !== null) {
            aggregator[locationName][size] += 1;
          }
          return aggregator;
        }, {});

      return Object.assign({}, state, {
        cansOnTrucksTally,
      });
    }

    default:
      return state;
  }
}

export default combineReducers({
  isLoading,
  hauls,
  inventory,
});
