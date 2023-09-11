import React, { useMemo } from 'react';
import { ISelect, ISelectOption, Select } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { useStores } from '@root/hooks';

const LineItemSelect: React.FC<Omit<ISelect, 'options'>> = ({ ...props }) => {
  const { lineItemStore } = useStores();

  const lineItemOptions: ISelectOption[] = useMemo(
    () =>
      lineItemStore.sortedValues.reduce(
        (options: ISelectOption[], item) =>
          item.oneTime ? [...options, { label: item.description, value: item.id }] : options,
        [],
      ),
    [lineItemStore.sortedValues],
  );

  return <Select {...props} options={lineItemOptions} nonClearable />;
};

export default observer(LineItemSelect);
