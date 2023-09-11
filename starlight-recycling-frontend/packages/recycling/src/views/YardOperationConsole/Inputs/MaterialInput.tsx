import React, { useContext, useEffect } from 'react';
import { gql } from '@apollo/client';
import { Trans } from '../../../i18n';
import { useField } from 'react-final-form';
import { SelectOption, TextField } from '@starlightpro/common';
import { truncate } from 'lodash/fp';

import { OrderType, useGetHaulingMaterialsLazyQuery } from '../../../graphql/api';
import { ReadOnlyOrderFormComponent } from '../types';
import { LoadingInput } from '../../../components/LoadingInput';
import { makeStyles } from '@material-ui/core';
import { MaterialOrderContext } from '../../../utils/contextProviders/MaterialOrderProvider';

const useStyles = makeStyles(() => ({
  truncate: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}));

gql`
  query getHaulingMaterials($filter: HaulingMaterialFilterInput) {
    haulingMaterials(filter: $filter) {
      data {
        id
        description
        misc
        useForDump
        useForLoad
        units
      }
    }
  }
`;

interface Props extends ReadOnlyOrderFormComponent {
  updateContext?: boolean;
}

export const MaterialInput: React.FC<Props> = ({ readOnly, updateContext = true }) => {
  const classes = useStyles();
  const {
    input: { value: type },
  } = useField('type', { subscription: { value: true } });
  const [getMaterials, { data: haulingMaterialsData, loading }] = useGetHaulingMaterialsLazyQuery({
    fetchPolicy: 'no-cache',
  });
  const {
    input: { value: customer },
  } = useField('customer', { subscription: { value: true } });
  let {
    input: { value: material },
  } = useField('material', { subscription: { value: true } });

  const materials = haulingMaterialsData?.haulingMaterials?.data || [];
  const materialContext = useContext(MaterialOrderContext);

  useEffect(() => {
    materialContext.setMaterial(material);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateContext]);

  useEffect(() => {
    if (customer) {
      const isDump = type === OrderType.Dump;
      getMaterials({
        variables: {
          filter: {
            activeOnly: true,
            equipmentItems: true,
            [isDump ? 'useForDump' : 'useForLoad']: true,
          },
        },
      });
    }
  }, [getMaterials, type, customer]);

  if (loading) {
    return <LoadingInput label={<Trans>Material</Trans>} />;
  }

  return (
    <TextField
      select
      name="material"
      data-cy="Material Input"
      fullWidth
      inputProps={{ id: 'material' }}
      SelectProps={{ MenuProps: { 'data-cy': 'Material Input Select' } as any }}
      label={<Trans>Material</Trans>}
      required
      disabled={readOnly || !customer}
      onChange={(event) => {
        const value: number = +event.target.value;
        const selectedMaterial = materials.find((x) => x.id === value);

        updateContext && materialContext.setMaterial(selectedMaterial);
        material = selectedMaterial;
      }}
      mapValues={{
        mapFieldValueToFormValue: (materialId: number) => {
          return materials.find(({ id }) => id === materialId);
        },
        mapFormValueToFieldValue: () => {
          if (!updateContext) {
            return material.id;
          }

          return materialContext?.material?.id ?? '';
        },
      }}
    >
      {materials.map((row) => {
        return (
          <SelectOption
            key={row.id}
            value={row.id}
            data-cy={row.description}
            className={classes.truncate}
            selected={row.id === material.id}
          >
            {truncate({ length: 28 }, row.description)}
          </SelectOption>
        );
      })}
    </TextField>
  );
};
