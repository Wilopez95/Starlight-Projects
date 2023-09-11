import React, { useCallback, useContext, useMemo } from 'react';
import { Layouts, Select } from '@starlightpro/shared-components';
import { getIn } from 'formik';
import { xorBy } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { OptionGroup } from '@root/common/Dropdown';
import { useToggle } from '@root/hooks';

import { FilterConfigContext } from '../../context';
import {
  AddFilterIcon,
  FilterDropdownList,
  FilterDropdownListItem,
} from '../../FilterDropdownList';
import { LabeledFilterValue } from '../../types';

import { IMultiSelectFilter } from './types';

const MultiSelectFilter: React.FC<IMultiSelectFilter> = ({
  searchable,
  options,
  maxSelectedItems = 5,
}) => {
  const { filterByKey, filterState, setFilterValue } = useContext(FilterConfigContext);
  const [isInputVisible, toggleInputVisible] = useToggle(false);

  const filterValue = useMemo(
    () => (filterState[filterByKey] ?? []) as LabeledFilterValue[],
    [filterByKey, filterState],
  );

  const handleAddFilterValue = useCallback(
    (_, value: string | number) => {
      const option = options.find(optionData => optionData.value.toString() === value.toString());

      if (option) {
        setFilterValue(filterByKey, xorBy(filterValue, [{ label: option.label, value }], 'value'));
        toggleInputVisible();
      }
    },
    [options, setFilterValue, filterByKey, filterValue, toggleInputVisible],
  );

  if (filterValue.length >= maxSelectedItems) {
    return null;
  }

  if (!options.length) {
    return null;
  }

  if (!searchable) {
    return (
      <FilterDropdownList>
        <OptionGroup hiddenHeader>
          {options.map(item => (
            <FilterDropdownListItem
              item={item}
              onClick={() => handleAddFilterValue('', item.value.toString())}
              key={item.value}
              selected={filterValue.some(x => x.value == item.value)}
            />
          ))}
        </OptionGroup>
      </FilterDropdownList>
    );
  } else if (searchable && isInputVisible) {
    const notSelectedOptions = options.filter(
      option => !filterValue.some(({ value }) => value === option.value),
    );

    return (
      <Layouts.Box width="300px">
        <Select
          name={filterByKey}
          options={notSelectedOptions}
          searchable
          nonClearable
          value={getIn(filterState, `${filterByKey}.value`)}
          onSelectChange={handleAddFilterValue}
        />
      </Layouts.Box>
    );
  }

  return <AddFilterIcon onClick={toggleInputVisible} />;
};

export default observer(MultiSelectFilter);
