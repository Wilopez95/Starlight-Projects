import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Tooltip, Typography } from '@root/common';
import { useBoolean } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';

import SubscriptionPriceModal from '../SubscriptionPriceModal/SubscriptionPriceModal';

import { ISubscriptionPrice } from './types';

const I18N_PATH =
  'pages.NewRequest.NewRequestForm.forms.Subscription.sections.Summary.Summary.Text.';

const SubscriptionPrice: React.FC<ISubscriptionPrice> = ({
  proration,
  billableServices,
  billableLineItems,
}) => {
  const { formatCurrency } = useIntl();
  const [isModalOpen, openModal, closeModal] = useBoolean();

  const { t } = useTranslation();

  return (
    <>
      <SubscriptionPriceModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={t(`${I18N_PATH}CurrentSubscriptionPrice`)}
        total={proration?.summaryForFirstBillingPeriod ?? 0}
        prorations={proration?.prorationPeriods[0] ?? []}
        billableServices={billableServices}
        billableLineItems={billableLineItems}
      />
      <Layouts.Padding top="1" bottom="1">
        <Layouts.Flex>
          <Layouts.Margin right="4">
            <Typography textAlign="right">
              <Layouts.Box width="180px">
                <Tooltip
                  position="top"
                  text={t(`${I18N_PATH}CurrentSubscriptionPriceHint`)}
                  normalizeTypography={false}
                >
                  <Typography
                    variant="bodyMedium"
                    color="secondary"
                    shade="desaturated"
                    textAlign="right"
                    textDecoration="underline dotted"
                  >
                    {t(`${I18N_PATH}CurrentSubscriptionPrice`)}:
                  </Typography>
                </Tooltip>
              </Layouts.Box>
            </Typography>
          </Layouts.Margin>
          <Layouts.Box width="100px">
            <Typography
              variant="bodyMedium"
              color="information"
              textAlign="right"
              onClick={openModal}
            >
              {formatCurrency(proration?.summaryForFirstBillingPeriod)}
            </Typography>
          </Layouts.Box>
        </Layouts.Flex>
      </Layouts.Padding>
    </>
  );
};

export default observer(SubscriptionPrice);
