import React, { useCallback } from 'react';
import { Button, Layouts } from '@starlightpro/shared-components';
import { format } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import { useFormik } from 'formik';

import { dateFormatsEnUS } from '@root/i18n/format/date';
import { useIntl } from '@root/i18n/useIntl';

import { Modal, Typography } from '../../../../../common';
import { IModal } from '../../../../../common/Modal/types';
import { Divider } from '../../../../../common/TableTools';
import { FormContainer } from '../../../../../components';
import { useBusinessContext, useStores, useTimeZone } from '../../../../../hooks';

import styles from './css/styles.scss';

const RequestBankDeposit: React.FC<IModal> = ({ isOpen, onClose }) => {
  const { bankDepositStore } = useStores();
  const { businessUnitId } = useBusinessContext();
  const { formatDateTime } = useIntl();
  const { timeZone } = useTimeZone();

  const handleSubmit = useCallback(() => {
    bankDepositStore.lockBankDeposit({
      businessUnitId,
      date: new Date(),
      isCreate: true,
    });
    onClose?.();
  }, [bankDepositStore, businessUnitId, onClose]);

  const formik = useFormik({
    initialValues: { date: utcToZonedTime(format(new Date(), dateFormatsEnUS.ISO), timeZone) },
    validateOnChange: false,
    onSubmit: handleSubmit,
    onReset: onClose,
  });

  const { values, isSubmitting } = formik;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className={styles.modal}
      overlayClassName={styles.overlay}
    >
      <FormContainer formik={formik}>
        <Layouts.Flex direction="column">
          <Layouts.Padding top="3" right="5" left="5">
            <Typography variant="headerThree">New Bank Deposit</Typography>
          </Layouts.Padding>
          <Layouts.Flex direction="column" flexGrow={1} justifyContent="flex-end">
            <Layouts.Padding top="3" bottom="3" left="5" right="5">
              <Typography variant="bodyMedium">
                A bank deposit for{' '}
                <Typography as="span" fontWeight="bold">
                  {formatDateTime(values.date).date}
                </Typography>{' '}
                has already been created. Opening a new deposit will lock the previous one. Are you
                sure you would like to open a new{' '}
                <Typography as="span" fontWeight="bold">
                  Cash/Check
                </Typography>{' '}
                deposit?
              </Typography>
            </Layouts.Padding>
          </Layouts.Flex>
          <Divider />
          <Layouts.Padding padding="4" left="5" right="5">
            <Layouts.Flex justifyContent="space-between">
              <Button type="reset" disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} variant="primary">
                Open New Bank Deposit
              </Button>
            </Layouts.Flex>
          </Layouts.Padding>
        </Layouts.Flex>
      </FormContainer>
    </Modal>
  );
};

export default RequestBankDeposit;
