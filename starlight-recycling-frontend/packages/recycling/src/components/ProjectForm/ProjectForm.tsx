import React, { FC } from 'react';
import { Trans } from '../../i18n';
import { useRegion } from '../../hooks/useRegion';
import { Form, Field, FormSpy } from 'react-final-form';
import { TextField } from '@starlightpro/common';
import { Divider, Box, Button, Typography } from '@material-ui/core';

import { CheckBoxField, CloseConfirmationFormTracker } from '@starlightpro/common';
import { validate } from '../../utils/forms';
import { ProjectSchema } from './schema';
import DateField from '../FinalForm/DateField';
import { ProjectInput } from '../../graphql/api';
import { makeStyles } from '@material-ui/core';

interface ProjectFormProps {
  onCancel: () => void;
  onSubmit: (values: ProjectInput) => Promise<any>;
  initialValues: Partial<ProjectInput>;
  create?: boolean;
  jobSitePORequired?: boolean;
  onSubmitted?(result?: any): void;
}

const useStyles = makeStyles(({ palette }) => ({
  cancelText: {
    color: palette.primary.main,
  },
}));

export const ProjectForm: FC<ProjectFormProps> = ({
  create = false,
  onCancel,
  initialValues,
  onSubmit,
  onSubmitted,
  jobSitePORequired,
}) => {
  const classes = useStyles();
  const region = useRegion();

  return (
    <Box p={4}>
      <Form
        initialValues={initialValues}
        validate={async (values) => await validate(values, ProjectSchema)}
        onSubmit={async (values, form) => {
          const result = await onSubmit(values as ProjectInput);
          form.initialize(values);

          if (onSubmitted) {
            onSubmitted(result);
          }
        }}
        subscription={{}}
        render={({ handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <CloseConfirmationFormTracker />
            <Box width={340}>
              <Typography variant="h5">
                {create ? <Trans>Create New</Trans> : <Trans>Edit Project</Trans>}
              </Typography>
              <TextField
                id="description"
                name="description"
                label={<Trans>Description</Trans>}
                multiline
                rows={2}
                required
                fullWidth
              />
              <label>
                <DateField
                  name="startDate"
                  required
                  fullWidth
                  minDate={new Date()}
                  placeholder={region.formatDateTime.date}
                  key="startDate"
                  label={<Trans>Start Date</Trans>}
                />
              </label>
              <label>
                <Field name="startDate" subscription={{ value: true }}>
                  {({ input }) => {
                    return (
                      <DateField
                        name="endDate"
                        placeholder={region.formatDateTime.date}
                        key="endDate"
                        fullWidth
                        minDate={new Date(input.value)}
                        label={<Trans>End Date</Trans>}
                      />
                    );
                  }}
                </Field>
              </label>
              <CheckBoxField
                disabled={jobSitePORequired}
                name="purchaseOrder"
                label={<Trans>PO # Required</Trans>}
              />
              <Divider />
              <Box display="flex" justifyContent="space-between" mt={3}>
                <Button variant="outlined" className={classes.cancelText} onClick={onCancel}>
                  <Trans>Cancel</Trans>
                </Button>
                <FormSpy
                  subscription={{
                    pristine: true,
                    submitting: true,
                    validating: true,
                    invalid: true,
                  }}
                >
                  {({ submitting, invalid, pristine, validating }) => (
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={pristine || submitting || validating || invalid}
                      key="on-submit"
                    >
                      {create ? <Trans>Create New</Trans> : <Trans>Save Changes</Trans>}
                    </Button>
                  )}
                </FormSpy>
              </Box>
            </Box>
          </form>
        )}
      />
    </Box>
  );
};
