import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layouts, MultiSelect } from '@starlightpro/shared-components';
import { useFormik } from 'formik';
import { groupBy, isArray } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { Modal, Typography } from '../../../../../common';
import { Divider } from '../../../../../common/TableTools';
import { FormContainerLayout } from '../../../../../components/forms/layout/FormContainer';
import { IFormModal } from '../../../../../components/modals/types';
import { useStores } from '../../../../../hooks';

import { validationSchema } from './formikData';

import styles from './css/styles.scss';

const multipleCustomerOption = [
  {
    label: 'Multiple Customers',
    value: '',
  },
];
const I18N_PATH = 'modules.billing.FinanceCharges.components.SendFinanceCharges.Text.';

const SendFinanceChargesModal: React.FC<IFormModal<{ emails: string[] }>> = ({
  isOpen,
  onClose,
  onFormSubmit,
}) => {
  const { customerStore, contactStore, financeChargeStore } = useStores();
  const { t } = useTranslation();
  const formik = useFormik({
    validationSchema: validationSchema(t),
    initialValues: { emails: [] as string[] },
    validateOnChange: false,
    initialErrors: {},
    onSubmit: onFormSubmit,
    onReset: onClose,
  });

  const { values, errors, setFieldValue } = formik;

  const selectedFinanceCharges = useMemo(() => {
    return financeChargeStore.selectedEntity
      ? [financeChargeStore.selectedEntity]
      : financeChargeStore.checkedFinanceCharges;
  }, [financeChargeStore.checkedFinanceCharges, financeChargeStore.selectedEntity]);

  const singleCustomer =
    Object.keys(groupBy(selectedFinanceCharges, ({ customer }) => customer?.id)).length === 1;

  useEffect(() => {
    if (singleCustomer && selectedFinanceCharges[0].customer) {
      customerStore.requestById(selectedFinanceCharges[0].customer.id);
      contactStore.requestByCustomer({ customerId: selectedFinanceCharges[0].customer.id });
    }
  }, [contactStore, customerStore, selectedFinanceCharges, singleCustomer]);

  const getSingleCustomerOptions = useCallback(() => {
    const contactOptions = contactStore.values
      .filter(({ email }) => email)
      .map(({ email }) => ({
        label: email!,
        value: email!,
      }));

    const customer = customerStore.getById(selectedFinanceCharges[0].customer?.id);
    const invoiceEmails =
      customer?.invoiceEmails?.map(email => ({ label: email, value: email })) ?? [];
    const options = [...contactOptions, ...invoiceEmails];

    return options;
  }, [contactStore.values, customerStore, selectedFinanceCharges]);

  const emailOptions = useMemo(() => {
    return singleCustomer ? getSingleCustomerOptions() : multipleCustomerOption;
  }, [singleCustomer, getSingleCustomerOptions]);

  const error = useMemo(() => {
    const errorData = errors.emails;

    if (typeof errorData === 'string') {
      return errorData;
    }
    if (isArray(errorData)) {
      return errorData[0];
    }

    return '';
  }, [errors.emails]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} className={styles.modal}>
      <FormContainerLayout formik={formik}>
        <Layouts.Flex direction="column">
          <Layouts.Padding top="3" right="5" left="5">
            <Typography variant="headerThree">Send Finance Charges</Typography>
          </Layouts.Padding>
          <Layouts.Flex direction="column" flexGrow={1}>
            <Layouts.Padding padding="5" bottom="2" top="2">
              <MultiSelect
                name="emails"
                label={t(`Text.SelectEmails`)}
                options={emailOptions}
                maxMenuHeight={202}
                value={values.emails}
                error={error}
                onSelectChange={setFieldValue}
              />
            </Layouts.Padding>
          </Layouts.Flex>
          <Divider />
          <Layouts.Padding padding="4" left="5" right="5">
            <Layouts.Flex justifyContent="space-between">
              <Button type="reset">{t(`Text.Cancel`)}</Button>
              <Button type="submit" variant="primary">
                {t(`${I18N_PATH}SendFinanceCharges`)}
              </Button>
            </Layouts.Flex>
          </Layouts.Padding>
        </Layouts.Flex>
      </FormContainerLayout>
    </Modal>
  );
};

export default observer(SendFinanceChargesModal);
