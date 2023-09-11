import { gql } from '@apollo/client';
import React, { FC, useMemo } from 'react';
import { useGetUsersForSearchQuery } from '../../graphql/api';
import SearchFieldAutocomplete from '../SearchFieldAutocomplete';
import { BaseSearchFieldProps } from '../Filter';

export interface UserSearchFieldProps extends BaseSearchFieldProps {}

gql`
  query GetUsersForSearch {
    listUsers {
      data {
        id
        name
      }
      total
    }
  }
`;

export const UserSearchField: FC<UserSearchFieldProps> = ({
  multiple,
  className,
  inputClassName,
  value,
  onChange,
  renderTags,
}) => {
  const { data } = useGetUsersForSearchQuery({
    fetchPolicy: 'network-only',
  });

  const options = useMemo(() => {
    if (!data) {
      return [];
    }

    return data.listUsers.data.map((user) => ({ label: user.name, value: user.id }));
  }, [data]);

  return (
    <SearchFieldAutocomplete
      multiple={multiple}
      className={className}
      classes={{ inputBaseRoot: inputClassName }}
      value={value}
      fullWidth
      options={options}
      onChange={onChange}
      renderTags={renderTags}
    />
  );
};

export default UserSearchField;
