import React, { useCallback, useEffect } from 'react';
import { Button, Layouts } from '@starlightpro/shared-components';
import { useFormik } from 'formik';
import { isEmpty } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import {
  QuickViewConfirmModal,
  QuickViewContent,
  useQuickViewContext,
} from '@root/common/QuickView';
import { useIntl } from '@root/i18n/useIntl';

import { Typography } from '../../../../../common';
import { FormContainer } from '../../../../../components';
import { useCleanup, useScrollOnError, useStores } from '../../../../../hooks';
import { PaymentInvoicedStatus } from '../../../../../types';
import { NewPayout } from '../../types';

import { LeftPanel, PayoutForm } from './components';
import { generateValidationSchema, getValues } from './formikData';

const PayoutQuickViewContent: React.FC<{ showCustomer: boolean }> = ({ showCustomer }) => {
  const { customerStore, paymentStore, payoutStore, creditCardStore } = useStores();
  const { closeQuickView, forceCloseQuickView } = useQuickViewContext();
  const intl = useIntl();

  useCleanup(paymentStore);

  const selectedCustomer = customerStore.selectedEntity;
  const selectedPayout = payoutStore.selectedEntity;

  const payoutId = selectedPayout?.id;

  const formik = useFormik({
    validationSchema: generateValidationSchema(intl),
    validateOnChange: false,
    enableReinitialize: true,
    initialValues: getValues(selectedCustomer?.balance ?? 0, selectedPayout),
    onSubmit: () => {},
  });

  const { errors, validateForm, values, isValidating } = formik;

  useScrollOnError(errors, !isValidating);

  useEffect(() => {
    if (payoutId) {
      payoutStore.requestDetailed(+payoutId);
    } else if (selectedCustomer) {
      paymentStore.requestByCustomer(+selectedCustomer.id, {
        filters: {
          filterByInvoicedStatus: PaymentInvoicedStatus.UNAPPLIED,
        },
      });
    }
  }, [paymentStore, payoutId, payoutStore, selectedCustomer]);

  useEffect(() => {
    if (!selectedCustomer) {
      return;
    }

    if (!selectedPayout) {
      creditCardStore.requestRelevant({ customerId: selectedCustomer.id });
    } else if (selectedPayout.paymentType === 'creditCard' && selectedPayout?.creditCard?.id) {
      creditCardStore.requestById(selectedPayout.creditCard.id.toString());
    }
  }, [creditCardStore, selectedCustomer, selectedCustomer?.id, selectedPayout]);

  const handleCreate = useCallback(
    async (valuesData: NewPayout) => {
      const formErrors = await validateForm();

      if (!isEmpty(formErrors)) {
        return;
      }

      if (selectedCustomer) {
        await payoutStore.create(selectedCustomer.id, valuesData);

        payoutStore.cleanup();
        await payoutStore.requestByCustomer(+selectedCustomer.id);

        forceCloseQuickView();
      }
    },
    [validateForm, selectedCustomer, payoutStore, forceCloseQuickView],
  );

  return (
    <FormContainer formik={formik}>
      <QuickViewContent
        dirty={formik.dirty}
        confirmModal={<QuickViewConfirmModal />}
        leftPanelElement={<LeftPanel showCustomer={showCustomer} />}
        rightPanelElement={
          <Layouts.Scroll>
            <Layouts.Padding padding="3">
              <Typography variant="headerThree">Payout Details</Typography>
              <PayoutForm viewMode={!!selectedPayout} />
            </Layouts.Padding>
          </Layouts.Scroll>
        }
        actionsElement={
          <Layouts.Flex justifyContent="space-between">
            {selectedPayout ? (
              <>
                <div />
                <Button onClick={closeQuickView} variant="primary">
                  Close
                </Button>
              </>
            ) : (
              <>
                <Button onClick={closeQuickView} variant="converseAlert">
                  Cancel
                </Button>
                <Button
                  variant="success"
                  onClick={() => handleCreate(values)}
                  disabled={values.selectedPayments.length === 0}
                >
                  Create Payout
                </Button>
              </>
            )}
          </Layouts.Flex>
        }
      />
    </FormContainer>
  );
};

export default observer(PayoutQuickViewContent);
