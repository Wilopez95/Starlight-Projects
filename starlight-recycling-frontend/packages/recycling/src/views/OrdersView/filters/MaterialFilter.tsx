import React from 'react';
import { Field } from 'react-final-form';

import { useGetHaulingMaterialsQuery } from '../../../graphql/api';
import SearchFieldAutocomplete from '../../../components/SearchFieldAutocomplete';
import { FilterSearchValueType } from '../../../components/Datatable/fields/SearchValueField';

export const MaterialFilter = ({ onChange, name }: any) => {
  const { data } = useGetHaulingMaterialsQuery();
  const options =
    data?.haulingMaterials.data.map((material) => ({
      label: `${material.description}  ${material?.units ? '(' + material.units + ')' : '( )'}`,
      value: material.id,
    })) || [];

  return (
    <Field name={name}>
      {(props) => (
        <SearchFieldAutocomplete
          {...props}
          options={options}
          label=""
          getMenuItemProps={(option) => ({ dataCy: option.label })}
          data-cy="Material Filter"
          onChange={(newValue: FilterSearchValueType) => {
            onChange && onChange(newValue);
          }}
        />
      )}
    </Field>
  );
};
