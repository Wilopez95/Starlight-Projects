import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Tooltip, Typography } from '@root/common';
import { useBoolean } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';

import SubscriptionPriceModal from '../SubscriptionPriceModal/SubscriptionPriceModal';

import { INextSubscriptionPrice } from './types';

const I18N_PATH =
  'pages.NewRequest.NewRequestForm.forms.Subscription.sections.Summary.Summary.Text.';

const NextSubscriptionPrice: React.FC<INextSubscriptionPrice> = ({
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
        title={t(`${I18N_PATH}NextSubscriptionPrice`)}
        total={proration?.summaryForSecondBillingPeriod ?? 0}
        prorations={proration?.prorationPeriods[1] ?? []}
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
                  text={t(`${I18N_PATH}NextSubscriptionPriceHint`)}
                  normalizeTypography={false}
                >
                  <Typography
                    variant="bodyMedium"
                    color="secondary"
                    shade="desaturated"
                    textAlign="right"
                    textDecoration="underline dotted"
                  >
                    {t(`${I18N_PATH}NextSubscriptionPrice`)}:
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
              {formatCurrency(proration?.summaryForSecondBillingPeriod)}
            </Typography>
          </Layouts.Box>
        </Layouts.Flex>
      </Layouts.Padding>
    </>
  );
};

export default observer(NextSubscriptionPrice);
