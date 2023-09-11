import React, { FC } from 'react';
import SearchFieldAutocomplete from '../SearchFieldAutocomplete';
import { BaseSearchFieldProps } from '../Filter';
import { useDebouncedHaulingCustomersRequest } from '../../views/YardOperationConsole/hooks/useDebouncedHaulingCustomersRequest';

export interface CustomerSearchFieldProps extends BaseSearchFieldProps {}

export const CustomerSearchField: FC<CustomerSearchFieldProps> = ({
  multiple,
  className,
  inputClassName,
  disableClearable,
  ...props
}) => {
  const { customerOptions, setInputDebounced, loading } = useDebouncedHaulingCustomersRequest();

  return (
    <SearchFieldAutocomplete
      multiple={multiple}
      disableClearable={disableClearable}
      className={className}
      classes={{ inputBaseRoot: inputClassName }}
      fullWidth
      options={customerOptions}
      onInputChange={(_, value) => setInputDebounced(value)}
      loading={loading}
      {...props}
    />
  );
};

export default CustomerSearchField;
