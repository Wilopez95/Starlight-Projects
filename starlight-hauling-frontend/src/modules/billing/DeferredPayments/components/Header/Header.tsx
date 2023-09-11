import React, { useCallback } from 'react';
import { Button, Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { ChargePaymentModal } from '@root/modules/billing/components';

import { Protected, Switch, Typography } from '../../../../../common';
import { ConfirmModal } from '../../../../../components/modals';
import { formatCreditCard } from '../../../../../helpers';
import { useBoolean, useBusinessContext, useStores } from '../../../../../hooks';

const Header: React.FC<{ onRequest(): void }> = ({ onRequest }) => {
  const { paymentStore } = useStores();
  const [isOpenChargePaymentModal, openChargePaymentModal, closeChargePaymentModal] = useBoolean();
  const [isChargeConfirmModalOpen, openChargeConfirmModal, closeChargeConfirmModal] = useBoolean();
  const { businessUnitId } = useBusinessContext();

  const handleChangeFailedSwitch = useCallback(() => {
    paymentStore.toggleOnlyDeferredFailed();
    onRequest();
  }, [paymentStore, onRequest]);

  const handleChargeDeferredPayments = useCallback(async () => {
    const deferredPaymentIds = paymentStore.checkedPayments.map(({ id }) => id);

    await paymentStore.chargeDeferredPayments(deferredPaymentIds, +businessUnitId);
    closeChargePaymentModal();
  }, [paymentStore, businessUnitId, closeChargePaymentModal]);

  const checkedPaymentsNumber = paymentStore.checkedPayments.length;

  const handleSubmitMultiOrderModal = useCallback(() => {
    closeChargeConfirmModal();
    handleChargeDeferredPayments();
  }, [closeChargeConfirmModal, handleChargeDeferredPayments]);

  const handleChargeClick = useCallback(() => {
    const isMultipleOrders = paymentStore.checkedPayments.some(
      payment => payment.orders && payment.orders.length > 1,
    );

    if (isMultipleOrders) {
      openChargeConfirmModal();
    } else if (checkedPaymentsNumber === 1) {
      openChargePaymentModal();
    } else {
      handleChargeDeferredPayments();
    }
  }, [
    openChargeConfirmModal,
    openChargePaymentModal,
    handleChargeDeferredPayments,
    checkedPaymentsNumber,
    paymentStore.checkedPayments,
  ]);

  let creditCardLabel = '';

  if (paymentStore.checkedPayments[0]?.creditCard) {
    creditCardLabel = formatCreditCard(paymentStore.checkedPayments[0].creditCard);
  }

  return (
    <>
      <ChargePaymentModal
        isOpen={isOpenChargePaymentModal}
        onClose={closeChargePaymentModal}
        onSubmit={handleChargeDeferredPayments}
        paymentMethod="creditCard"
        creditCardLabel={creditCardLabel}
        paymentAmount={paymentStore.checkedPayments[0]?.amount}
      />
      <ConfirmModal
        isOpen={isChargeConfirmModalOpen}
        cancelButton="Cancel"
        submitButton="Save Changes"
        title="Multiple orders payment"
        subTitle="Changes in payment details will affect multiple orders. Are you sure?"
        onCancel={closeChargeConfirmModal}
        onSubmit={handleSubmitMultiOrderModal}
        nonDestructive
      />
      <Layouts.Margin bottom="2">
        <Layouts.Flex
          as={Layouts.Box}
          alignItems="center"
          justifyContent="space-between"
          minHeight="50px"
        >
          <Typography as="h1" variant="headerTwo">
            {checkedPaymentsNumber === 0
              ? 'Deferred payments'
              : `${checkedPaymentsNumber} Payment(s) selected`}
          </Typography>
          <Layouts.Flex alignItems="center">
            <Switch
              name="onlyFailed"
              onChange={handleChangeFailedSwitch}
              value={paymentStore.onlyDeferredFailed}
            >
              Show only failed
            </Switch>
            {checkedPaymentsNumber > 0 ? (
              <Protected permissions="billing:charge-deferred-payments:perform">
                <Layouts.Margin left="5">
                  <Button variant="primary" onClick={handleChargeClick}>
                    Charge Payments
                  </Button>
                </Layouts.Margin>
              </Protected>
            ) : null}
          </Layouts.Flex>
        </Layouts.Flex>
      </Layouts.Margin>
    </>
  );
};

export default observer(Header);
