import React, { forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import { SearchIcon, TextInput, TextInputElement } from '@starlightpro/shared-components';

import { ITableNavigationHeaderHandle } from '@root/core/common/TableTools';
import { ITableSearch } from '@root/core/common/TableTools/TableSearch/types';

import styles from './css/styles.scss';

const TableSearch: React.ForwardRefRenderFunction<ITableNavigationHeaderHandle, ITableSearch> = (
  { placeholder, numericOnly, initialSearchValue = '', onSearch },
  ref,
) => {
  const [value, setValue] = useState(initialSearchValue);

  useImperativeHandle(
    ref,
    () => ({
      resetSearch: () => {
        setValue('');
      },
    }),
    [],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<TextInputElement>) => {
      setValue(e.target.value);

      if (e.target.value === '') {
        onSearch?.('');
      }
    },
    [onSearch],
  );

  const handleKeyUp = (e: React.KeyboardEvent<TextInputElement>) => {
    if (e.key === 'Enter') {
      onSearch?.(value);
    }
  };

  return (
    <div className={styles.input}>
      <TextInput
        name='tableNavigationSearch'
        type={numericOnly ? 'number' : 'text'}
        icon={SearchIcon}
        placeholder={placeholder}
        value={value}
        inputContainerClassName={styles.searchContainer}
        onChange={handleChange}
        onKeyUp={handleKeyUp}
        noError
      />
    </div>
  );
};

export default forwardRef(TableSearch);
