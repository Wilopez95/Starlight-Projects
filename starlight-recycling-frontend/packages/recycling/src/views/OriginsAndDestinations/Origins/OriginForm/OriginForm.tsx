import React, { FC } from 'react';
import * as yup from 'yup';
import i18n, { Trans, useTranslation } from '../../../../i18n';
import { Field } from 'react-final-form';

import Divider from '@material-ui/core/Divider';
import Box from '@material-ui/core/Box';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

import DistrictsTable from './DistrictsTable';
import { TextField, CheckBoxField, CloseConfirmationFormTracker } from '@starlightpro/common';
import { Boundary, DistrictOption } from '../../../../components/mapbox';
import AdminDistrictMapField from '../../../../components/FinalForm/AdminDistrictMapField';
import SidebarForm from '../../../../components/FinalForm/SidebarForm';
import {
  HaulingOriginDistrict,
  AdministrativeDistrict,
  OriginInput,
  GetOriginQuery,
} from '../../../../graphql/api';
import AddDistrictForm from './AddDistrictForm';
import { isEmpty, values, isEqual, pick } from 'lodash-es';
import { closeSidePanel } from '@starlightpro/common/components/SidePanels';
import { serverMessages } from '../../../../constants';
import { layersMapUsToGeneral } from '../../../../components/mapbox/types';

const compareBy = (key: string) => (a: any, b: any) => {
  if (typeof a[key] !== 'string') {
    if (a[key] < b[key]) {
      return -1;
    }

    if (a[key] > b[key]) {
      return 1;
    }

    return 0;
  }

  const aStr = (a[key] || '').toUpperCase();
  const bStr = (b[key] || '').toUpperCase();

  if (aStr < bStr) {
    return -1;
  }

  if (aStr > bStr) {
    return 1;
  }

  return 0;
};

export interface OriginFormValues extends Omit<OriginInput, 'originDistricts'> {
  originDistricts: GetOriginQuery['origin']['originDistricts'];
  selectedDistrict: Pick<HaulingOriginDistrict, 'city' | 'county' | 'state'> | null | undefined;
}

const OriginSchema = yup.object<OriginFormValues>().shape({
  active: yup.bool().required(i18n.t('Required')),
  description: yup
    .string()
    .max(100, i18n.t('MaxLength', { number: 100 }))
    .trim()
    .required(i18n.t('Required')),
  originDistricts: yup
    .array()
    .of(
      yup.object().shape({
        state: yup.string(),
        city: yup.string().nullable(),
        county: yup.string().nullable(),
        taxDistrictId: yup.number().nullable(),
      }),
    )
    .min(1, i18n.t('At least one district is required')),
});

interface OriginFormProps {
  origin: any;
  onSubmit: (values: OriginFormValues) => Promise<void>;
  onSubmitted?: (values: OriginFormValues) => void;
  onCancel?: () => void;
  create?: boolean;
}

const initialValues = {
  active: true,
  description: '',
  originDistricts: [],
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    topDivider: {
      margin: theme.spacing(2, 0),
    },
    divider: {
      margin: theme.spacing(2, 0),
    },
    subtitle: {
      marginBottom: theme.spacing(1),
    },
    mapWrap: {
      flex: 1,
      marginLeft: theme.spacing(3),
    },
    map: {
      height: '100%',
    },
    paper: {
      width: 700,
    },
    textFieldRoot: {
      marginBottom: theme.spacing(2),
    },
  }),
);

