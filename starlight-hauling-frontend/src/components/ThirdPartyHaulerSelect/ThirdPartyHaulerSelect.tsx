import React, { useEffect, useMemo } from 'react';
import { ISelectOption, Select } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { useStores } from '@root/hooks';

import { useFormikContext } from 'formik';
import { IConfigurableSubscriptionOrder } from '../../types';
import { IThirdPartyHaulerSelect } from './types';

const ThirdPartyHaulerSelect: React.FC<IThirdPartyHaulerSelect> = ({
  activeOnly = true,
  value,
  onSelectChange,
  ...props
}) => {
  const { values } = useFormikContext<IConfigurableSubscriptionOrder>();
  const { thirdPartyHaulerStore } = useStores();

  useEffect(() => {
    if (value) {
      thirdPartyHaulerStore.requestById(Number(value), Number(value));
    }
  }, [value, thirdPartyHaulerStore]);

  useEffect(() => {
    if (
      thirdPartyHaulerStore.selectedEntity?.id !== value &&
      thirdPartyHaulerStore.selectedEntity?.id
    ) {
      onSelectChange('thirdPartyHaulerId', thirdPartyHaulerStore.selectedEntity?.id);
    }
  }, [thirdPartyHaulerStore.selectedEntity, value, onSelectChange]);

  useEffect(() => {
    thirdPartyHaulerStore.request({ activeOnly });
  }, [activeOnly, thirdPartyHaulerStore]);

  const thirdPartyHaulerOptions: ISelectOption[] = useMemo(
    () =>
      thirdPartyHaulerStore.sortedValues
        .filter(option => option.active)
        .map(hauler => ({
          label: hauler.description,
          value: hauler.id,
        })),
    [thirdPartyHaulerStore.sortedValues],
  );

  return (
    <Select
      {...props}
      value={values.thirdPartyHaulerId ?? 0}
      onSelectChange={onSelectChange}
      options={thirdPartyHaulerOptions}
    />
  );
};

export default observer(ThirdPartyHaulerSelect);
