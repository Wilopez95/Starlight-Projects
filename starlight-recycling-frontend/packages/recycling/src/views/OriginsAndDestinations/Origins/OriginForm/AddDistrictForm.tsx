import React, { FC, useMemo } from 'react';
import { Form, FormSpy } from 'react-final-form';
import * as yup from 'yup';
import { Trans, useTranslation } from '../../../../i18n';
import { TextField, validateSchema } from '@starlightpro/common';

import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import AddIcon from '@material-ui/icons/Add';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import AdminDistrictSearchField from '../../../../components/FinalForm/AdminDistrictSearchField';
import { DistrictOption } from '../../../../components/mapbox';
import { HaulingOriginDistrict } from '../../../../graphql/api';
import { pick, defaults } from 'lodash-es';

const DistrictSchema = yup.object().shape({
  id: yup.string().nullable(),
  name: yup.string().nullable(),
  state: yup.string().max(100, 'Should be less then 100 characters').nullable(),
  city: yup.string().max(100, 'Should be less then 100 characters').nullable(),
  county: yup.string().max(100, 'Should be less then 100 characters').nullable(),
});

const defaultValues = {
  selectedDistrict: null,
  state: '',
  county: '',
  city: '',
};

export interface AddDistrictFormProps {
  classes: {
    topDivider: string;
    textFieldRoot: string;
  };
  onSelectedDistrictChange(option: DistrictOption | null): void;
  onSubmit(district: Partial<HaulingOriginDistrict>): void;
  selectedDistrict?: DistrictOption;
}

const useStyles = makeStyles(({ palette }) =>
  createStyles({
    text: {
      color: palette.blue,
    },
  }),
);

export const AddDistrictForm: FC<AddDistrictFormProps> = ({
  selectedDistrict,
  classes,
  onSelectedDistrictChange,
  onSubmit,
}) => {
  const styles = useStyles();
  const [t] = useTranslation();

  const initialValues = useMemo(
    () => (selectedDistrict ? { ...defaultValues, selectedDistrict } : defaultValues),
    [selectedDistrict],
  );

  return (
    <Form
      initialValues={initialValues}
      validate={validateSchema(DistrictSchema)}
      onSubmit={(values) => {
        const { selectedDistrict } = values;
        let data = values;

        if (selectedDistrict) {
          data = defaults(selectedDistrict, initialValues);
        }

        onSubmit(pick(data, ['state', 'county', 'city']));
      }}
      render={({ form }) => (
        <div>
          <AdminDistrictSearchField
            label={<Trans>Search District</Trans>}
            fullWidth
            name="selectedDistrict"
            onChange={onSelectedDistrictChange}
          />

          <Divider className={classes.topDivider} />

          <TextField
            classes={{ root: classes.textFieldRoot }}
            fullWidth
            id="state"
            name="state"
            label={t('State')}
          />
          <TextField
            classes={{ root: classes.textFieldRoot }}
            fullWidth
            id="county"
            name="county"
            label={t('County')}
          />
          <TextField
            classes={{ root: classes.textFieldRoot }}
            fullWidth
            id="city"
            name="city"
            label={t('City')}
          />

          <Box display="flex" justifyContent="flex-end">
            <FormSpy
              subscription={{
                submitting: true,
                validating: true,
                invalid: true,
              }}
            >
              {({ submitting, invalid, validating }) => (
                <Button
                  startIcon={<AddIcon color="inherit" className={styles.text} />}
                  color="primary"
                  disabled={submitting || validating || invalid}
                  className={styles.text}
                  key="on-submit"
                  onClick={() => {
                    form.submit();
                    form.reset(defaultValues);
                  }}
                >
                  <Trans>Add to Origin</Trans>
                </Button>
              )}
            </FormSpy>
          </Box>
        </div>
      )}
    />
  );
};

export default AddDistrictForm;
