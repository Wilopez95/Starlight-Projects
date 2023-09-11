import React, { useCallback, useEffect } from 'react';
import { Trans } from '../../../i18n';
import { useField } from 'react-final-form';
import { TextField, SelectOption } from '@starlightpro/common';

import {
  CustomerTruckTypes,
  CustomerType,
  useGetEquipmentItemsLazyQuery,
} from '../../../graphql/api';
import { ReadOnlyOrderFormComponent } from '../types';
import { gql } from '@apollo/client';
import { truncate } from 'lodash/fp';
import { makeStyles } from '@material-ui/core';
import { closeModal, openModal } from '@starlightpro/common/components/Modals';
import YouHaveUnsavedChanges from '@starlightpro/common/components/Modal/YouHaveUnsavedChanges';

const useStyles = makeStyles(() => ({
  truncate: {
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
}));

gql`
  query getEquipmentItems($filter: EquipmentFilterInput!) {
    equipments(filter: $filter) {
      data {
        id
        description
        emptyWeight
      }
    }
  }
  query getEquipmentItem($id: Int!) {
    equipment(id: $id) {
      id
      businessLineId
      active
      containerTareWeightRequired
      type
      description
      shortDescription
      size
      length
      width
      height
      emptyWeight
    }
  }
`;

interface Props extends ReadOnlyOrderFormComponent {
  allowUndefinedEmptyWeight?: boolean;
}

export const ContainerInput: React.FC<Props> = ({ readOnly, allowUndefinedEmptyWeight = true }) => {
  const classes = useStyles();
  const [getEquipments, { data: equipmentsData }] = useGetEquipmentItemsLazyQuery({
    fetchPolicy: 'no-cache',
  });
  const {
    input: { onChange: onContainerIdChange, value: containerId },
  } = useField('containerId', { subscription: { value: true } });
  const {
    input: { value: customerTruck },
  } = useField('customerTruck', { subscription: { value: true } });
  const {
    input: { value: customer },
  } = useField('customer', { subscription: { value: true } });
  const {
    input: { value: containerWeight, onChange: onContainerWeightChange },
  } = useField('containerWeight');
  const {
    input: { onChange: onTotalWeightChange },
  } = useField('totalWeight', { subscription: { value: true } });

  const isWalkUpCustomer = customer.type === CustomerType.Walkup;

  useEffect(() => {
    onTotalWeightChange({
      target: {
        name: 'totalWeight',
        value: (customerTruck.emptyWeight ?? 0) + (containerWeight ?? 0),
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerTruck, containerWeight]);

  useEffect(() => {
    if (customerTruck && !isWalkUpCustomer) {
      getEquipments({
        variables: {
          filter: {
            activeOnly: true,
          },
        },
      });
    }
  }, [customerTruck, isWalkUpCustomer, getEquipments]);

  const handleShowPopup = useCallback(
    ({ target: { value } }) => {
      const container = (equipmentsData?.equipments?.data || []).find(({ id }) => id === value);

      if (container) {
        onContainerWeightChange({
          target: { name: 'containerWeight', value: container.emptyWeight ?? 0 },
        });
      }

      if (!allowUndefinedEmptyWeight && container && !container.emptyWeight) {
        openModal({
          content: (
            <YouHaveUnsavedChanges
              title={<Trans>No Tare Weight</Trans>}
              description={<Trans>Can without Tare Weight cannot be chosen</Trans>}
              confirmLabel={<Trans>OK</Trans>}
              onConfirm={() => {
                onContainerIdChange({ target: { name: 'containerId', value: null } });
                onContainerWeightChange({ target: { name: 'containerWeight', value: null } });

                closeModal();
              }}
            />
          ),
        });
      }
    },
    [
      equipmentsData?.equipments?.data,
      allowUndefinedEmptyWeight,
      onContainerIdChange,
      onContainerWeightChange,
    ],
  );

  const selectedContainerRolloff = customerTruck?.type === CustomerTruckTypes.Rolloff;

  useEffect(() => {
    const options = equipmentsData?.equipments.data;

    if (containerId && options?.length) {
      const selectedContainer = options.find(({ id }) => id === containerId);

      if (selectedContainer) {
        onContainerWeightChange({
          target: { name: 'containerWeight', value: selectedContainer.emptyWeight },
        });
      }
    }
  }, [onContainerWeightChange, containerId, equipmentsData]);

  return (
    <TextField
      className={classes.truncate}
      select
      disabled={readOnly || !selectedContainerRolloff || !customerTruck || isWalkUpCustomer}
      required={selectedContainerRolloff}
      fullWidth
      name="containerId"
      inputProps={{ id: 'containerId' }}
      label={<Trans>Can Size</Trans>}
      onChange={handleShowPopup}
    >
      {(equipmentsData?.equipments?.data || []).map((container) => (
        <SelectOption key={container.id} value={container.id}>
          {truncate({ length: 28 }, container.description)}
        </SelectOption>
      ))}
    </TextField>
  );
};
