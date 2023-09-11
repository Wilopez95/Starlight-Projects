import React, { useCallback, useContext } from 'react';
import { Layouts } from '@starlightpro/shared-components';
import { getIn } from 'formik';

import { Select } from '@root/core/common';
import { ISelectOption } from '@root/core/common/Select/types';

import { FilterConfigContext } from '../../context';
import type { IBaseFilter } from '../../types';

const options: ISelectOption[] = [
  { label: 'Yes', value: 'true' },
  { label: 'No', value: 'false' },
];

const YesNoFilter: React.FC<IBaseFilter> = () => {
  const { filterByKey, filterState, setFilterValue } = useContext(FilterConfigContext);

  const handleAddFilterValue = useCallback(
    (_, value: string) => {
      const option = options.find((option) => option.value === value);

      if (option) {
        setFilterValue(filterByKey, { label: option.label, value });
      }
    },
    [filterByKey, setFilterValue],
  );

  if (getIn(filterState, `${filterByKey}.value`)) {
    return null;
  }

  return (
    <Layouts.Box width='250px'>
      <Select
        name='ticket'
        options={options}
        value={getIn(filterState, `${filterByKey}.value`)}
        onSelectChange={handleAddFilterValue}
      />
    </Layouts.Box>
  );
};

export default YesNoFilter;
