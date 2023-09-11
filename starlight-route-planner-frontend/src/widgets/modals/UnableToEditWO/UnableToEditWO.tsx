import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layouts, Typography } from '@starlightpro/shared-components';

import { Divider } from '@root/common/TableTools';

import { Modal } from './styles';

interface IProps {
  ids: number | number[] | null;
  onContinue(): void;
}

const I18N_PATH = 'components.modals.RouteValidationModal.UnableToEditWO.Text.';
const I18N_PATH_ROOT = 'Text.';

export const UnableToEditWO: React.FC<IProps> = ({ ids, onContinue }) => {
  const { t } = useTranslation();

  return (
    <Modal isOpen={!!ids}>
      <Layouts.Padding top="4" bottom="4" left="5" right="5">
        <Typography color="default" variant="headerTwo">
          {t(`${I18N_PATH}Title`)}
        </Typography>
        <Layouts.Margin top="2" bottom="1">
          <Typography variant="bodyMedium">
            {Array.isArray(ids)
              ? t(`${I18N_PATH}SubTitleMultiple`)
              : t(`${I18N_PATH}SubTitleSingle`, { id: ids })}
          </Typography>
        </Layouts.Margin>
        {Array.isArray(ids) && (
          <Layouts.Margin top="2" bottom="1">
            {ids.map(id => (
              <Layouts.Margin key={id} top="1">
                <Typography variant="bodyMedium">{id}</Typography>
              </Layouts.Margin>
            ))}
          </Layouts.Margin>
        )}
      </Layouts.Padding>
      <Divider />
      <Layouts.Padding top="3" bottom="4" left="5" right="5">
        <Layouts.Flex justifyContent="flex-end">
          <Button onClick={onContinue} variant="primary">
            {t(`${I18N_PATH_ROOT}Ok`)}
          </Button>
        </Layouts.Flex>
      </Layouts.Padding>
    </Modal>
  );
};
