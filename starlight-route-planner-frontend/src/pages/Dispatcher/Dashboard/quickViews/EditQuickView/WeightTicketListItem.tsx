import React from 'react';
import { useTranslation } from 'react-i18next';
import { EditIcon, Layouts, Typography } from '@starlightpro/shared-components';

import { WarningPreview } from '@root/common';

import { DeleteIcon } from './styles';

const I18N_PATH = 'components.modals.WeightTicket.Validation.';

interface IProps {
  ticketNumber: string;
  renderWarning: boolean;
  handleDetailsClick(): void;
  handleEdit(): void;
  handleDelete(): void;
}

export const WeightTicketListItem: React.FC<IProps> = ({
  ticketNumber,
  renderWarning,
  handleDetailsClick,
  handleDelete,
  handleEdit,
}) => {
  const { t } = useTranslation();

  return (
    <Layouts.Margin>
      <Layouts.Flex alignItems="center">
        <Layouts.Margin right="1">
          <Typography color="information" onClick={handleDetailsClick}>
            {ticketNumber}
          </Typography>
        </Layouts.Margin>
        <Layouts.Margin right="1">
          <Typography onClick={handleEdit}>
            <EditIcon />
          </Typography>
        </Layouts.Margin>
        <Typography onClick={handleDelete}>
          <DeleteIcon />
        </Typography>
        {renderWarning && (
          <Layouts.Margin left="0.5">
            <WarningPreview text={t(`${I18N_PATH}TicketNumberMustBeUnique`)} />
          </Layouts.Margin>
        )}
      </Layouts.Flex>
    </Layouts.Margin>
  );
};
