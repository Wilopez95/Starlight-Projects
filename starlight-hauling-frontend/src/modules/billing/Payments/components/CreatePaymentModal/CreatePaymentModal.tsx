import React, { useCallback, useMemo } from 'react';
import {
  Autocomplete,
  Button,
  FormContainerLayout,
  Layouts,
} from '@starlightpro/shared-components';
import { useFormik } from 'formik';
import { observer } from 'mobx-react-lite';

import { GlobalService } from '../../../../../api';
import { AutocompleteTemplates, Modal, Typography } from '../../../../../common';
import { Divider } from '../../../../../common/TableTools';
import { useBusinessContext, useStores } from '../../../../../hooks';
import { CustomerSuggestion, InvoiceSuggestion } from '../../../../../types/responseEntities';

import { defaultValue, validationSchema } from './formikData';
import { type FormikCreatePayment, type ISearchCustomerOrInvoiceModal } from './types';

import styles from './css/styles.scss';

const CreatePaymentModal: React.FC<ISearchCustomerOrInvoiceModal<FormikCreatePayment>> = ({
  isOpen,
  isPayout,
  onClose,
  onFormSubmit,
}) => {
  const { customerStore, invoiceStore } = useStores();
  const { businessUnitId } = useBusinessContext();

  const formik = useFormik({
    initialValues: defaultValue,
    validationSchema,
    validateOnChange: false,
    onSubmit: onFormSubmit,
    onReset: onClose,
  });

  const { values, errors, setValues } = formik;

  const [title, placeholder] = useMemo(
    () => [
      isPayout ? 'Payout' : 'Payment',
      `Search by customer name ${isPayout ? '' : 'or invoice #'}`,
    ],
    [isPayout],
  );

  const handleAutocompleteRequest = useCallback(
    async (searchValue: string) => {
      const { customers, invoices } = await GlobalService.searchCustomersOrInvoices(
        searchValue,
        businessUnitId,
      );

      return {
        customers,
        invoices,
      };
    },
    [businessUnitId],
  );

  const handleAutocompleteChange = useCallback(
    (_: string, value: string) => {
      setValues({
        ...values,
        searchString: value,
        customerId: undefined,
        invoiceId: undefined,
      });
    },
    [setValues, values],
  );

  const handleCustomerAutocompleteSelect = useCallback(
    (customer: CustomerSuggestion) => {
      setValues({
        ...values,
        customerId: customer.id,
        searchString: customer?.name,
      });
      customerStore.requestById(customer.id);
    },
    [setValues, values, customerStore],
  );

  const handleInvoiceAutocompleteSelect = useCallback(
    (invoice: InvoiceSuggestion) => {
      setValues({
        ...values,
        invoiceId: invoice.id,
        searchString: `Invoice# ${invoice.id}`,
      });
      if (invoice.customer?.id) {
        customerStore.requestById(invoice.customer.id);
      }
      if (invoice.id) {
        invoiceStore.requestById(invoice.id);
      }
    },
    [setValues, values, invoiceStore, customerStore],
  );

  const autocompleteConfigs = useMemo(() => {
    const configs = [
      {
        name: 'customers',
        onSelect: handleCustomerAutocompleteSelect,
        template: <AutocompleteTemplates.Customer />,
      },
    ];

    if (!isPayout) {
      configs.push({
        name: 'invoices',
        onSelect: handleInvoiceAutocompleteSelect,
        template: <AutocompleteTemplates.Invoice />,
      });
    }

    return configs;
  }, [isPayout, handleCustomerAutocompleteSelect, handleInvoiceAutocompleteSelect]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} className={styles.modal}>
      <FormContainerLayout formik={formik}>
        <Layouts.Flex direction="column">
          <Layouts.Padding top="4" right="5" left="5">
            <Typography variant="headerThree">Create {title}</Typography>
          </Layouts.Padding>
          <Layouts.Flex direction="column" flexGrow={1} justifyContent="space-around">
            <Layouts.Padding left="5" right="5">
              <Typography
                as="label"
                htmlFor="searchString"
                variant="bodyMedium"
                color="secondary"
                shade="desaturated"
              >
                Select Customer {isPayout ? '' : 'Or Invoice'}
              </Typography>
              <Layouts.Padding top="1" bottom="1">
                <Layouts.Box height="50px">
                  <Autocomplete
                    name="searchString"
                    placeholder={placeholder}
                    search={values.searchString}
                    onSearchChange={handleAutocompleteChange}
                    onRequest={handleAutocompleteRequest}
                    minSearchLength={1}
                    configs={autocompleteConfigs}
                    error={errors?.customerId}
                  />
                </Layouts.Box>
              </Layouts.Padding>
            </Layouts.Padding>
            <Divider />
            <Layouts.Padding left="5" right="5" bottom="2">
              <Layouts.Flex justifyContent="space-between" alignItems="center">
                <Button type="reset">Cancel</Button>
                <Button
                  type="submit"
                  disabled={!values.customerId ? !values.invoiceId : undefined}
                  variant="success"
                >
                  {title} Details →
                </Button>
              </Layouts.Flex>
            </Layouts.Padding>
          </Layouts.Flex>
        </Layouts.Flex>
      </FormContainerLayout>
    </Modal>
  );
};

export default observer(CreatePaymentModal);
