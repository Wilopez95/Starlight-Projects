import React, { FC, useContext, useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core';
import { useField } from 'react-final-form';

import { TextField } from '@starlightpro/common';
import Box from '@material-ui/core/Box';
import FormErrorText from '@starlightpro/common/components/FormErrorText';
import { useCompanyMeasurementUnits } from '../../../hooks/useCompanyMeasurementUnits';
import { Trans } from '../../../i18n';
import { MaterialOrderContext } from '../../../utils/contextProviders/MaterialOrderProvider';
import { HaulingMaterial } from '@starlightpro/common/graphql/api';
import {
  getUomTranslation,
  UnitOfMeasurementType,
} from '../../../hooks/useUnitOfMeasurementConversion';

const useStyles = makeStyles(
  ({ spacing }) => ({
    root: {
      marginBottom: spacing(1),
    },
    weightInFormControlInner: {
      width: 100,
      alignSelf: 'flex-end',
    },
    weightInInputBaseInput: {
      textAlign: 'right',
    },
    error: {
      width: 76,
      marginLeft: 'auto',
    },
  }),
  { name: 'NetWeightInput' },
);

interface Props {
  weightUOM?: UnitOfMeasurementType;
}

export const NetWeightInput: FC<Props> = ({ weightUOM } = {}) => {
  const classes = useStyles();
  const { meta } = useField('netWeight', { subscription: { error: true } });
  const { massTranslation } = useCompanyMeasurementUnits();
  const uomTranslation = weightUOM ? getUomTranslation(weightUOM) : massTranslation;

  const materialContext = useContext(MaterialOrderContext);

  const [material, setMaterial] = useState<
    | ({
        __typename?: 'HaulingMaterial' | undefined;
      } & Pick<
        HaulingMaterial,
        'id' | 'description' | 'misc' | 'useForDump' | 'useForLoad' | 'units'
      >)
    | undefined
  >(materialContext.material);

  useEffect(() => {
    setMaterial(materialContext.material);
  }, [materialContext]);

  return (
    <Box>
      <TextField
        id="netWeight"
        name="netWeight"
        label={
          <Box>
            <Trans>Net Weight</Trans>
            {` (${
              material?.units && !weightUOM
                ? getUomTranslation(material.units as UnitOfMeasurementType)
                : uomTranslation
            })`}
          </Box>
        }
        disabled
        classes={{
          root: classes.root,
          formControlInner: classes.weightInFormControlInner,
          inputBaseInput: classes.weightInInputBaseInput,
        }}
      />
      {meta.error && <FormErrorText classes={{ root: classes.error }} touched error={meta.error} />}
    </Box>
  );
};
