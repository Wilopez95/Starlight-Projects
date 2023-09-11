import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { FieldArray } from 'formik';
import { observer } from 'mobx-react-lite';

import { Typography } from '@root/common';
import { useServiceItemName } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';

import LineItemProration from './LineItemProration/LineItemProration';
import ProrationItem from './ProrationItem/ProrationItem';
import { IServiceItemComponent } from './types';

const I18N_PATH =
  'pages.NewRequest.NewRequestForm.forms.Subscription.sections.Summary.Summary.Text.';

const ServiceItem: React.FC<IServiceItemComponent> = ({
  index,
  isProrated,
  billableServiceId,
  lineItems,
  nextBillingPeriodFrom,
  nextBillingPeriodTo,
  ...serviceItem
}) => {
  const serviceItemName = useServiceItemName(billableServiceId) ?? '-';
  const { t } = useTranslation();
  const { formatDateTime } = useIntl();

  return (
    <Layouts.Padding top="1" bottom="1">
      <Layouts.Margin bottom="0.5">
        <Layouts.Box backgroundColor="grey">
          <Layouts.Padding padding="0.5" left="1" right="1">
            <Typography
              variant="bodySmall"
              color="secondary"
              shade="light"
              fontWeight="medium"
              textTransform="uppercase"
            >
              <Layouts.Padding as="span" right="0.5">
                {t(`${I18N_PATH}BillingPeriod`)}:
              </Layouts.Padding>
              {formatDateTime(nextBillingPeriodFrom).date}
              <Layouts.Padding as="span" left="0.5" right="0.5">
                -
              </Layouts.Padding>
              {formatDateTime(nextBillingPeriodTo).date}
            </Typography>
          </Layouts.Padding>
        </Layouts.Box>
      </Layouts.Margin>
      <Layouts.Box backgroundColor="grey" backgroundShade="desaturated">
        <Layouts.Padding padding="0.5" left="1" right="1">
          <Typography
            variant="bodySmall"
            color="secondary"
            shade="light"
            fontWeight="medium"
            textTransform="uppercase"
          >
            {t(`${I18N_PATH}Service`)} {index + 1}
          </Typography>
        </Layouts.Padding>
      </Layouts.Box>
      {isProrated ? (
        <ProrationItem
          name={`serviceItems[${index}].prorationEffectivePrice`}
          label={serviceItemName}
          {...serviceItem}
        />
      ) : null}
      <FieldArray name={`serviceItems[${index}].lineItems`}>
        {() =>
          lineItems.map((lineItem, lineItemIndex) => (
            <LineItemProration
              key={lineItem.id}
              name={`serviceItems[${index}].lineItems[${lineItemIndex}].prorationEffectivePrice`}
              {...lineItem}
            />
          ))
        }
      </FieldArray>
    </Layouts.Padding>
  );
};

export default observer(ServiceItem);
