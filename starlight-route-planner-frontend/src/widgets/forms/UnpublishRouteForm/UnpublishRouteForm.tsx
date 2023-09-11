import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Button, Layouts, Typography } from '@starlightpro/shared-components';

import { Divider } from '@root/common/TableTools';
import { useIntl } from '@root/i18n/useIntl';

import { IUnpublishRouteForm } from './types';

const I18N_PATH = 'components.modals.UnPublishRoute.';
const I18N_ROOT_PATH = 'Text.';

export const UnpublishRouteForm: React.FC<Omit<IUnpublishRouteForm, 'isOpen'>> = ({
  unpublishInfo,
  onClose,
  onUnpublish,
}) => {
  const { formatDateTime } = useIntl();
  const { t } = useTranslation();

  if (!unpublishInfo) {
    return null;
  }

  const { dailyRoutesToDeleteCount, editedDailyRoutes } = unpublishInfo;

  return (
    <Layouts.Flex direction="column">
      <Layouts.Padding top="4" right="5" left="5">
        <Typography variant="headerThree" color="alert">
          {t(`${I18N_PATH}Title`)} {unpublishInfo.name}
        </Typography>
      </Layouts.Padding>
      <Layouts.Padding left="5" right="5" bottom="2" top="3">
        <Typography variant="bodyMedium">
          <Trans i18nKey={`${I18N_PATH}WillDeleted`}>
            Please, be informed that{' '}
            <Typography as="span" variant="headerFive">
              {{ dailyRoutesToDeleteCount }} daily routes
            </Typography>{' '}
            generated from this master route will be deleted.
          </Trans>
          {editedDailyRoutes?.length ? (
            <Layouts.Padding top="4">
              <Layouts.Margin bottom="2">
                <Trans i18nKey={`${I18N_PATH}ManuallyEdited`}>
                  <Typography as="span" variant="headerFive">
                    {{ editedDailyRoutesCount: editedDailyRoutes.length }} Daily Routes
                  </Typography>{' '}
                  have been manually edited:
                </Trans>
              </Layouts.Margin>
              <Layouts.Scroll maxHeight={200}>
                {editedDailyRoutes.map(({ id, name, serviceDate, workOrders }) => (
                  <Layouts.Padding bottom="2" key={id}>
                    <Layouts.Flex>
                      <Layouts.Box maxWidth="150px">
                        <Typography ellipsis>{name} </Typography>
                      </Layouts.Box>
                      <Typography as="span" color="secondary" shade="light" variant="bodyMedium">
                        • {workOrders.length || 0} stops
                      </Typography>

                      <Layouts.Flex justifyContent="center" flexGrow={1}>
                        <Typography variant="bodyMedium">
                          {formatDateTime(new Date(serviceDate)).date}
                        </Typography>
                      </Layouts.Flex>
                    </Layouts.Flex>
                  </Layouts.Padding>
                ))}
              </Layouts.Scroll>
            </Layouts.Padding>
          ) : null}
        </Typography>
      </Layouts.Padding>
      <Divider />
      <Layouts.Padding top="3" bottom="3" left="3" right="3">
        <Layouts.Flex justifyContent="space-between">
          <Button onClick={onClose}>{t(`${I18N_ROOT_PATH}Cancel`)}</Button>
          <Button variant="alert" onClick={onUnpublish}>
            {t(`${I18N_PATH}Proceed`)}
          </Button>
        </Layouts.Flex>
      </Layouts.Padding>
    </Layouts.Flex>
  );
};
