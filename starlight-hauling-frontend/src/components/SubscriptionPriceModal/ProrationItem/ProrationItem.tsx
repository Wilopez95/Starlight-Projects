import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Typography } from '@root/common';
import { ProrationTypeEnum } from '@root/consts';
import { useIntl } from '@root/i18n/useIntl';

import { IProrationItemComponent } from './types';

const I18N_PATH =
  'pages.NewRequest.NewRequestForm.forms.Subscription.sections.Summary.Summary.Text.';

const fallback = <Layouts.Padding right="1.5">-</Layouts.Padding>;

const ProrationItem: React.FC<IProrationItemComponent> = ({
  name,
  totalDay,
  totalPrice,
  usageDay,
  proratedTotal,
  prorationType,
  showLabels = false,
}) => {
  const { formatCurrency } = useIntl();

  const { t } = useTranslation();

  // TODO: make cell headers multi-line or use ellipsis because labels can have different lengths in different translations

  return (
    <Layouts.Flex justifyContent="space-between">
      <Layouts.Box width="210px">
        <Layouts.Margin top={showLabels ? '3' : '1'}>
          <Typography color="secondary" variant="bodyMedium">
            {name}
          </Typography>
        </Layouts.Margin>
      </Layouts.Box>

      <Layouts.Box width="70px">
        {showLabels ? (
          <Layouts.Padding right="1">
            <Typography color="secondary" shade="desaturated" variant="bodySmall" textAlign="right">
              {t(`${I18N_PATH}TotalPrice`)}
            </Typography>
          </Layouts.Padding>
        ) : null}

        <Layouts.Margin top="1">
          <Typography variant="bodyMedium" textAlign="right">
            {totalPrice !== null ? `${formatCurrency(totalPrice)} ÷` : fallback}
          </Typography>
        </Layouts.Margin>
      </Layouts.Box>
      <Layouts.Box width="100px">
        {showLabels ? (
          <Layouts.Padding right="1.5">
            <Typography color="secondary" shade="desaturated" variant="bodySmall" textAlign="right">
              {prorationType === ProrationTypeEnum.usageDays
                ? t(`${I18N_PATH}TotalDays`)
                : t(`${I18N_PATH}TotalServices`)}
            </Typography>
          </Layouts.Padding>
        ) : null}

        <Layouts.Margin top="1">
          <Typography variant="bodyMedium" textAlign="right">
            {totalDay ? `${totalDay} ×` : fallback}
          </Typography>
        </Layouts.Margin>
      </Layouts.Box>
      <Layouts.Box width="110px">
        {showLabels ? (
          <Layouts.Padding right="1.5">
            <Typography color="secondary" shade="desaturated" variant="bodySmall" textAlign="right">
              {prorationType === ProrationTypeEnum.usageDays
                ? t(`${I18N_PATH}UsageDays`)
                : t(`${I18N_PATH}ProvidedServices`)}
            </Typography>
          </Layouts.Padding>
        ) : null}

        <Layouts.Margin top="1">
          <Typography variant="bodyMedium" textAlign="right">
            {usageDay !== null ? `${usageDay} =` : fallback}
          </Typography>
        </Layouts.Margin>
      </Layouts.Box>
      <Layouts.Box width="80px">
        {showLabels ? (
          <Typography color="secondary" shade="desaturated" variant="bodySmall" textAlign="right">
            {t(`${I18N_PATH}ProrationTotal`)}
          </Typography>
        ) : null}

        <Layouts.Margin top="1">
          <Typography variant="bodyMedium" textAlign="right">
            {proratedTotal !== null ? formatCurrency(proratedTotal) : fallback}
          </Typography>
        </Layouts.Margin>
      </Layouts.Box>
    </Layouts.Flex>
  );
};

export default observer(ProrationItem);
