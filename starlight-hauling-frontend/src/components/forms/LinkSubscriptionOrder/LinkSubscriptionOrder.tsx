import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layouts } from '@starlightpro/shared-components';
import { useFormik } from 'formik';
import { noop } from 'lodash-es';

import { RadioButton, Typography } from '@root/common';
import {
  Divider,
  Table,
  TableActionCell,
  TableBody,
  TableCell,
  TableRow,
  TableTools,
} from '@root/common/TableTools';
import { useAggregatedFormatFrequency } from '@root/common/TableTools/TableData/helpers/useFormatFrequency';
import FormContainer from '@root/components/FormContainer/FormContainer';
import { ClientRequestType } from '@root/consts';
import { useIntl } from '@root/i18n/useIntl';
import configurationStyle from '@root/pages/SystemConfiguration/css/styles.scss';

import { getValues, validationSchema } from './formikData';
import { ILinkSubscriptionOrderData, ILinkSubscriptionOrderForm, LinkRequestType } from './types';

const I18N_PATH = `components.forms.LinkSubscriptionOrder.Form.`;
const I18N_ACTIONS_PATH = `components.forms.LinkSubscriptionOrder.Actions.`;

const LinkSubscriptionOrderForm: React.FC<ILinkSubscriptionOrderForm> = ({
  title,
  subscriptions,
  onSubmit,
  onClose,
}) => {
  const { t } = useTranslation();

  const formik = useFormik<ILinkSubscriptionOrderData>({
    initialValues: getValues(),
    onSubmit,
    onReset: onClose,
    validationSchema,
    validateOnChange: false,
  });

  const { values, setFieldValue } = formik;

  const { formatCurrency, formatDateTime } = useIntl();

  const aggregatedFormatFrequency = useAggregatedFormatFrequency();

  const handleRequestTypeChange = useCallback(
    (requestType: LinkRequestType) => {
      setFieldValue('requestType', requestType);
    },
    [setFieldValue],
  );

  const handleSubscriptionIdChange = useCallback(
    (id: number) => {
      setFieldValue('subscriptionId', id);
    },
    [setFieldValue],
  );

  const orderTypeText = useMemo(() => {
    if (values.requestType === ClientRequestType.SubscriptionOrder) {
      return t(`${I18N_PATH}ChooseOrder`);
    }

    return t(`${I18N_PATH}ChooseNonService`);
  }, [t, values.requestType]);

  return (
    <FormContainer formik={formik}>
      <Layouts.Padding padding="3" bottom="0">
        <Typography variant="headerThree">{title}</Typography>
      </Layouts.Padding>

      <Layouts.Padding padding="3" top="2" bottom="2">
        <Layouts.Flex direction="row">
          <Layouts.Margin right="2">
            <RadioButton
              name="requestType"
              value={values.requestType === ClientRequestType.SubscriptionOrder}
              onChange={() => handleRequestTypeChange(ClientRequestType.SubscriptionOrder)}
            >
              {t(`${I18N_PATH}Order`)}
            </RadioButton>
          </Layouts.Margin>
          <Layouts.Margin right="2">
            <RadioButton
              name="requestType"
              value={values.requestType === ClientRequestType.SubscriptionNonService}
              onChange={() => handleRequestTypeChange(ClientRequestType.SubscriptionNonService)}
            >
              {t(`${I18N_PATH}NonService`)}
            </RadioButton>
          </Layouts.Margin>
        </Layouts.Flex>
      </Layouts.Padding>

      <Layouts.Padding left="3" right="3">
        <Typography variant="bodyMedium">{orderTypeText}</Typography>
        <Divider top />
      </Layouts.Padding>

      <Layouts.Box height="300px">
        <TableTools.ScrollContainer>
          <Table>
            <TableTools.Header>
              <TableTools.HeaderCell />
              <TableTools.HeaderCell>Start Date</TableTools.HeaderCell>
              <TableTools.HeaderCell>#</TableTools.HeaderCell>
              <TableTools.HeaderCell>Line of Business</TableTools.HeaderCell>
              <TableTools.HeaderCell>Service Frequency</TableTools.HeaderCell>
              <TableTools.HeaderCell>Price Per Billing Cycle, $</TableTools.HeaderCell>
              <TableTools.HeaderCell>Billing Cycle</TableTools.HeaderCell>
            </TableTools.Header>
            <TableBody cells={8} loading={false} noResult={!subscriptions.length}>
              {subscriptions?.map(subscription => (
                <TableRow
                  key={subscription.id}
                  className={configurationStyle.customRow}
                  onClick={() => handleSubscriptionIdChange(subscription.id)}
                >
                  <TableActionCell
                    action="radio"
                    titleClassName={configurationStyle.tableCellTitle}
                    name="subscriptionId"
                    value={subscription.id === values.subscriptionId}
                    onChange={noop}
                  />
                  <TableCell titleClassName={configurationStyle.tableCellTitle}>
                    {subscription.startDate ? formatDateTime(subscription.startDate).date : '-'}
                  </TableCell>
                  <TableCell titleClassName={configurationStyle.tableCellTitle}>
                    <Typography color="information">{subscription.id}</Typography>
                  </TableCell>
                  <TableCell titleClassName={configurationStyle.tableCellTitle}>
                    <Typography>{subscription.businessLine.name}</Typography>
                  </TableCell>
                  <TableCell titleClassName={configurationStyle.tableCellTitle}>
                    <Typography>
                      {aggregatedFormatFrequency(subscription.serviceFrequencyAggregated)}
                    </Typography>
                  </TableCell>
                  <TableCell titleClassName={configurationStyle.tableCellTitle}>
                    <Typography fontWeight="bold">
                      {formatCurrency(subscription.grandTotal)}
                    </Typography>
                  </TableCell>
                  <TableCell titleClassName={configurationStyle.tableCellTitle}>
                    <Typography>{subscription.customer.billingCycle}</Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableTools.ScrollContainer>
        <Layouts.Padding padding="2" left="3" right="3">
          <Layouts.Flex justifyContent="space-between">
            <Button type="reset" onClick={() => onClose()}>
              {t(`${I18N_ACTIONS_PATH}Cancel`)}
            </Button>
            <Button
              type="submit"
              variant="primary"
              onClick={() => onSubmit(values)}
              disabled={!subscriptions.length}
            >
              {t(`${I18N_ACTIONS_PATH}Continue`)}
            </Button>
          </Layouts.Flex>
        </Layouts.Padding>
      </Layouts.Box>
    </FormContainer>
  );
};

export default LinkSubscriptionOrderForm;
