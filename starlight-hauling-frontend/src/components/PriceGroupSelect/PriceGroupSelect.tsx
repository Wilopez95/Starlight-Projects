import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ISelect, ISelectOption, Select } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { getGlobalPriceType, getPriceType } from '@root/helpers';
import { useStores } from '@root/hooks';
import { isCustomPriceGroup } from '@root/pages/NewRequest/NewRequestForm/guards';

import { useRatesGroup } from './hooks/useRatesGroup';

const PriceGroupSelect: React.FC<Omit<ISelect, 'options'>> = ({ onSelectChange, ...props }) => {
  const { globalRateStore } = useStores();
  const { t } = useTranslation();
  const ratesGroup = useRatesGroup();

  const priceGroupOptions: ISelectOption[] = useMemo(() => {
    const options = [];

    if (ratesGroup && isCustomPriceGroup(ratesGroup)) {
      const selectedGroupsOptions = ratesGroup.customRatesGroups.map(customRatesGroup => ({
        label: customRatesGroup.description,
        value: customRatesGroup.id,
        hint: getPriceType(customRatesGroup, t),
      }));

      options.push(...selectedGroupsOptions);
    }

    options.push({
      label: globalRateStore.values[0].description,
      value: globalRateStore.values[0].id,
      hint: getGlobalPriceType(t),
    });

    return options;
  }, [globalRateStore.values, ratesGroup, t]);

  const handleSelect = useCallback(
    (name: string, value: number) => {
      const newValue = value === globalRateStore.values[0].id ? '' : value;

      if (props.value !== newValue) {
        onSelectChange(name, newValue);
      }
    },
    [globalRateStore.values, onSelectChange, props.value],
  );

  return (
    <Select
      {...props}
      onSelectChange={handleSelect}
      value={props.value ?? globalRateStore.values[0].id}
      options={priceGroupOptions}
      nonClearable
    />
  );
};

export default observer(PriceGroupSelect);
