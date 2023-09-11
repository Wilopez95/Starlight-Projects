import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, IModal, Layouts, Typography } from '@starlightpro/shared-components';
import { upperFirst } from 'lodash-es';

import { Divider } from '@root/common/TableTools';
import { INoAssignedDriverTruckNotice } from '@root/types';

const I18N_PATH = 'components.modals.NoAssignedTruckDriver.';
const I18N_ROOT_PATH = 'Text.';

interface INoAssignedTruckDriverForm extends Omit<IModal, 'isOpen'>, INoAssignedDriverTruckNotice {}

export const NoAssignedTruckDriverForm: React.FC<INoAssignedTruckDriverForm> = ({
  onClose,
  type,
}) => {
  const { t } = useTranslation();

  return (
    <Layouts.Flex direction="column">
      <Layouts.Padding top="4" right="5" left="5">
        <Typography variant="headerThree">
          {t(`${I18N_PATH}Title`, { type: upperFirst(type) })}
        </Typography>
      </Layouts.Padding>
      <Layouts.Padding left="5" right="5" bottom="2" top="3">
        <Typography variant="bodyMedium">{t(`${I18N_PATH}SubTitle`, { type })}</Typography>
      </Layouts.Padding>
      <Divider />
      <Layouts.Padding top="3" bottom="3" left="3" right="3">
        <Layouts.Flex justifyContent="space-between">
          <Button onClick={onClose}>{t(`${I18N_ROOT_PATH}Cancel`)}</Button>
          <Button onClick={onClose} variant="primary">
            {t(`${I18N_ROOT_PATH}Ok`)}
          </Button>
        </Layouts.Flex>
      </Layouts.Padding>
    </Layouts.Flex>
  );
};
