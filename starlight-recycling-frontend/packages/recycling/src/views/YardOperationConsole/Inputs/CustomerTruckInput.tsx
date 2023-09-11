import React, { FC, useCallback, useEffect, useMemo } from 'react';
import { isNumber } from 'lodash/fp';
import { useField, useFormState } from 'react-final-form';
import { Trans, useTranslation } from '../../../i18n';
import MuiTooltip from '@material-ui/core/Tooltip';

import NewTruckForm from '../../CustomerTrucks/CustomerTruckForm/NewTruckForm';
import { SearchFieldWithNewEntity } from '../../../components/FinalForm/SearchField';
import {
  useGetTrucksForOrderCreateLazyQuery,
  CustomerType,
  CustomerTruckForOrderCreate,
  CustomerTruck,
  useGetEquipmentItemsLazyQuery,
  CustomerTruckTypes,
} from '../../../graphql/api';
import { SelectOption, useOpenFormWithCloseConfirmation } from '@starlightpro/common';
import { ReadOnlyOrderFormComponent } from '../types';
import { gql } from '@apollo/client';
import { LoadingInput } from '../../../components/LoadingInput';
import { customerTruckTypeTranslationMapping } from '../../../constants/mapping';
import CustomerTrackLabel from '../components/CustomerTruckLabel/CustomerTruckLabel';
import { closeModal, openModal } from '@starlightpro/common/components/Modals';
import YouHaveUnsavedChanges from '@starlightpro/common/components/Modal/YouHaveUnsavedChanges';

gql`
  query getTrucksForOrderCreate($customerId: Int!) {
    trucksForOrderCreate(customerId: $customerId) {
      id
      description
      truckNumber
      type
      isInUse
      emptyWeight
    }
  }
`;

export type CustomerTruckOption = {
  label: string;
  value: number;
  disabled: boolean;
  customerTruck: Pick<
    CustomerTruckForOrderCreate,
    'id' | 'type' | 'truckNumber' | 'isInUse' | 'emptyWeight'
  >;
};

interface CustomerTruckInputProps extends ReadOnlyOrderFormComponent {
  allowCreateNew?: boolean;
  allowUndefinedEmptyWeight?: boolean;
}

export const CustomerTruckInput: FC<CustomerTruckInputProps> = ({
  readOnly,
  allowCreateNew = true,
  allowUndefinedEmptyWeight = true,
}) => {
  const [t] = useTranslation();
  const [openForm] = useOpenFormWithCloseConfirmation({ stacked: false, modal: true });
  const [getEquipments, { data: equipmentsData }] = useGetEquipmentItemsLazyQuery({
    fetchPolicy: 'no-cache',
  });

  const {
    input: { value: customer },
  } = useField('customer', { subscription: { value: true } });

  const {
    input: { value: containerId },
  } = useField('containerId', { subscription: { value: true } });
  const {
    input: { onChange: onCustomerTruckChange, value: customerTruck },
  } = useField('customerTruck');
  const selectContainer = equipmentsData?.equipments?.data.find(
    (container) => container.id === containerId,
  );

  const {
    initialValues: { customerTruck: initialCustomerTruck },
  } = useFormState({
    subscription: { initialValues: true },
  });

  const customerId = customer?.id || null;
  const isWalkUpCustomer = customer.type === CustomerType.Walkup;

  useEffect(() => {
    if (customerTruck.type === CustomerTruckTypes.Rolloff) {
      getEquipments({
        variables: {
          filter: {
            activeOnly: true,
          },
        },
      });
    }
  }, [customerTruck.type, getEquipments]);

  const [
    getCustomerTrucks,
    { data: customerTrucks, refetch, loading },
  ] = useGetTrucksForOrderCreateLazyQuery({ fetchPolicy: 'network-only' });

  useEffect(() => {
    if (isNumber(customerId)) {
      getCustomerTrucks({
        variables: {
          customerId,
        },
      });
    }
  }, [customerId, getCustomerTrucks]);

  const options = useMemo(
    () =>
      customerTrucks?.trucksForOrderCreate.map((truck) => ({
        label: `${truck.truckNumber} (${customerTruckTypeTranslationMapping[truck.type]})`,
        value: truck.id,
        customerTruck: { ...truck, emptyWeight: truck.emptyWeight },
      })) as CustomerTruckOption[],
    [customerTrucks?.trucksForOrderCreate],
  );

  const openCreateNewTruckModal = useCallback(() => {
    openForm({
      form: (
        <NewTruckForm
          hideStatus
          customerId={customer?.id}
          onSubmitted={async (customerTruck) => {
            if (!customerTruck) {
              return;
            }

            if (refetch) {
              await refetch();
            }

            onCustomerTruckChange({
              target: {
                name: 'customerTruck',
                value: {
                  ...customerTruck,
                  emptyWeight: customerTruck.emptyWeight,
                },
              },
            });
          }}
        />
      ),
    });
  }, [openForm, customer?.id, refetch, onCustomerTruckChange]);

  const handleShowPopup = useCallback(
    (truck: CustomerTruck) => {
      if (!allowUndefinedEmptyWeight && !truck?.emptyWeight) {
        openModal({
          content: (
            <YouHaveUnsavedChanges
              title={<Trans>No Tare Weight</Trans>}
              description={<Trans>Truck without Tare Weight cannot be chosen</Trans>}
              confirmLabel={<Trans>OK</Trans>}
              onConfirm={closeModal}
            />
          ),
        });
        onCustomerTruckChange({ target: { name: 'customerTruck', value: null } });
      }
    },
    [onCustomerTruckChange, allowUndefinedEmptyWeight],
  );

  if (loading) {
    return <LoadingInput label={<Trans>Truck #</Trans>} />;
  }

  return (
    <div>
      <SearchFieldWithNewEntity
        name="customerTruck"
        data-cy="Customer Truck Input"
        disabled={readOnly || !customer || isWalkUpCustomer}
        options={options}
        required={!isWalkUpCustomer}
        newEntityName={allowCreateNew ? t('Truck') : undefined}
        onCreate={allowCreateNew ? openCreateNewTruckModal : () => {}}
        renderOption={(option) => {
          const disabled =
            option.customerTruck.isInUse && initialCustomerTruck?.id !== option.customerTruck.id;

          return (
            <MuiTooltip
              disableHoverListener={false}
              title={disabled ? (t('Truck is in yard') as string) : ''}
            >
              <div
                onClick={(e: { stopPropagation: () => void }) => {
                  disabled && e.stopPropagation();
                }}
              >
                <SelectOption disabled={disabled} value={option.value} data-cy={option.label}>
                  {option.label}
                </SelectOption>
              </div>
            </MuiTooltip>
          );
        }}
        onChange={(value) => {
          handleShowPopup(value);
        }}
        label={<CustomerTrackLabel containerWeight={selectContainer?.emptyWeight} />}
        mapValues={{
          mapFieldValueToFormValue(value) {
            return (value as CustomerTruckOption)?.customerTruck;
          },
          mapFormValueToFieldValue(value) {
            const customerTruck = (value as any) as CustomerTruckOption['customerTruck'];

            return customerTruck?.id;
          },
        }}
      />
    </div>
  );
};
