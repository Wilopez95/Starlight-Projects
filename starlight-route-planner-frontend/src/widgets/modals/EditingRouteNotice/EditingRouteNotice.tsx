import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Button, Layouts, Typography } from '@starlightpro/shared-components';

import { Divider } from '@root/common/TableTools';
import { RouteType, SYSTEM_EDITING } from '@root/consts';

import { Modal } from './styles';
import { IEditingRouteNotice } from './types';

const I18N_PATH = 'components.modals.EditingRouteNotice.';
const I18N_PATH_ROOT = 'Text.';

export const EditingRouteNoticeModal: React.FC<IEditingRouteNotice> = ({
  isOpen,
  routeType,
  editingInfo,
  onClose,
}) => {
  const { t } = useTranslation();

  const { name: routeName, currentlyEditingBy: editingBy } = editingInfo ?? {};

  const routeTypeText =
    routeType === RouteType.MasterRoute
      ? t(`${I18N_PATH}MasterRoute`)
      : t(`${I18N_PATH}DailyRoute`);
  const editingByText = editingBy === SYSTEM_EDITING ? t(`${I18N_PATH}System`) : editingBy;

  return (
    <Modal isOpen={isOpen}>
      <Layouts.Flex direction="column">
        <Layouts.Padding top="3" right="5" left="5">
          <Typography variant="headerThree">{t(`${I18N_PATH}Title`)}</Typography>
        </Layouts.Padding>
        <Layouts.Padding left="5" right="5" bottom="3" top="3">
          <Typography variant="bodyMedium">
            <Trans i18nKey={`${I18N_PATH}Body`}>
              {{ routeName }} {{ routeTypeText }} is in the process of update by
              <Typography as="span" variant="headerFive">
                {{ editingByText }}
              </Typography>
              . Please try again when the process is completed.
            </Trans>
          </Typography>
        </Layouts.Padding>
        <Divider />
        <Layouts.Padding top="3" bottom="3" left="5" right="5">
          <Layouts.Flex justifyContent="flex-end">
            <Button variant="primary" onClick={onClose}>
              {t(`${I18N_PATH_ROOT}Ok`)}
            </Button>
          </Layouts.Flex>
        </Layouts.Padding>
      </Layouts.Flex>
    </Modal>
  );
};
