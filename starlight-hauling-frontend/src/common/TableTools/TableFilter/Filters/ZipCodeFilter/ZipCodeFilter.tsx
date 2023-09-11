import React, { useCallback, useContext, useMemo, useState } from 'react';
import { Layouts, TextInput, TextInputElement } from '@starlightpro/shared-components';
import { xor } from 'lodash-es';

import { useBoolean, useToggle } from '@root/hooks';

import { FilterConfigContext } from '../../context';
import { AddFilterIcon } from '../../FilterDropdownList';
import { LabeledFilterValue } from '../../types';

const maxSelectedItems = 5;
const zipCodeMaxLength = 6;

const ZipCodeFilter: React.FC = () => {
  const { filterByKey, filterState, setFilterValue } = useContext(FilterConfigContext);

  const [zipCode, setZipCode] = useState('');
  const [isInputVisible, toggleInputVisible] = useToggle(false);
  const [error, setError, removeError] = useBoolean(false);

  const filterValue = useMemo(
    () => (filterState[filterByKey] ?? []) as LabeledFilterValue[],
    [filterByKey, filterState],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<TextInputElement>) => {
      e.preventDefault();
      const newValue = e.target.value;

      if (newValue.length > zipCodeMaxLength) {
        return;
      }
      removeError();
      setZipCode(newValue);
    },
    [removeError],
  );

  const handleKeyUp = useCallback(
    (e: React.KeyboardEvent<TextInputElement>) => {
      if (e.key !== 'Enter') {
        return;
      }
      if (zipCode.length < 5) {
        setError();

        return;
      }

      setFilterValue(filterByKey, xor(filterValue, [{ label: zipCode, value: zipCode }]));

      setZipCode('');
      toggleInputVisible();
      removeError();
    },
    [zipCode, setFilterValue, filterByKey, filterValue, toggleInputVisible, removeError, setError],
  );

  if (filterValue.length >= maxSelectedItems) {
    return null;
  }
  if (isInputVisible) {
    return (
      <Layouts.Margin left="1" right="1">
        <Layouts.Box maxWidth="100px">
          <TextInput
            name="newZipCode"
            value={zipCode}
            onChange={handleChange}
            onKeyUp={handleKeyUp}
            noError
            error={error ? 'error' : undefined}
          />
        </Layouts.Box>
      </Layouts.Margin>
    );
  }

  return <AddFilterIcon onClick={toggleInputVisible} />;
};

export default ZipCodeFilter;
