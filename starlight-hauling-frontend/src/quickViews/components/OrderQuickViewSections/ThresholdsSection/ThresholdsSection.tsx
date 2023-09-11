import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts, Select, TextInputElement } from '@starlightpro/shared-components';
import { addMinutes } from 'date-fns';
import { FieldArray, getIn, useFormikContext } from 'formik';
import { floor, startCase } from 'lodash-es';

import { FormInput, Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { normalizeOptions } from '@root/helpers';
import { useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { IConfigurableOrder, ThresholdType } from '@root/types';

import {
  findThreshold,
  getThresholdHandlerConfigs,
  getThresholdRateLimit,
} from '../../../helpers/orderItemsData';
import { DeleteButton } from '../DeleteButton/DeleteButton';

const I18N_PATH = 'quickViews.OrderDetailsView.sections.Services.Text.';

export const ThresholdsSection: React.FC = () => {
  const { orderStore } = useStores();
  const { values, errors, handleChange, setFieldValue } = useFormikContext<IConfigurableOrder>();
  const { currencySymbol, formatCurrency } = useIntl();
  const { t } = useTranslation();

  const handleChangeThreshold = useCallback(
    (e: React.ChangeEvent<TextInputElement>, type: ThresholdType) => {
      handleChange(e);
      const baseQuantity = Number(e.target.value);

      const { path } = getThresholdHandlerConfigs(orderStore.selectedEntity!, type);

      const threshold = findThreshold(values, type)!;
      const thresholdRateLimit = getThresholdRateLimit(threshold);

      if (!baseQuantity && type !== 'usageDays') {
        return setFieldValue(path, thresholdRateLimit);
      }

      let newValue;

      switch (type) {
        case 'overweight': {
          newValue = floor(baseQuantity + thresholdRateLimit, 2);

          if (newValue <= 0) {
            newValue = thresholdRateLimit;
          }

          break;
        }

        case 'demurrage': {
          const currentData = values.workOrder?.arriveOnSiteDate;

          if (!currentData) {
            return;
          }
          const amountMinutes = thresholdRateLimit + baseQuantity;

          newValue = addMinutes(currentData, amountMinutes);

          break;
        }
        case 'usageDays': {
          break;
        }
        default:
      }

      setFieldValue(path, newValue);
    },
    [handleChange, orderStore.selectedEntity, setFieldValue, values],
  );

  if (!values.thresholds?.length) {
    return null;
  }

  return (
    <Layouts.Grid columns="20px repeat(6, 1fr)" columnGap="2">
      <Layouts.Cell width={7}>
        <Layouts.Margin bottom="1.5" top="1">
          <Typography variant="headerFour"> {t(`${I18N_PATH}Thresholds`)}</Typography>
        </Layouts.Margin>
      </Layouts.Cell>

      <FieldArray name="thresholds">
        {({ remove }) =>
          values.thresholds?.map((threshold, index) => (
            <React.Fragment key={index}>
              <DeleteButton onClick={() => remove(index)} disabled={!values.unlockOverrides} />
              <Layouts.Cell width={3}>
                <Select
                  label={t(`${I18N_PATH}Item`)}
                  name={`thresholds[${index}].threshold.description`}
                  value={threshold.threshold.description}
                  onSelectChange={setFieldValue}
                  options={normalizeOptions([threshold.threshold.description])}
                  disabled
                />
              </Layouts.Cell>
              <FormInput
                label={t(`${I18N_PATH}QTY`)}
                onChange={e => handleChangeThreshold(e, threshold.threshold.type)}
                name={`thresholds[${index}].quantity`}
                ariaLabel="Quantity"
                value={threshold.quantity}
                error={getIn(errors, `thresholds[${index}].quantity`)}
                type="number"
                disabled={!values.unlockOverrides}
              />
              <FormInput
                label={t(`${I18N_PATH}Price`)}
                onChange={handleChange}
                name={`thresholds[${index}].price`}
                ariaLabel="Price"
                value={threshold.price}
                error={getIn(errors, `thresholds[${index}].price`)}
                type="number"
                disabled={!values.unlockOverrides}
              />

              <FormInput
                label={t(`${I18N_PATH}Total`, { currencySymbol })}
                onChange={handleChange}
                name={`thresholds[${index}].total`}
                ariaLabel="Total"
                value={formatCurrency(+(threshold.price ?? 0) * threshold.quantity)}
                disabled
              />

              <Layouts.Cell width={3} left={2}>
                <FormInput
                  label={t(`${I18N_PATH}Material`)}
                  onChange={handleChange}
                  name={`thresholds[${index}].materialId`}
                  type="number"
                  ariaLabel="Material"
                  disabled
                />
              </Layouts.Cell>
              <FormInput
                label={t(`${I18N_PATH}Unit`)}
                name={`thresholds[${index}].threshold.unit`}
                value={startCase(threshold.threshold.unit)}
                onChange={handleChange}
                disabled
              />

              <Layouts.Cell width={7}>
                <Divider bottom />
              </Layouts.Cell>
            </React.Fragment>
          ))
        }
      </FieldArray>
    </Layouts.Grid>
  );
};
