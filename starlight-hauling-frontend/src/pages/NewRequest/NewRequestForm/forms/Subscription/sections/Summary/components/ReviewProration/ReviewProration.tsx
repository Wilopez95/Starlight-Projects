import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Typography, ValidationMessageBlock } from '@root/common';

import ReviewProrationModal from '../ReviewProrationModal/ReviewProrationModal';

import { IReviewProration } from './types';

const I18N_PATH =
  'pages.NewRequest.NewRequestForm.forms.Subscription.sections.Summary.Summary.Text.';

const ReviewProration: React.FC<IReviewProration> = ({
  proration,
  subscriptionId,
  isReviewProrationModalOpen,
  onOpenReviewProrationModal,
  onCloseReviewProrationModal,
}) => {
  const { t } = useTranslation();

  return (
    <Layouts.Padding top="1">
      {proration ? (
        <ReviewProrationModal
          isOpen={isReviewProrationModalOpen}
          onClose={onCloseReviewProrationModal}
          proration={proration}
          subscriptionId={subscriptionId}
        />
      ) : null}
      <ValidationMessageBlock
        width="100%"
        color="primary"
        shade="desaturated"
        textColor="secondary"
        borderRadius="4px"
      >
        <Layouts.Flex justifyContent="space-between" alignItems="center">
          <Typography>{t(`${I18N_PATH}PleaseReviewProration`)}</Typography>
          <Button variant="primary" onClick={onOpenReviewProrationModal}>
            {t(`${I18N_PATH}ReviewProration`)}
          </Button>
        </Layouts.Flex>
      </ValidationMessageBlock>
    </Layouts.Padding>
  );
};

export default observer(ReviewProration);
