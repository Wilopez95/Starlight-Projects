import React, { useCallback, useEffect } from 'react';
import { Layouts, TextInputElement } from '@starlightpro/shared-components';
import { differenceInMinutes } from 'date-fns';
import { useFormikContext } from 'formik';
import { floor } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { FormInput, Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { useStores } from '@root/hooks';
import { IConfigurableOrder } from '@root/types';

import {
  LineItemsSection,
  ManifestItemsSection,
  ThresholdsSection,
} from '../../components/OrderQuickViewSections';
import { findThresholdIndex, getThresholdRateLimit } from '../../helpers/orderItemsData';

import { IRightPanel } from './types';
import { getWorkOrderDataComponent } from './WorkOrderData';

const RightPanel: React.FC<IRightPanel> = ({ onRateRequest }) => {
  const { lineItemStore } = useStores();
  const { values, handleChange, errors, setFieldValue } = useFormikContext<IConfigurableOrder>();

  useEffect(() => {
    lineItemStore.request({ businessLineId: values.businessLine.id.toString() });
  }, [lineItemStore, values.businessLine.id]);

  const handleChangeWeight = useCallback(
    (e: React.ChangeEvent<TextInputElement>) => {
      handleChange(e);

      const baseQuantity = Number(e.target.value);
      const thresholdIndex = findThresholdIndex(values, 'overweight');

      if (thresholdIndex === -1) {
        return;
      }
      const basePath = `thresholds[${thresholdIndex}].quantity`;

      if (!baseQuantity) {
        return setFieldValue(basePath, 0);
      }

      const threshold = values.thresholds[thresholdIndex];

      const thresholdRateLimit = getThresholdRateLimit(threshold);

      let newQuantity = floor(baseQuantity - thresholdRateLimit, 2);

      if (newQuantity < 0) {
        newQuantity = 0;
      }

      setFieldValue(basePath, newQuantity);
    },
    [handleChange, setFieldValue, values],
  );

  const handleChangeStartServiceDate = useCallback(
    (name: string, newDate: Date) => {
      setFieldValue(name, newDate);

      const thresholdIndex = findThresholdIndex(values, 'demurrage');

      if (!values.workOrder?.arriveOnSiteDate || thresholdIndex === -1) {
        return;
      }
      const basePath = `thresholds[${thresholdIndex}].quantity`;
      const threshold = values.thresholds[thresholdIndex];

      const thresholdRateLimit = getThresholdRateLimit(threshold);

      const difference = differenceInMinutes(newDate, values.workOrder.arriveOnSiteDate);

      let quantity = difference - thresholdRateLimit;

      if (quantity < 0) {
        quantity = 0;
      }

      setFieldValue(basePath, quantity);
    },
    [setFieldValue, values],
  );

  const WorkOrderDataComponent = getWorkOrderDataComponent({
    billableItemAction: values.billableService?.action,
    thirdPartyHaulerId: values.thirdPartyHauler?.id,
    businessLineType: values.businessLine.type,
  });

  return (
    <Layouts.Scroll rounded>
      <Layouts.Padding padding="3">
        <Layouts.Grid columns={4} columnGap="2" rowGap="0.5">
          {WorkOrderDataComponent ? (
            <WorkOrderDataComponent
              onChangeStartService={handleChangeStartServiceDate}
              onChangeWeight={handleChangeWeight}
            />
          ) : null}
          {values.workOrder?.driverNotes && values.billableService ? (
            <>
              <Layouts.Cell width={4}>
                <Typography color="secondary" as="label" shade="desaturated">
                  Driver Note
                </Typography>
                {values.workOrder.driverNotes.split('\n').map((note, index) => (
                  <Typography key={index}>{note}</Typography>
                ))}
              </Layouts.Cell>
              <Layouts.Cell width={4}>
                <Divider both />
              </Layouts.Cell>
            </>
          ) : null}

          <Layouts.Cell width={2}>
            <FormInput
              label={values.billableService ? 'Instructions for driver' : 'Instructions'}
              name="driverInstructions"
              value={values.driverInstructions ?? ''}
              error={errors.driverInstructions}
              onChange={handleChange}
              area
            />
          </Layouts.Cell>
          <Layouts.Cell width={2}>
            <FormInput
              label="Invoice Note"
              name="invoiceNotes"
              value={values.invoiceNotes ?? ''}
              onChange={handleChange}
              error={errors.invoiceNotes}
              area
            />
          </Layouts.Cell>
          <Layouts.Cell width={4}>
            <Divider bottom />
          </Layouts.Cell>
        </Layouts.Grid>
        <ManifestItemsSection onRateRequest={onRateRequest} />
        <ThresholdsSection />
        <LineItemsSection onRateRequest={onRateRequest} />
      </Layouts.Padding>
    </Layouts.Scroll>
  );
};

export default observer(RightPanel);
