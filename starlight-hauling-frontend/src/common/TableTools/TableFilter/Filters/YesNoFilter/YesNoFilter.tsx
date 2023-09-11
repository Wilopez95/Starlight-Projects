import React, { useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { ISelectOption, Layouts, Select } from '@starlightpro/shared-components';
import { getIn } from 'formik';

import { FilterConfigContext } from '../../context';
import { type IBaseFilter } from '../../types';

const options: ISelectOption[] = [
  { label: 'Yes', value: 'true' },
  { label: 'No', value: 'false' },
];

const YesNoFilter: React.FC<IBaseFilter> = () => {
  const { filterByKey, filterState, setFilterValue } = useContext(FilterConfigContext);
  const { t } = useTranslation();

  const handleAddFilterValue = useCallback(
    (_, value: string) => {
      const option = options.find(optionValue => optionValue.value === value);

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
    <Layouts.Box width="250px">
      <Select
        name="ticket"
        ariaLabel={t(`Text.Ticket`)}
        options={options}
        value={getIn(filterState, `${filterByKey}.value`)}
        onSelectChange={handleAddFilterValue}
      />
    </Layouts.Box>
  );
};

export default YesNoFilter;
