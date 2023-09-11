import createDecorator from 'final-form-calculate';
import { CustomerTruckTypes, CustomerType } from '../../../graphql/api';
import { CustomerTruckOption } from '../Inputs/CustomerTruckInput';
import { isNull, assign } from 'lodash-es';
import { CustomerOption } from '../../../components/FinalForm/CustomerSearchField';
import { getIn } from 'final-form';

const clearFieldForWalkupCustomer = (
  field: string,
  customer: CustomerOption['customer'] | null,
  stateValue: any,
) => {
  if (isNull(customer) || customer.type === CustomerType.Walkup) {
    return null;
  }

  return stateValue;
};

export const formDecorator = () =>
  createDecorator(
    {
      field: 'customer',
      updates: (customer: CustomerOption['customer'] | null, field: string, state: any) => {
        const fieldsToClear = ['customerTruck', 'containerId', 'PONumber', 'WONumber'];

        assign(
          state,
          fieldsToClear.reduce((acc: Record<string, any>, field) => {
            acc[field] = clearFieldForWalkupCustomer(field, customer, getIn(state, field));

            return acc;
          }, {}),
        );

        return state;
      },
    },
    {
      field: 'customerTruck',
      updates: {
        containerId: (customerTruck: CustomerTruckOption['customerTruck'] | null, state: any) => {
          if (
            isNull(customerTruck) ||
            customerTruck.type !== CustomerTruckTypes.Rolloff ||
            state.customer?.type === CustomerType.Walkup
          ) {
            return null;
          }

          return state.containerId;
        },
      },
    },
  );
