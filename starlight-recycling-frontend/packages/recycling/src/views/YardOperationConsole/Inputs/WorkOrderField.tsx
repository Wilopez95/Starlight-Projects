import React, { useCallback, useEffect, useMemo } from 'react';
import { Trans } from '../../../i18n';
import { useField, useForm } from 'react-final-form';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import HelpOutlineRoundedIcon from '@material-ui/icons/HelpOutlineRounded';

import {
  useGetOrdersByWoNumberAndCustomerLazyQuery,
  useGetOnTheWayWoNumbersLazyQuery,
  GetOrdersByWoNumberAndCustomerQuery,
  OrderStatus,
} from '../../../graphql/api';
import { ReadOnlyOrderFormComponent } from '../types';
import { getDumpInitialValues } from '../EditDumpOrder/getDumpInitialValues';
import { CustomerType } from '../../../graphql/api';
import { SearchField } from '../../../components/FinalForm/SearchField';
import { defaultCreateOrderFormValues } from '../FullTruckToScaleForm/defaultCreateOrderFormValues';
import { Tooltip } from '@starlightpro/common';

const useStyles = makeStyles(({ spacing, palette }) =>
  createStyles({
    tooltip: {
      maxWidth: '210px',
      backgroundColor: palette.text.primary,
    },
    tooltipArrow: {
      color: palette.text.primary,
    },
    tooltipIcon: {
      width: '2rem',
      height: '2rem',
      marginLeft: spacing(1),
      color: palette.grey[600],
      cursor: 'pointer',
      order: 1,
    },
    labelRoot: {
      display: 'flex',
      alignItems: 'center',
    },
  }),
);

const inputName = 'WONumber';

interface Props extends ReadOnlyOrderFormComponent {
  required?: boolean;
  onlyAllowSelfService?: boolean;
}

export const WorkOrderField: React.FC<Props> = ({
  readOnly,
  required,
  onlyAllowSelfService = false,
}) => {
  const {
    input: { value: customer },
  } = useField('customer', { subscription: { value: true } });
  const {
    input: { value: workOrderNumber },
  } = useField(inputName, { subscription: { value: true } });
  const form = useForm();
  const customerId = customer?.id;
  const customerType = customer?.type;
  const requireWONumber = required || customer?.workOrderRequired;
  const styles = useStyles();

  const initializeFormWithTruckOnWayOrder = useCallback(
    ({ ordersByWONumberAndCustomer }: GetOrdersByWoNumberAndCustomerQuery) => {
      const ordersToWByWONumber = (ordersByWONumberAndCustomer || []).filter(
        (order) => order.status === OrderStatus.OnTheWay,
      );
      const formInitValues = ordersToWByWONumber.length
        ? getDumpInitialValues(ordersToWByWONumber[0] as any)
        : { ...defaultCreateOrderFormValues, WONumber: workOrderNumber, customer };
      form.initialize(formInitValues);
    },
    [customer, form, workOrderNumber],
  );

  const [getOnTheWayWoNumbers, { data: onTheWayWONumbersData }] = useGetOnTheWayWoNumbersLazyQuery({
    fetchPolicy: 'no-cache',
  });
  const [getOrdersByWO] = useGetOrdersByWoNumberAndCustomerLazyQuery({
    fetchPolicy: 'no-cache',
    onCompleted: initializeFormWithTruckOnWayOrder,
  });

  const WOOptions = useMemo(() => {
    const onTheWayWONumbers = onTheWayWONumbersData?.onTheWayWONumbers || [];

    return onTheWayWONumbers.map(({ WONumber, customerBusinessName }) => ({
      label: `${WONumber} - ${customerBusinessName}`,
      value: WONumber,
    }));
  }, [onTheWayWONumbersData]);

  useEffect(() => {
    getOnTheWayWoNumbers({ variables: { customerId: customerId || null, onlyAllowSelfService } });
  }, [customerId, getOnTheWayWoNumbers, onlyAllowSelfService]);

  const onChange = useCallback(
    (WONumber) => {
      if (!WONumber) {
        form.initialize({ ...defaultCreateOrderFormValues });

        return;
      }
      getOrdersByWO({
        variables: { WONumber, customerId: customerId || null, onlyAllowSelfService },
      });
    },
    [getOrdersByWO, customerId, form, onlyAllowSelfService],
  );

  const WONumberLabel = (
    <>
      <Trans>WO#</Trans>
      <Tooltip
        title={<Trans>WO# Tooltip</Trans>}
        placement="top-start"
        classes={{
          tooltip: styles.tooltip,
          arrow: styles.tooltipArrow,
        }}
        arrow
      >
        <HelpOutlineRoundedIcon className={styles.tooltipIcon} />
      </Tooltip>
    </>
  );

  return (
    <SearchField
      name={inputName}
      label={WONumberLabel}
      allowSearchQueryAsValue
      options={WOOptions}
      onChange={onChange}
      disabled={readOnly || customerType === CustomerType.Walkup}
      classes={{
        labelRoot: styles.labelRoot,
      }}
      required={requireWONumber}
      freeSolo
    />
  );
};
