import React, { useEffect, useMemo } from 'react';
import { ISelectOption, Select } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { useStores } from '@root/hooks';

import { IPermitSelect } from './types';

const PermitSelect: React.FC<IPermitSelect> = ({ businessUnitId, businessLineId, ...props }) => {
  const { permitStore } = useStores();

  useEffect(() => {
    if (businessUnitId && businessLineId) {
      permitStore.request({
        businessUnitId: businessUnitId.toString(),
        businessLineId: businessLineId.toString(),
      });
    }
  }, [businessUnitId, businessLineId, permitStore]);

  const permitOptions: ISelectOption[] = useMemo(() => {
    return permitStore.sortedValues.map(permit => ({
      value: permit.id,
      label: permit.number,
    }));
  }, [permitStore.sortedValues]);

  return <Select {...props} options={permitOptions} />;
};

export default observer(PermitSelect);
