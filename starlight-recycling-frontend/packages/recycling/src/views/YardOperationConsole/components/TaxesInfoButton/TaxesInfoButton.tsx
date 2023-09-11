import React, { useCallback } from 'react';
import InfoIcon from '@material-ui/icons/Info';
import { IconButton } from '@material-ui/core';
import { useField } from 'react-final-form';

import { OrderBillableItem, OrderType } from '../../../../graphql/api';
import { TaxesInfoModal } from './TaxesInfoModal';
import { openModal } from '../../../../components/Modals';
import { useTaxes } from '../../hooks/useTaxes';

export const TaxesInfoButton = () => {
  const {
    input: { value: billableItems },
  } = useField<OrderBillableItem[]>('billableItems', {
    subscription: { value: true },
  });
  const {
    input: { value: billableServiceId },
  } = useField<number>('billableServiceId', {
    subscription: { value: true },
  });
  const {
    input: { value: type },
  } = useField<OrderType>('type', {
    subscription: { value: true },
  });
  const { taxDistricts, loading } = useTaxes();

  const showTaxesModal = useCallback(() => {
    openModal({
      content: (
        <TaxesInfoModal
          taxDistricts={taxDistricts}
          commercialTaxesUsed
          orderBillableItems={billableItems}
          billableServiceId={billableServiceId}
          type={type}
        />
      ),
    });
  }, [billableItems, billableServiceId, taxDistricts, type]);

  return (
    <IconButton disabled={loading} onClick={showTaxesModal} color="primary">
      <InfoIcon />
    </IconButton>
  );
};
