import React, { FC } from 'react';
import * as Yup from 'yup';
import { useTranslation } from '../../../i18n';
import {
  CheckBoxField,
  CloseConfirmationFormTracker,
  LineTextField,
  numericCheckNaNDecorator,
  SelectOption,
} from '@starlightpro/common';

import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {
  CustomerTruckInput,
  CustomerTruckTypes,
  MeasurementType,
  MeasurementUnit,
} from '../../../graphql/api';
import { DECIMAL_PRECISION } from '../../../constants/regex';
import SidebarForm from '../../../components/FinalForm/SidebarForm';
import {
  MeasureTarget,
  useCompanyMeasurementUnits,
} from '../../../hooks/useCompanyMeasurementUnits';

const CustomerTruckSchema = Yup.object().shape({
  description: Yup.string()
    .max(100, 'Should be less than 100 characters')
    .trim()
    .nullable()
    .required('Required'),
  type: Yup.string().required('Required'),
  truckNumber: Yup.string()
    // eslint-disable-next-line
    .max(25, 'Should be less than ${max} characters')
    .trim()
    .required('Required'),
  licensePlate: Yup.string()
    // eslint-disable-next-line
    .max(25, 'Should be less than ${max} characters')
    .trim()
    .nullable(),
  emptyWeight: Yup.number()
    .positive('Must be positive')
    // eslint-disable-next-line
    .max(10000000000, 'Max value is ${max}')
    .test('is-decimal', 'Max 2 numbers after decimal', (value: number) =>
      value
        ? DECIMAL_PRECISION.test(value.toLocaleString('fullwide', { useGrouping: false }))
        : true,
    )
    .nullable(),
});

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      '& .MuiTextField-root, & .MuiFormControl-root': {
        marginTop: theme.spacing(2),
        marginBottom: 0,
      },
    },
    paper: {
      maxWidth: 360,
    },
    inputFormControl: {
      minWidth: 150,
    },
    inputSuffix: {
      minWidth: 50,
    },
    sidePanelContent: {
      flexBasis: 310,
    },
  }),
);

export interface TruckFormValues extends Omit<CustomerTruckInput, 'type' | 'customerId'> {
  type?: CustomerTruckTypes;
}

interface CustomerTrucksFormProps {
  create?: boolean;
  initialValues: TruckFormValues;
  onSubmit: (values: TruckFormValues) => Promise<any>;
  onCancel?: () => void;
  onSubmitted?: (values: TruckFormValues, result?: any) => void;
  hideStatus?: boolean;
}

export const CustomerTruckForm: FC<CustomerTrucksFormProps> = ({
  create,
  onCancel,
  onSubmit,
  initialValues,
  onSubmitted,
  hideStatus = false,
}) => {
  const classes = useStyles();
  const [t] = useTranslation();
  const { massTranslation, convertWeights } = useCompanyMeasurementUnits();

  return (
    <SidebarForm
      cancelable
      create={create}
      canDuplicate={!create}
      initialValues={initialValues}
      decorators={[numericCheckNaNDecorator('emptyWeight')]}
      schema={CustomerTruckSchema}
      title={create ? t('Create New Truck') : initialValues.description!}
      classes={{
        paper: classes.paper,
        content: classes.sidePanelContent,
      }}
      toolbar={<Typography variant="overline">{t('Truck')}</Typography>}
      onCancel={() => {
        if (onCancel) {
          onCancel();
        }
      }}
      onSubmitted={(values, result) => {
        if (onSubmitted) {
          onSubmitted(values as TruckFormValues, result?.data);
        }
      }}
      onSubmit={(values: Record<string, any>) => {
        const { emptyWeight, ...rest } = values;

        rest.emptyWeight = emptyWeight
          ? parseFloat(
              `${convertWeights(emptyWeight, MeasureTarget.backend, undefined, undefined, {
                useCompanySettings: true,
              })}`,
            )
          : null;
        rest.emptyWeightType = MeasurementType.Manual;
        rest.emptyWeightUnit = MeasurementUnit.Kilogram;
        rest.emptyWeightSource = null;
        rest.emptyWeightTimestamp = new Date();

        return onSubmit(rest as TruckFormValues);
      }}
    >
      <CloseConfirmationFormTracker />
      <Box flexDirection="column">
        {!hideStatus && (
          <CheckBoxField
            name="active"
            lineVariant
            label={t('Active')}
            fieldLabel={t('Status')}
            classes={{
              formControlInner: classes.inputFormControl,
            }}
          />
        )}
        <LineTextField
          id="description"
          data-cy="Description"
          name="description"
          label={t('Description')}
          fullWidth
          required
          classes={{
            formControlInner: classes.inputFormControl,
          }}
        />
        <LineTextField
          id="type"
          name="type"
          data-cy="Type"
          label={t('Type')}
          fullWidth
          required
          classes={{
            formControlInner: classes.inputFormControl,
          }}
          select
          SelectProps={{
            inputProps: { id: 'type', name: 'type' },
          }}
        >
          <SelectOption value={CustomerTruckTypes.Rolloff}>{t('Rolloff')}</SelectOption>
          <SelectOption value={CustomerTruckTypes.Tractortrailer}>
            {t('Tractor / Trailer')}
          </SelectOption>
          <SelectOption value={CustomerTruckTypes.Dumptruck}>{t('Dump Truck')}</SelectOption>
        </LineTextField>
        <LineTextField
          name="truckNumber"
          data-cy="Truck Number"
          label={t('Truck Number')}
          id="truckNumber"
          fullWidth
          classes={{
            formControlInner: classes.inputFormControl,
          }}
          required
        />
        <LineTextField
          type="number"
          name="emptyWeight"
          label={`${t('Tare Weight')} (${massTranslation})`}
          id="emptyWeight"
          InputProps={{
            inputProps: {
              min: 0,
              step: 'any',
            },
          }}
          fullWidth
          classes={{
            inputSuffix: classes.inputSuffix,
            formControlInner: classes.inputFormControl,
          }}
        />
        <LineTextField
          id="licensePlate"
          name="licensePlate"
          fullWidth
          label={t('License Plate')}
          classes={{
            formControlInner: classes.inputFormControl,
          }}
        />
      </Box>
    </SidebarForm>
  );
};

export default CustomerTruckForm;
