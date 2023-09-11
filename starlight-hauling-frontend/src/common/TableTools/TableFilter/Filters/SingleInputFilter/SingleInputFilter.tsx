import React, { useCallback, useContext, useState } from 'react';
import { Layouts, TextInput, TextInputElement } from '@starlightpro/shared-components';
import { getIn } from 'formik';

import { useBoolean, useToggle } from '@root/hooks';

import { FilterConfigContext } from '../../context';
import { AddFilterIcon } from '../../FilterDropdownList';
import { IBaseFilter } from '../../types';

const SingleInputFilter: React.FC<IBaseFilter> = () => {
  const { filterByKey, setFilterValue, filterState } = useContext(FilterConfigContext);

  const [value, setValue] = useState('');
  const [error, setError, removeError] = useBoolean(false);
  const [isInputVisible, toggleInputVisible] = useToggle(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<TextInputElement>) => {
      e.preventDefault();
      const newValue = e.target.value;

      removeError();
      setValue(newValue);
    },
    [removeError],
  );

  const handleKeyUp = useCallback(
    (e: React.KeyboardEvent<TextInputElement>) => {
      if (e.key !== 'Enter') {
        return;
      }

      if (!value.length) {
        setError();

        return;
      }

      setFilterValue(filterByKey, { label: value, value });

      toggleInputVisible();
    },
    [filterByKey, setError, setFilterValue, toggleInputVisible, value],
  );

  if (getIn(filterState, `${filterByKey}.value`)) {
    return null;
  }

  if (isInputVisible) {
    return (
      <Layouts.Margin left="1" right="1">
        <Layouts.Box maxWidth="100px">
          <TextInput
            name={filterByKey}
            value={value}
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

export default SingleInputFilter;
