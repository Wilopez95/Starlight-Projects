import React, { useMemo } from 'react';
import { Button, ISelectOption, Layouts, MultiSelect } from '@starlightpro/shared-components';
import { useFormik } from 'formik';
import { isArray } from 'lodash-es';

import { useStores } from '@root/hooks';

import { Modal, Typography } from '../../../../../common';
import { Divider } from '../../../../../common/TableTools';
import { FormContainerLayout } from '../../../../../components/forms/layout/FormContainer';
import { IFormModal } from '../../../../../components/modals/types';

import { validationSchema } from './formikData';

import styles from './css/styles.scss';

const SendStatementsModal: React.FC<IFormModal<{ statementEmails: string[] }>> = ({
  isOpen,
  onClose,
  onFormSubmit,
}) => {
  const { customerStore } = useStores();
  const selectedCustomer = customerStore.selectedEntity;

  const formik = useFormik({
    validationSchema,
    initialValues: { statementEmails: [] as string[] },
    validateOnChange: false,
    initialErrors: {},
    onSubmit: onFormSubmit,
    onReset: onClose,
  });

  const { values, errors, setFieldValue } = formik;

  const emailsOptions = useMemo((): ISelectOption[] => {
    return (
      selectedCustomer?.statementEmails.map(email => ({
        value: email,
        label: email,
      })) ?? []
    );
  }, [selectedCustomer?.statementEmails]);

  const error = useMemo(() => {
    const statementError = errors.statementEmails;

    if (typeof statementError === 'string') {
      return statementError;
    }
    if (isArray(statementError)) {
      return statementError[0];
    }

    return '';
  }, [errors.statementEmails]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} className={styles.modal}>
      <FormContainerLayout formik={formik}>
        <Layouts.Flex direction="column">
          <Layouts.Padding top="3" right="5" left="5">
            <Typography variant="headerThree">Send Statements</Typography>
          </Layouts.Padding>
          <Layouts.Padding padding="5" bottom="2" top="2">
            <MultiSelect
              name="statementEmails"
              label="Select Emails"
              options={emailsOptions}
              value={values.statementEmails}
              error={error}
              onSelectChange={setFieldValue}
            />
          </Layouts.Padding>
          <Divider />
          <Layouts.Padding padding="4" left="5" right="5">
            <Layouts.Flex justifyContent="space-between">
              <Button type="reset">Cancel</Button>
              <Button type="submit" variant="primary">
                Send Statements
              </Button>
            </Layouts.Flex>
          </Layouts.Padding>
        </Layouts.Flex>
      </FormContainerLayout>
    </Modal>
  );
};

export default SendStatementsModal;
