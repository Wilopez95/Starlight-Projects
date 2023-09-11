import React, { FC, useEffect, useState } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Box from '@material-ui/core/Box';
import { ReadOnlyOrderFormComponent } from '../types';
import { Trans } from '../../../i18n';
import { Field, useForm } from 'react-final-form';
import { TextField, ToggleButton } from '@starlightpro/common';
import { MeasurementType, ScaleConnectionStatus } from '../../../graphql/api';
import { useScale } from '../../../hooks/useScale';
import { useUserIsAllowedToChangeWeightManually } from '../hooks/useUserIsAllowedToChangeWeightManually';
import FormErrorText from '@starlightpro/common/components/FormErrorText';
import { BoxProps } from '@material-ui/core/Box/Box';

const useStyles = makeStyles(
  (theme) => ({
    root: {
      marginBottom: theme.spacing(4),
      position: 'relative',
    },
    weightFormControlInner: {
      width: 100,
      marginRight: theme.spacing(2),
    },
    toggleRoot: {
      display: 'flex',
      alignItems: 'center',
      marginLeft: theme.spacing(0),
      marginTop: theme.spacing(1),
    },
    toggleLabel: {
      fontSize: '14px',
    },
    error: {
      position: 'absolute',
    },
    field: {
      marginBottom: 0,
    },
  }),
  { name: 'WeightInput' },
);

interface PastFieldState {
  weight: number;
  type: MeasurementType;
  source: string | null;
  timestamp: Date;
}

export interface WeightInputProps extends ReadOnlyOrderFormComponent {
  fieldName: string;
  label: string | React.ReactElement<BoxProps>;
  isScaleValueChange?: boolean;
}

export const WeightInput: FC<WeightInputProps> = ({
  fieldName,
  label,
  readOnly = false,
  isScaleValueChange = false,
}) => {
  const classes = useStyles();
  const form = useForm();
  const formState = form.getState();
  const [prevFieldState] = useState<PastFieldState>({
    weight: formState.values[fieldName],
    type: formState.values[`${fieldName}Type`],
    source: formState.values[`${fieldName}Source`],
    timestamp: formState.values[`${fieldName}Timestamp`],
  });
  const [isManualOverride, setManualOverride] = useState(false);
  const { setManualWeight, connectionStatus, scaleId } = useScale();
  const isUserAllowedToChangeWeight = useUserIsAllowedToChangeWeightManually();

  const isManualChangeByDefault = connectionStatus !== ScaleConnectionStatus.Connected;
  const isManualChangeByPermission = !isManualChangeByDefault && isUserAllowedToChangeWeight;

  const handleToggleChange = () => {
    setManualOverride(!isManualOverride);

    if (!isManualOverride) {
      return;
    }

    if (isScaleValueChange) {
      setManualWeight(null);
    } else {
      form.batch(() => {
        form.change(fieldName, prevFieldState.weight);
        form.change(`${fieldName}Type`, prevFieldState.type);
        form.change(`${fieldName}Source`, prevFieldState.source);
        form.change(`${fieldName}Timestamp`, prevFieldState.timestamp);
      });
    }
  };

  useEffect(() => {
    return () => {
      setManualWeight(null);
    };
  }, [setManualWeight]);

  const isManualChangeByPermissionEnabled = isManualChangeByPermission && isManualOverride;
  const isManualChangeEnabled = isManualChangeByPermissionEnabled || isManualChangeByDefault;
  const isDisabled = readOnly || !isManualChangeEnabled;

  return (
    <Box className={classes.root}>
      <Box display="flex">
        <TextField
          key={fieldName}
          disabled={isDisabled}
          id={fieldName}
          name={fieldName}
          label={label}
          inputProps={{ min: 0 }}
          type="number"
          required
          hideErrorText
          classes={{ root: classes.field, formControlInner: classes.weightFormControlInner }}
          onChange={({ target: { value } }) => {
            form.batch(() => {
              form.change(`${fieldName}Type`, MeasurementType.Manual);
              form.change(`${fieldName}Source`, scaleId);
              form.change(`${fieldName}Timestamp`, new Date().toISOString());
            });

            if (isScaleValueChange) {
              setManualWeight(Number(value || 0));
            }
          }}
        />
        {isManualChangeByPermission && (
          <FormControlLabel
            control={
              <ToggleButton
                value={isManualOverride}
                onChange={handleToggleChange}
                readOnly={readOnly}
              />
            }
            label={<Trans>Manual Override</Trans>}
            classes={{
              root: classes.toggleRoot,
              label: classes.toggleLabel,
            }}
          />
        )}
      </Box>
      <Field name={fieldName} subscription={{ error: true, touched: true }}>
        {({ meta: { error, touched } }) => {
          return (
            <FormErrorText classes={{ root: classes.error }} error={error} touched={touched} />
          );
        }}
      </Field>
    </Box>
  );
};
