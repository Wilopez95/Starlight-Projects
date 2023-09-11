import React, { FC, useCallback, useMemo, useRef, useContext } from 'react';
import { Trans, useTranslation } from '../../../i18n';
import {
  Protected,
  showError,
  showSuccess,
  useOpenFormWithCloseConfirmation,
} from '@starlightpro/common';
import TextField from '@starlightpro/common/components/TextField';

import { createStyles, makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';

import {
  GetOrderQuery,
  OrderStatus,
  OrderType,
  useMakeOrderApprovedMutation,
  useMakeOrderCompletedMutation,
  useMakeOrderFinalizedMutation,
} from '../../../graphql/api';
import { closeSidePanel } from '../../../components/SidePanels';
import { EditOrder } from '../../YardOperationConsole/EditOrder';
import { closeModal, openModal } from '../../../components/Modals';
import YouHaveUnsavedChanges from '../../../components/Modal/YouHaveUnsavedChanges';
import { useUserIsAllowedToCompleteOrder } from '../../YardOperationConsole/hooks/useUserIsAllowedToCompleteOrder';
import { useUserIsAllowedToApproveOrder } from '../../YardOperationConsole/hooks/useUserIsAllowedToApproveOrder';
import { useUserIsAllowedToFinalizeOrder } from '../../YardOperationConsole/hooks/useUserIsAllowedToFinalizeOrder';
import { orderStatuses } from '../constant';
import { useUserIsAllowedToEditNonServiceOrder } from '../../YardOperationConsole/hooks/useUserIsAllowedToEditNonServiceOrder';
import { useUserIsAllowedToEditOrder } from '../../YardOperationConsole/hooks/useUserIsAllowedToEditOrder';
import { MaterialOrderContext } from '../../../utils/contextProviders/MaterialOrderProvider';

const useStyles = makeStyles(({ spacing, palette }) =>
  createStyles({
    root: {
      display: 'flex',
      width: '100%',
      justifyContent: 'space-between',
    },
    changeStatusConfirmation: {
      width: 510,
    },
    actionBtn: {
      '&:not(:last-child)': {
        marginRight: spacing(3),
      },
    },
    alert: {
      color: palette.error.main,
      backgroundColor: palette.common.white,
      border: `1px solid ${palette.error.main}`,
      '&:hover': {
        backgroundColor: palette.background.errorLight,
        border: `1px solid ${palette.error.main}`,
      },
      '&:focus': {
        border: `1px solid ${palette.error.main}`,
      },
      '&:not(:last-child)': {
        marginRight: spacing(3),
      },
    },
  }),
);

export interface CommercialCustomerOrderViewActionsProps {
  order: GetOrderQuery['order'];
  showNextStatusAction?: boolean;
  showPrevStatusAction?: boolean;
  formContainer?: React.ReactInstance | (() => React.ReactInstance | null) | null;
  onEditClose?(): void;
  onEditSubmitted?(): void;
}

export const CommercialCustomerOrderViewActions: FC<CommercialCustomerOrderViewActionsProps> = ({
  order,
  showNextStatusAction,
  showPrevStatusAction,
  formContainer,
  onEditClose,
  onEditSubmitted,
}) => {
  const classes = useStyles();
  const [t] = useTranslation();
  const commentRef = useRef<HTMLTextAreaElement>(null);

  const materialContext = useContext(MaterialOrderContext);
  const onCloseCallback = () => {
    materialContext.setMaterial(undefined);
  };

  const [openForm] = useOpenFormWithCloseConfirmation({
    closeOnSubmitted: false,
    container: formContainer,
    stacked: false,
  });
  const isAllowedCompleteOrder = useUserIsAllowedToCompleteOrder();
  const isAllowedApproveOrder = useUserIsAllowedToApproveOrder();
  const isAllowedFinalizeOrder = useUserIsAllowedToFinalizeOrder();
  const isAllowedToEditNonServiceOrder = useUserIsAllowedToEditNonServiceOrder();
  const isAllowedToEditOrder = useUserIsAllowedToEditOrder();
  const [makeOrderCompleted] = useMakeOrderCompletedMutation();
  const [makeOrderApproved, { loading: makeOrderApprovedLoading }] = useMakeOrderApprovedMutation();
  const [
    makeOrderFinalized,
    { loading: makeOrderFinalizedLoading },
  ] = useMakeOrderFinalizedMutation();
  const decreaseStatusPermissionMapping = {
    [OrderStatus.Finalized]:
      order.type === OrderType.NonService ? isAllowedToEditNonServiceOrder : isAllowedApproveOrder,
    [OrderStatus.Approved]:
      order.type === OrderType.NonService ? isAllowedToEditNonServiceOrder : isAllowedCompleteOrder,
  };
  const increaseStatusPermissionMapping = {
    [OrderStatus.Approved]:
      order.type === OrderType.NonService ? isAllowedToEditNonServiceOrder : isAllowedFinalizeOrder,
    [OrderStatus.Completed]:
      order.type === OrderType.NonService ? isAllowedToEditNonServiceOrder : isAllowedApproveOrder,
  };

  const confirmChangeStatusModal = useCallback(() => {
    if (!order) {
      return;
    }

    let title = <Trans>Unapprove Order</Trans>;

    if (order.status === OrderStatus.Finalized) {
      title = <Trans>Unfinalize Order</Trans>;
    }
    openModal({
      content: (
        <YouHaveUnsavedChanges
          title={title}
          classes={{ root: classes.changeStatusConfirmation }}
          description={
            <TextField
              inputRef={commentRef}
              label={<Trans>Comment</Trans>}
              multiline
              rows={4}
              fullWidth
            />
          }
          confirmLabel={<Trans>Cancel</Trans>}
          cancelLabel={<Trans>Confirm</Trans>}
          onCancel={async () => {
            try {
              closeModal();
              const options = {
                variables: { id: order.id, data: { reason: commentRef.current?.value } },
              };
              let newStatusTranslation = '';

              if (order.status === OrderStatus.Approved) {
                newStatusTranslation = t('unapproved');
                await makeOrderCompleted(options);
              } else if (order.status === OrderStatus.Finalized) {
                newStatusTranslation = t('unfinalized');
                await makeOrderApproved(options);
              }

              closeSidePanel();

              if (onEditClose) {
                onEditClose();
              }

              if (onEditSubmitted) {
                onEditSubmitted();
              }

              showSuccess(
                t('Order #{{orderId}} {{action}} successfully.', {
                  orderId: order.haulingOrderId,
                  action: newStatusTranslation,
                }),
              );
            } catch (e) {
              showError(e.message);
            }
          }}
          onConfirm={closeModal}
        />
      ),
      stacked: false,
    });
  }, [
    classes.changeStatusConfirmation,
    makeOrderApproved,
    makeOrderCompleted,
    onEditClose,
    onEditSubmitted,
    order,
    t,
  ]);

  const canEditOrder = useMemo<boolean>(
    () =>
      [OrderStatus.Completed, OrderStatus.Approved, OrderStatus.Finalized].includes(order.status) &&
      (order.type === OrderType.NonService ? isAllowedToEditNonServiceOrder : isAllowedToEditOrder),
    [isAllowedToEditNonServiceOrder, isAllowedToEditOrder, order.status, order.type],
  );

  return (
    <Box className={classes.root}>
      {showPrevStatusAction &&
        (order.status === OrderStatus.Approved || order.status === OrderStatus.Finalized) && (
          <Protected permissions="recycling:Order:update">
            <Button
              onClick={confirmChangeStatusModal}
              fullWidth
              className={classes.alert}
              color="secondary"
              variant="outlined"
              disabled={!decreaseStatusPermissionMapping[order.status]}
            >
              {order.status === OrderStatus.Approved && <Trans>Unapprove</Trans>}
              {order.status === OrderStatus.Finalized && <Trans>Unfinalize</Trans>}
            </Button>
          </Protected>
        )}
      {orderStatuses.includes(order.status) && (
        <Button
          fullWidth
          className={classes.actionBtn}
          color="primary"
          variant="outlined"
          onClick={() =>
            openForm({
              form: (
                <EditOrder
                  orderId={order.id}
                  readOnly={!canEditOrder}
                  noDrawer
                  onSubmitted={onEditSubmitted}
                />
              ),
              onClose: onCloseCallback,
            })
          }
        >
          <Trans>{canEditOrder ? 'Edit' : 'Order Details'}</Trans>
        </Button>
      )}
      {showNextStatusAction &&
        (order.status === OrderStatus.Completed || order.status === OrderStatus.Approved) && (
          <Protected permissions="recycling:Order:update">
            <Button
              onClick={async () => {
                try {
                  const options = { variables: { id: order.id } };
                  let newStatusTranslation = '';

                  if (order.status === OrderStatus.Completed) {
                    newStatusTranslation = t('approved');
                    await makeOrderApproved(options);
                  } else if (order.status === OrderStatus.Approved) {
                    newStatusTranslation = t('finalized');
                    await makeOrderFinalized(options);
                  }
                  closeSidePanel();

                  if (onEditClose) {
                    onEditClose();
                  }

                  if (onEditSubmitted) {
                    onEditSubmitted();
                  }

                  showSuccess(
                    t('Order #{{orderId}} {{action}} successfully.', {
                      orderId: order.haulingOrderId,
                      action: newStatusTranslation,
                    }),
                  );
                } catch (e) {
                  showError(e.message);
                }
              }}
              fullWidth
              className={classes.actionBtn}
              color="primary"
              variant="contained"
              disabled={
                !increaseStatusPermissionMapping[order.status] ||
                makeOrderApprovedLoading ||
                makeOrderFinalizedLoading
              }
            >
              {order.status === OrderStatus.Completed && <Trans>Approve</Trans>}
              {order.status === OrderStatus.Approved && <Trans>Finalize</Trans>}
            </Button>
          </Protected>
        )}
    </Box>
  );
};

export default CommercialCustomerOrderViewActions;
