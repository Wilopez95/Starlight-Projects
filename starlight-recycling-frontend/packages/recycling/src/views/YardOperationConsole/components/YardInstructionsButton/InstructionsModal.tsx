import React from 'react';
import { CloseConfirmationFormTracker, TextField } from '@starlightpro/common';
import { Trans } from '../../../../i18n';
import { Form } from 'react-final-form';
import {
  useGetCompanyYardInstructionsQuery,
  useSetCompanyYardInstructionsMutation,
} from '../../../../graphql/api';
import { schema } from './schema';
import { validate } from '../../../../utils/forms';
import { closeModal } from '../../../../components/Modals';
import { showError, showSuccess } from '../../../../components/Toast';
import { Box, Button, Divider, makeStyles, Typography } from '@material-ui/core';

const useStyles = makeStyles(({ palette }) => ({
  tooltip: {
    color: palette.grey['600'],
    margin: '8px 0 0',
  },
}));

export const InstructionsModal = () => {
  const classes = useStyles();
  const { data } = useGetCompanyYardInstructionsQuery();
  const [updateYardInstructions] = useSetCompanyYardInstructionsMutation();

  const handleSubmit = async ({ yardInstructions }: any) => {
    try {
      await updateYardInstructions({ variables: { yardInstructions } });

      showSuccess(<Trans>Yard Instructions updated!</Trans>);
      closeModal();
    } catch (e) {
      showError(<Trans>Could not update Yard Instructions</Trans>);
    }
  };

  return (
    <Form
      initialValues={{ yardInstructions: data?.company.yardInstructions }}
      onSubmit={handleSubmit}
      validate={(values) => validate(values, schema)}
      render={({ handleSubmit, hasValidationErrors }) => (
        <Box p={4} width="540px">
          <CloseConfirmationFormTracker />
          <Typography variant="h5">
            <Trans>Edit Yard Instructions</Trans>
          </Typography>
          <Box mt={2}>
            <TextField name="yardInstructions" rows={4} multiline fullWidth />
          </Box>
          <Box fontStyle="italic">
            <Typography className={classes.tooltip} variant="body2">
              <Trans>* This is an instruction for self-service order</Trans>
            </Typography>
          </Box>
          <Box mt={2}>
            <Divider />
          </Box>
          <Box mt={2} display="flex" justifyContent="space-between">
            <Button variant="outlined" color="primary" onClick={closeModal}>
              <Trans>Cancel</Trans>
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={hasValidationErrors}
            >
              <Trans>Save Yard Instructions</Trans>
            </Button>
          </Box>
        </Box>
      )}
    />
  );
};
