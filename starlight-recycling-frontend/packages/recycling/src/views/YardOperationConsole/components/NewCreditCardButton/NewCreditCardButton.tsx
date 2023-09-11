import { Box, Button } from '@material-ui/core';
import React from 'react';
import { useField } from 'react-final-form';
import { Trans } from '../../../../i18n';
import { closeModal } from '../../../../components/Modals';
import NewCustomerCreditCardForm from '../../../CustomerCreditCards/CustomerCreditCardForm/NewCustomerCreditCardForm';
import { showSuccess, useOpenFormWithCloseConfirmation } from '@starlightpro/common';

export const NewCreditCardButton = () => {
  const {
    input: { value: customer },
  } = useField('customer', { subscription: { value: true } });
  const { input } = useField('creditCardId', { subscription: { value: true } });
  const [openForm] = useOpenFormWithCloseConfirmation({ modal: true });

  const openCreateNewCreditCardModal = () => {
    if (!customer?.id) {
      return;
    }

    openForm({
      form: (
        <Box p={4} height={870} width={700} maxWidth="100%" maxHeight="100%">
          <NewCustomerCreditCardForm
            onCancel={closeModal}
            customerId={customer.id}
            onSubmitted={(values, creditCardId) => {
              input.onChange({ target: { name: 'creditCardId', value: creditCardId } });
              showSuccess(<Trans>Credit card created successfully.</Trans>);

              closeModal();
            }}
          />
        </Box>
      ),
    });
  };

  return (
    <Button variant="outlined" color="primary" onClick={openCreateNewCreditCardModal} fullWidth>
      <Trans>Add New Card</Trans>
    </Button>
  );
};
