import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts, Typography } from '@starlightpro/shared-components';

import { CancellationReason } from '@root/types';

import { EditIcon, EditLabelWrapper } from '../../styles';

interface IProps {
  cancellationReason: CancellationReason;
  cancellationComment?: string;
  onEdit?(): void;
}

const I18N_PATH = 'Text.';
const I18N_PATH_CANCELLATION_REASON = 'components.modals.CancellationReason.Text.';

export const CancellationReasonWarning: React.FC<IProps> = ({
  cancellationReason,
  cancellationComment,
  onEdit,
}) => {
  const { t } = useTranslation();

  return (
    <Layouts.Margin top="2">
      <Layouts.Box backgroundColor="alert" backgroundShade="desaturated">
        <Layouts.Padding padding="2">
          <Layouts.Box position="relative">
            <Layouts.Padding right="5">
              <Layouts.Padding right="1">
                <Typography variant="bodyMedium" fontWeight="bold" color="alert">
                  <>
                    {t(`${I18N_PATH}CancellationReason`)}
                    {' – '}
                    {t(`${I18N_PATH_CANCELLATION_REASON}${cancellationReason}`)}
                  </>
                </Typography>
              </Layouts.Padding>
            </Layouts.Padding>
            <EditLabelWrapper position="absolute" top="0" right="0" onClick={onEdit}>
              <Layouts.Flex alignItems="center">
                <EditIcon />
                <Layouts.Margin left="0.5">
                  <Typography color="information" as="span" variant="bodySmall">
                    {t(`${I18N_PATH}Edit`)}
                  </Typography>
                </Layouts.Margin>
              </Layouts.Flex>
            </EditLabelWrapper>
          </Layouts.Box>
          {cancellationComment && (
            <Layouts.Margin top="2">
              <Typography variant="bodyMedium" color="alert">
                {cancellationComment}
              </Typography>
            </Layouts.Margin>
          )}
        </Layouts.Padding>
      </Layouts.Box>
    </Layouts.Margin>
  );
};
