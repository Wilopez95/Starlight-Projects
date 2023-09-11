import React, { memo, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  Button,
  CancelAltIcon,
  Chip,
  ISelectOption,
  Layouts,
  Select,
  SelectValue,
  Typography,
} from '@starlightpro/shared-components';
import { isEqual, xor } from 'lodash-es';

import { FilterConfigContext, FilterContext } from '../TableFilter/context';

import { ITableFilterConfig } from './TableFilterConfig/types';
import { IFilterConfigContext, ITableFilter } from './types';

const TableFilter: React.FC<ITableFilter> = ({ onApply, children }) => {
  const { isFilterOpen, onChangeAppliedState } = useContext(FilterContext);
  const [selectOptions, setSelectOptions] = useState<ISelectOption[]>([]);
  const [filterBy, setFilterBy] = useState<SelectValue>('');
  const [filterValue, setFilterValue] = useState<ISelectOption[]>([]);
  const [customProps, setCustomProps] = useState<Record<string, string>>({});

  const handleClear = useCallback((item: ISelectOption) => {
    setFilterValue(prev => prev.filter(x => x.value !== item.value));
  }, []);

  const handleAdd = useCallback(
    (newItem: ISelectOption, customPropsParam: Record<string, string> = {}) => {
      setFilterValue(prev => xor(prev, [newItem]));
      setCustomProps(customPropsParam);
    },
    [],
  );

  const handleApply = useCallback(() => {
    onApply({
      [filterBy]: filterValue.map(x => x.value.toString()),
      ...customProps,
    });

    onChangeAppliedState(true);
  }, [onChangeAppliedState, onApply, filterBy, filterValue, customProps]);

  const handleReset = useCallback(() => {
    onApply({});
    onChangeAppliedState(false);
    setFilterValue([]);
    setCustomProps({});
  }, [onApply, onChangeAppliedState]);

  const handleChangeSelect = useCallback((_: string, value: SelectValue) => {
    setFilterValue([]);
    setFilterBy(value);
    setCustomProps({});
  }, []);

  const handleShouldRender = useCallback(
    (label: string, filterByKey?: string) => {
      const currentFilterBy = filterByKey ?? `filterBy${label}`;

      return filterBy === currentFilterBy;
    },
    [filterBy],
  );

  useEffect(() => {
    const newOptions = React.Children.map<ISelectOption, React.ReactElement<ITableFilterConfig>>(
      children,
      x => {
        const { label, filterByKey } = x.props;

        return {
          label,
          value: filterByKey ?? `filterBy${label}`,
        };
      },
    );

    if (isEqual(selectOptions, newOptions)) {
      return;
    }
    setSelectOptions(newOptions);

    const currentOption = newOptions.find(option => option.label === filterBy);

    if (!currentOption) {
      const newOption = newOptions[0];

      const newValue = newOption.value;

      handleChangeSelect('', newValue);
    }
  }, [children, filterBy, handleChangeSelect, selectOptions]);

  const contextProps: IFilterConfigContext = useMemo(
    () => ({
      selectedOptions: filterValue,
      onAdd: handleAdd,
      shouldRender: handleShouldRender,
    }),
    [filterValue, handleAdd, handleShouldRender],
  );

  if (!isFilterOpen) {
    return null;
  }

  return (
    <Layouts.Margin margin="3">
      <Layouts.Flex alignItems="center" justifyContent="space-between">
        <Layouts.Flex flexGrow={1} alignItems="center" $wrap>
          <Layouts.Margin right="2">
            <Typography color="secondary" variant="bodyMedium">
              Filter by
            </Typography>
          </Layouts.Margin>
          <Layouts.Margin right="2">
            <Layouts.Box width="250px">
              <Select
                name="filterBy"
                options={selectOptions}
                onSelectChange={handleChangeSelect}
                value={filterBy}
                noErrorMessage
                nonClearable
              />
            </Layouts.Box>
          </Layouts.Margin>
          {filterValue.map(item => (
            <Chip key={item.value} icon={CancelAltIcon} onIconClick={() => handleClear(item)}>
              {item.label}
            </Chip>
          ))}
          <FilterConfigContext.Provider value={contextProps}>
            {children}
          </FilterConfigContext.Provider>
        </Layouts.Flex>
        <Layouts.Box width="300px">
          <Layouts.Flex direction="row" justifyContent="flex-end" alignItems="center">
            <Layouts.Margin left="2">
              <Button onClick={handleReset}>Reset</Button>
            </Layouts.Margin>
            <Layouts.Margin left="2">
              <Button variant="primary" onClick={handleApply} disabled={filterValue.length === 0}>
                Apply
              </Button>
            </Layouts.Margin>
          </Layouts.Flex>
        </Layouts.Box>
      </Layouts.Flex>
    </Layouts.Margin>
  );
};

export default memo(TableFilter);
