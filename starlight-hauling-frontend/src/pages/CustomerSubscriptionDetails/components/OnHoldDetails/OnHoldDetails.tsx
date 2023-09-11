import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';

import { Banner, Typography } from '@root/common';
import { useIntl } from '@root/i18n/useIntl';

import { type IOnHoldDetails } from './types';

const fallback = '-';
const I18N_PATH = `pages.CustomerSubscriptionDetails.components.OnHoldDetails.Text.`;

const OnHoldDetails: React.FC<IOnHoldDetails> = ({ setOnHoldModal, ...reasonDetail }) => {
  const { formatDateTime } = useIntl();
  const { t } = useTranslation();

  const handleEditOnHold = useCallback(() => {
    setOnHoldModal({ updateOnly: true, isOnHoldModalOpen: true });
  }, [setOnHoldModal]);

  return (
    <Banner showIcon={false} onEdit={handleEditOnHold} color="primary">
      <Layouts.Column>
        <Typography color="secondary" shade="desaturated">
          {t(`${I18N_PATH}OnHoldReason`)}
        </Typography>
        <Typography>
          {reasonDetail.reason}
          {reasonDetail.reasonDescription ? ` (${reasonDetail.reasonDescription})` : null}
        </Typography>
      </Layouts.Column>
      <Layouts.Column>
        <Typography color="secondary" shade="desaturated">
          {t(`${I18N_PATH}OnHoldUntil`)}
        </Typography>
        <Typography>
          {reasonDetail.holdSubscriptionUntil
            ? formatDateTime(reasonDetail.holdSubscriptionUntil).date
            : fallback}
        </Typography>
      </Layouts.Column>
    </Banner>
  );
};

export default OnHoldDetails;
