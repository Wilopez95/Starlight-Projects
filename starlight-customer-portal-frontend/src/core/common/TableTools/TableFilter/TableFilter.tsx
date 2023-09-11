import React, { memo, useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  CancelAltIcon,
  Chip,
  DeleteIcon,
  Layouts,
  PlusIcon,
  Typography,
} from '@starlightpro/shared-components';
import { isEqual, omit } from 'lodash-es';

import { Select } from '@root/core/common';
import { ISelectOption } from '@root/core/common/Select/types';

import { FilterConfigContext, FilterContext } from '../TableFilter/context';

import { TableFilterConfig } from './TableFilterConfig/TableFilterConfig';
import { ITableFilterConfig } from './TableFilterConfig/types';
import { convertToAppliedState } from './helpers';
import { FilterItem, FilterState, ITableFilter, LabeledFilterValue } from './types';

const I18N_PATH = 'common.TableTools.TableFilter.TableFilter.Text.';

const TableFilter: React.FC<ITableFilter> = ({ onApply, children }) => {
  const { isFilterOpen, onChangeAppliedState } = useContext(FilterContext);
  const [selectOptions, setSelectOptions] = useState<ISelectOption[]>([]);
  const [filterState, setFilterState] = useState<FilterState>({});

  const { t } = useTranslation();

  const handleApply = useCallback(
    (values: FilterState) => {
      onApply(convertToAppliedState(values));

      onChangeAppliedState(true);
    },
    [onChangeAppliedState, onApply],
  );

  const handleReset = useCallback(() => {
    onApply({});
    onChangeAppliedState(false);
  }, [onApply, onChangeAppliedState]);

  const appliedValues = convertToAppliedState(filterState);
  const hasNoFilters = Object.keys(appliedValues).length === 0;

  const handleFilterSelect = (_: string, newKey: string, previousKey: string) => {
    if (!Object.keys(filterState).includes(newKey)) {
      setFilterState({
        ...omit(filterState, previousKey),
        [newKey]: null,
      });
    }
  };

  const setFilterValue = useCallback((key: string, value: FilterItem) => {
    setFilterState((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const removeFilterValue = (key: string, index: number) => {
    const value = filterState[key];

    setFilterValue(key, value && Array.isArray(value) ? value.filter((_, i) => i !== index) : null);
  };

  const handleRemoveFilter = (key: string) => {
    setFilterState(omit(filterState, [key]));
  };

  const handleAddFilter = () => {
    const notSelectedOptions = selectOptions.filter(
      (option) => !Object.keys(filterState).includes(option.value.toString()),
    );

    if (notSelectedOptions.length > 0) {
      setFilterValue(notSelectedOptions[0].value.toString(), null);
    }
  };

  useEffect(() => {
    const newOptions = React.Children.toArray(children)
      .map((element) =>
        React.isValidElement<ITableFilterConfig>(element) && element.type === TableFilterConfig
          ? {
              label: element.props.label,
              value: element.props.filterByKey,
            }
          : null,
      )
      .filter(Boolean) as ISelectOption[];

    if (isEqual(selectOptions, newOptions)) {
      return;
    }
    setSelectOptions(newOptions);

    // reset filter values on new children
    if (newOptions[0]?.value) {
      setFilterState({
        [newOptions[0].value.toString()]: null,
      });
      onChangeAppliedState(false);
    }
  }, [children, onApply, onChangeAppliedState, selectOptions]);

  if (!isFilterOpen) {
    return null;
  }

  return (
    <Layouts.Margin margin='3'>
      <Layouts.Margin>
        <Layouts.Flex justifyContent='space-between'>
          <Layouts.Flex alignItems='center'>
            <Typography variant='headerThree'>{t(`${I18N_PATH}Filters`)}</Typography>
            <Layouts.Margin left='3'>
              <Typography
                cursor='pointer'
                color='information'
                variant='bodyMedium'
                onClick={handleAddFilter}
              >
                <Layouts.Flex alignItems='center'>
                  <Layouts.IconLayout width='12px' height='12px'>
                    <PlusIcon />
                  </Layouts.IconLayout>
                  {t(`${I18N_PATH}AddFilter`)}
                </Layouts.Flex>
              </Typography>
            </Layouts.Margin>
          </Layouts.Flex>
          <Layouts.Box width='300px'>
            <Layouts.Flex direction='row' justifyContent='flex-end' alignItems='center'>
              <Layouts.Margin left='2'>
                <Button onClick={handleReset}>Reset</Button>
              </Layouts.Margin>
              <Layouts.Margin left='2'>
                <Button
                  onClick={() => handleApply(filterState)}
                  variant='primary'
                  type='submit'
                  disabled={hasNoFilters}
                >
                  Apply
                </Button>
              </Layouts.Margin>
            </Layouts.Flex>
          </Layouts.Box>
        </Layouts.Flex>
      </Layouts.Margin>
      <Layouts.Flex direction='column'>
        {Object.keys(filterState).map((filterByKey) => {
          const filterConfig = React.Children.toArray(children).find(
            (config) =>
              React.isValidElement<ITableFilterConfig>(config) &&
              config.type === TableFilterConfig &&
              config.props.filterByKey === filterByKey,
          );

          let filterValues: LabeledFilterValue[] = [];

          if (filterState[filterByKey]) {
            filterValues = (Array.isArray(filterState[filterByKey])
              ? filterState[filterByKey]
              : [filterState[filterByKey]]) as LabeledFilterValue[];
          }

          return (
            <Layouts.Margin top='3' key={filterByKey}>
              <Layouts.Flex>
                <Layouts.Margin right='2' bottom='3'>
                  <Layouts.Box width='250px'>
                    <Layouts.Flex alignItems='center'>
                      <Layouts.IconLayout remove onClick={() => handleRemoveFilter(filterByKey)}>
                        <DeleteIcon />
                      </Layouts.IconLayout>
                      <Select
                        name='filterBy'
                        options={selectOptions.filter(
                          (option) =>
                            filterByKey === option.value.toString() ||
                            !Object.keys(filterState).includes(option.value.toString()),
                        )}
                        onSelectChange={(_, newKey: string) =>
                          handleFilterSelect(_, newKey, filterByKey)
                        }
                        value={filterByKey}
                        noErrorMessage
                        nonClearable
                      />
                    </Layouts.Flex>
                  </Layouts.Box>
                </Layouts.Margin>
                {filterValues.map((item, i) => (
                  <Chip
                    key={i}
                    icon={CancelAltIcon}
                    onIconClick={() => removeFilterValue(filterByKey, i)}
                  >
                    {item.label}
                  </Chip>
                ))}
                <FilterConfigContext.Provider
                  value={{ filterByKey, filterState, setFilterValue, removeFilterValue }}
                >
                  {filterConfig}
                </FilterConfigContext.Provider>
              </Layouts.Flex>
            </Layouts.Margin>
          );
        })}
      </Layouts.Flex>
    </Layouts.Margin>
  );
};

export default memo(TableFilter);
