import React from 'react';
import { Button, Layouts, Select } from '@starlightpro/shared-components';
import { useFormik } from 'formik';

import { FormInput, Modal, Typography } from '../../../../common';
import { IModal } from '../../../../common/Modal/types';
import { Divider } from '../../../../common/TableTools';
import { FormContainerLayout } from '../../../../components/forms/layout/FormContainer';
import { normalizeOptions } from '../../../../helpers';

import { IChargePaymentData } from './types';

import styles from './css/styles.scss';

const ChargePayment: React.FC<IChargePaymentData & IModal> = ({
  isOpen,
  onClose,
  onSubmit,
  paymentMethod,
  creditCardLabel,
  paymentAmount,
}) => {
  const formik = useFormik({
    initialValues: {
      paymentMethod,
      paymentAmount,
      creditCardLabel,
    },
    initialErrors: {},
    enableReinitialize: true,
    validateOnChange: false,
    onSubmit,
    onReset: onClose,
  });
  const { values, handleChange } = formik;

  const creditCardOptions = [
    {
      label: creditCardLabel,
      value: creditCardLabel,
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className={styles.modal}
      overlayClassName={styles.overlay}
    >
      <FormContainerLayout formik={formik}>
        <Layouts.Flex direction="column">
          <Layouts.Padding top="4" right="5" left="5">
            <Typography variant="headerThree">Charge Deferred Payment</Typography>
          </Layouts.Padding>
          <Layouts.Flex direction="column" flexGrow={1}>
            <Layouts.Padding left="5" right="5" top="2">
              <Layouts.Flex>
                <Layouts.Column>
                  <Select
                    name="paymentMethod"
                    disabled
                    label="Payment Method"
                    value={values.paymentMethod}
                    options={normalizeOptions([paymentMethod])}
                    onSelectChange={handleChange}
                  />
                  <Select
                    name="creditCard"
                    disabled
                    label="Credit Card"
                    value={values.creditCardLabel}
                    options={creditCardOptions}
                    onSelectChange={handleChange}
                  />
                </Layouts.Column>
                <Layouts.Column>
                  <FormInput
                    label="Amount, $"
                    type="number"
                    name="amount"
                    value={values.paymentAmount}
                    onChange={handleChange}
                    placeholder="0"
                    disabled
                  />
                </Layouts.Column>
              </Layouts.Flex>
            </Layouts.Padding>
          </Layouts.Flex>

          <Divider />
          <Layouts.Padding padding="4" left="5" right="5">
            <Layouts.Flex justifyContent="space-between">
              <Button type="reset">Cancel</Button>
              <Button type="submit" variant="primary">
                Charge Payment
              </Button>
            </Layouts.Flex>
          </Layouts.Padding>
        </Layouts.Flex>
      </FormContainerLayout>
    </Modal>
  );
};

export default ChargePayment;
