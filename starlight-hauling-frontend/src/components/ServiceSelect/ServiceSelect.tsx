import React, { useCallback, useEffect, useMemo } from 'react';
import { ISelectOption, Select } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { useStores } from '@root/hooks';
import { IConfigurableSubscriptionOrder } from '@root/types';

import { IServiceSelect } from './types';

const ServiceSelect: React.FC<IServiceSelect> = ({ businessLineId, oneTime = false, ...props }) => {
  const { billableServiceStore } = useStores();
  const { setFieldValue } = useFormikContext<IConfigurableSubscriptionOrder>();

  useEffect(() => {
    if (businessLineId) {
      billableServiceStore.request({ businessLineId, activeOnly: true });
    }
  }, [billableServiceStore, businessLineId]);

  const options: ISelectOption[] = useMemo(() => {
    const billableServices = billableServiceStore.filteredServices.length
      ? billableServiceStore.filteredServices
      : billableServiceStore.sortedValues;

    return billableServices
      .filter(service => service.oneTime === oneTime)
      .map(billableService => ({
        label: billableService.description,
        value: billableService.id,
        hint: billableService.equipmentItem?.shortDescription,
        COEHint: billableService.equipmentItem?.customerOwned,
        billingCycles: billableService.billingCycles,
      }));
  }, [billableServiceStore.filteredServices, billableServiceStore.sortedValues, oneTime]);

  const handleServiceChange = useCallback(
    (name: string, value: number) => {
      const billableService = billableServiceStore.getById(value);

      setFieldValue(name, value);
      setFieldValue('equipmentItemId', billableService?.equipmentItemId);
      setFieldValue('materialId', undefined);
    },
    [billableServiceStore, setFieldValue],
  );

  return <Select {...props} onSelectChange={handleServiceChange} options={options} />;
};

export default observer(ServiceSelect);
