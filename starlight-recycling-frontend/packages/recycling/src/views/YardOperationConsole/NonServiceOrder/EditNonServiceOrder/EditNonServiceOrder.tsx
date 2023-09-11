import React, { FC, useMemo } from 'react';
import arrayMutators from 'final-form-arrays';

import { schema } from '../schema';
import { validate } from '../../../../utils/forms';
import {
  GetOrderQuery,
  OrderStatus,
  OrderUpdateInput,
  PaymentMethodType,
  useMakeOrderApprovedMutation,
  useMakeOrderFinalizedMutation,
} from '../../../../graphql/api';
import { EditNonServiceOrderFooter } from './EditNonServiceOrderFooter';
import { NonServiceOrderSidebar } from './EditNonServiceOrderSidebar';
import { NonServiceOrderForm } from '../NewNonServiceOrder/NonServiceOrderForm';
import { setSubmitError } from '../../../../components/FinalForm/SidebarForm/SidebarForm';
import { EditOrderFormWrapperProps } from '../../components/EditOrderFormWrapper';
import { ReadOnlyOrderFormComponent } from '../../types';
import { getOrderUpdateInput } from '../../helpers/getOrderUpdateInput';
import { EditOrderForm } from '../../components/EditOrderForm';
import { useUserIsAllowedToEditNonServiceOrder } from '../../hooks/useUserIsAllowedToEditNonServiceOrder';
import { useCheckForCreditLimit } from '../../hooks/useCheckForCreditLimit';

interface Props extends ReadOnlyOrderFormComponent, Pick<EditOrderFormWrapperProps, 'noDrawer'> {
  order: GetOrderQuery['order'];
  updateOrder: (data: OrderUpdateInput) => Promise<void>;
  onSubmitted?: (data: OrderUpdateInput) => Promise<void>;
}

export const EditNonServiceOrder: FC<Props> = ({
  updateOrder,
  order,
  readOnly: readOnlyProp,
  noDrawer,
  onSubmitted,
}) => {
  const [makeOrderApproved] = useMakeOrderApprovedMutation();
  const [makeOrderFinalized] = useMakeOrderFinalizedMutation();
  const isAllowedToEditNonServiceOrder = useUserIsAllowedToEditNonServiceOrder();
  const checkForCreditLimit = useCheckForCreditLimit({ customerId: order.customer?.id });
  const initialValues = useMemo(
    () => ({
      id: order.id,
      status: order.status,
      type: order.type,
      customer: order.customer,
      customerJobSite: order.customerJobSite,
      jobSite: order.jobSite,
      project: order.project,
      PONumber: order.PONumber,
      note: order.note,
      billableItems: order.billableItems,
      priceGroupId: order.priceGroupId,
      paymentMethod: order.paymentMethod,
      creditCardId: order.creditCardId,
      amount: order.amount,
      isAch: order.isAch,
      checkNumber: order.checkNumber,
      taxDistricts: order.taxDistricts,
      grandTotal: order.grandTotal,
      beforeTaxesTotal: order.beforeTaxesTotal,
      taxTotal: order.taxTotal,
      initialOrderTotal: order.initialOrderTotal,
    }),
    [order],
  );
  const readOnly = useMemo(
    () =>
      readOnlyProp ||
      order.status === OrderStatus.Finalized ||
      order.status === OrderStatus.Invoiced,
    [order.status, readOnlyProp],
  );

  const handleSubmit = async (values: typeof initialValues) => {
    if (
      values.paymentMethod === PaymentMethodType.OnAccount &&
      values.grandTotal > order.grandTotal
    ) {
      await checkForCreditLimit(values.grandTotal, order.grandTotal ?? 0);
    }

    if (isAllowedToEditNonServiceOrder) {
      await updateOrder(getOrderUpdateInput(values));
    }

    if (values.status === OrderStatus.Approved) {
      await makeOrderApproved({ variables: { id: order.id } });
    } else if (values.status === OrderStatus.Finalized) {
      await makeOrderFinalized({ variables: { id: values.id } });
    }
  };

  return (
    <EditOrderForm<typeof initialValues>
      initialValues={initialValues}
      onSubmit={handleSubmit}
      onSubmitted={onSubmitted}
      validate={async (values) => validate(values, schema)}
      mutators={{ ...arrayMutators, setSubmitError }}
      noDrawer={noDrawer}
      formSidePanel={
        <NonServiceOrderSidebar
          customer={order.customer}
          orderId={order.haulingOrderId ?? order.id}
          readOnly={readOnly}
        />
      }
      footer={<EditNonServiceOrderFooter readOnly={readOnly} />}
    >
      <NonServiceOrderForm readOnly={readOnly} />
    </EditOrderForm>
  );
};
