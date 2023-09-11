import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layouts } from '@starlightpro/shared-components';

import { Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { useIntl } from '@root/i18n/useIntl';
import { Loader } from '@root/modules/billing/Statements/components/StatementQuickView/components';

import { StyledModal } from './styles';
import { IBatchStatementSummaryModal } from './types';

const I18N_PATH = 'components.modals.BatchStatementSummaryModal.Text.';
const BatchStatementSummaryModal: React.FC<IBatchStatementSummaryModal> = ({
  onClose,
  isOpen,
  jobStatus,
  statementsTotal,
  loading,
}) => {
  const { t } = useTranslation();
  const { formatCurrency } = useIntl();

  return (
    <StyledModal isOpen={isOpen} onClose={onClose}>
      <Layouts.Margin margin="5" top="4" bottom="4">
        <Layouts.Margin bottom="2">
          <Typography variant="headerThree">{t(`${I18N_PATH}BatchStatementSummary`)}</Typography>
        </Layouts.Margin>
        {loading ? (
          <Layouts.Box height="170px">
            <Loader />
          </Layouts.Box>
        ) : (
          <>
            <Typography variant="bodyMedium">
              {t(`${I18N_PATH}StatementsSuccessfullyGenerated`)}.
            </Typography>
            <Typography variant="bodyMedium">{t(`${I18N_PATH}SomeDetails`)}:</Typography>
            <Layouts.Margin top="3" bottom="2">
              <Layouts.Flex justifyContent="space-between">
                <Typography color="secondary" variant="bodyMedium" shade="light">
                  {t(`${I18N_PATH}StatementsGenerated`)}:
                </Typography>
                <Typography variant="bodyLarge">{jobStatus?.count}</Typography>
              </Layouts.Flex>
            </Layouts.Margin>
            <Layouts.Margin bottom="2">
              <Layouts.Flex justifyContent="space-between">
                <Typography color="secondary" variant="bodyMedium" shade="light">
                  {t(`${I18N_PATH}StatementsFailedToGenerate`)}:
                </Typography>
                <Typography variant="bodyLarge">{jobStatus?.failedCount}</Typography>
              </Layouts.Flex>
            </Layouts.Margin>
            <Layouts.Margin bottom="2">
              <Layouts.Flex justifyContent="space-between">
                <Typography fontWeight="bold" color="secondary" variant="bodyMedium" shade="light">
                  {t(`${I18N_PATH}StatementsTotal`)}:
                </Typography>
                <Typography fontWeight="bold" variant="bodyLarge">
                  {formatCurrency(statementsTotal)}
                </Typography>
              </Layouts.Flex>
            </Layouts.Margin>
          </>
        )}
      </Layouts.Margin>

      <Divider />
      <Layouts.Flex justifyContent="flex-end">
        <Layouts.Margin margin="4">
          <Button variant="primary" onClick={onClose}>
            {t(`${I18N_PATH}Close`)}
          </Button>
        </Layouts.Margin>
      </Layouts.Flex>
    </StyledModal>
  );
};

export default BatchStatementSummaryModal;