export const OriginForm: FC<OriginFormProps> = ({
  origin,
  create,
  onCancel,
  onSubmit,
  onSubmitted,
}) => {
  const classes = useStyles();
  const [t] = useTranslation();

  return (
    <SidebarForm<OriginFormValues>
      create={create}
      initialValues={
        origin
          ? {
              ...origin,
              originDistricts: origin.originDistricts,
            }
          : initialValues
      }
      schema={OriginSchema}
      cancelable
      title={
        <Field name="description" subscription={{ value: true }}>
          {({ input }) => (create ? t('Create New Origin') : input.value)}
        </Field>
      }
      classes={{
        paper: classes.paper,
      }}
      onCancel={() => {
        closeSidePanel();

        if (onCancel) {
          onCancel();
        }
      }}
      onSubmit={async (values) => {
        try {
          await onSubmit(OriginSchema.cast(values));
        } catch (e) {
          const containBrokenDistricts = values.originDistricts.some(
            ({ state, city, county }) => !state && (!!city || !!county),
          );

          if (containBrokenDistricts) {
            throw new Error(
              t(
                "Can't be saved. State should be defined in case of manual input of the county or city",
              ),
            );
          } else {
            const errorMessage =
              serverMessages.errors.uniqEntity === e.message
                ? t('Origin with this description already exists')
                : e.message;
            throw new Error(errorMessage);
          }
        }
      }}
      onSubmitted={onSubmitted}
    >
      <CloseConfirmationFormTracker />
      <Box display="flex">
        <Box flex={1}>
          <Box mb={1}>
            <CheckBoxField name="active" label={<Trans>Active</Trans>} />
          </Box>

          <TextField
            classes={{ root: classes.textFieldRoot }}
            required
            fullWidth
            id="description"
            name="description"
            label={<Trans>Description</Trans>}
          />

          <Divider className={classes.topDivider} />

          <Field name="selectedDistrict" subscription={{ value: true }}>
            {({ input: selectedDistrictInput }) => (
              <Field name="originDistricts" subscription={{ value: true }}>
                {({ input: districtsInput }) => (
                  <AddDistrictForm
                    selectedDistrict={selectedDistrictInput.value}
                    classes={classes}
                    onSelectedDistrictChange={(option) => {
                      selectedDistrictInput.onChange({
                        target: {
                          name: 'selectedDistrict',
                          value: option,
                        },
                      });
                    }}
                    onSubmit={(newDistrict: HaulingOriginDistrict) => {
                      selectedDistrictInput.onChange({
                        target: {
                          name: 'selectedDistrict',
                          value: null,
                        },
                      });

                      const empty = values(newDistrict).every(isEmpty);

                      if (empty) {
                        return;
                      }

                      const { value: districtValues } = districtsInput;
                      // todo: add distritInputType here
                      const alreadyExist = districtValues.some((existedValue: any) =>
                        isEqual(pick(existedValue, ['city', 'county', 'state']), {
                          city: newDistrict.city || null,
                          county: newDistrict.county || null, // todo
                          state: newDistrict.state || null,
                        }),
                      );

                      if (alreadyExist) {
                        return;
                      }

                      districtsInput.onChange({
                        target: {
                          name: 'originDistricts',
                          value: [...districtsInput.value, newDistrict]
                            .sort(compareBy('city'))
                            .sort(compareBy('county'))
                            .sort(compareBy('state')),
                        },
                      });
                    }}
                  />
                )}
              </Field>
            )}
          </Field>
        </Box>

        <AdminDistrictMapField
          name="selectedDistrict"
          className={classes.map}
          wrapClassName={classes.mapWrap}
        >
          <Field name="originDistricts" subscription={{ value: true }}>
            {({ input }) => {
              return ((input.value as (DistrictOption & AdministrativeDistrict)[]) || [])
                .filter((d) => d.__typename === 'AdministrativeDistrict')
                .map((districtOption) => {
                  if (!districtOption) {
                    return null;
                  }

                  return (
                    <Boundary
                      key={districtOption.id}
                      type={layersMapUsToGeneral[districtOption.level]}
                      zoneId={districtOption.id}
                    />
                  );
                });
            }}
          </Field>
        </AdminDistrictMapField>
      </Box>

      <Divider className={classes.divider} />

      <DistrictsTable />
    </SidebarForm>
  );
};

export default OriginForm;
