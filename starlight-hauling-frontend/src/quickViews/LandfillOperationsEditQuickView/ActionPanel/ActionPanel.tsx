import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layouts } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';

import { Loader, Typography, useQuickViewContext } from '@root/common';
import { useStores, useTimeZone } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { IEditableLandfillOperation } from '@root/types';

const I18N_PATH = 'components.forms.LandfillOperationEdit.ActionPanel.';

export const ActionPanel: React.FC = () => {
  const { landfillOperationStore } = useStores();
  const { closeQuickView } = useQuickViewContext();
  const { t } = useTranslation();

  const { dateFormat } = useIntl();
  const { format } = useTimeZone();

  const [loading, setLoading] = useState(false);
  const { values } = useFormikContext<IEditableLandfillOperation>();

  const handleSyncWithRecycling = useCallback(async () => {
    if (!values.recyclingFacility.recyclingTenantName) {
      return;
    }

    setLoading(true);

    await landfillOperationStore.sync({
      haulingOrderId: values.orderId,
      recyclingOrderId: values.recyclingOrderId,
      recyclingTenantName: values.recyclingFacility.recyclingTenantName,
      businessUnitId: values.recyclingFacility.businessUnitId,
    });

    setLoading(false);
  }, [
    landfillOperationStore,
    values.orderId,
    values.recyclingOrderId,
    values.recyclingFacility.recyclingTenantName,
    values.recyclingFacility.businessUnitId,
  ]);

  const { syncDate } = values;

  return (
    <Layouts.Flex justifyContent="space-between">
      <Layouts.Flex alignItems="center">
        <Layouts.Margin right="1.5">
          <Button onClick={handleSyncWithRecycling} disabled={loading}>
            {t(`${I18N_PATH}SyncWithRecycling`)}
          </Button>
        </Layouts.Margin>

        <Layouts.Margin left="1.5">
          {syncDate ? (
            <Layouts.Flex alignItems="center" justifyContent="center">
              <Layouts.Margin right="1">
                <Layouts.IconLayout>
                  <Loader active={loading} />
                </Layouts.IconLayout>
              </Layouts.Margin>
              <Typography color="secondary">
                {t(`${I18N_PATH}SyncDate`, {
                  date: format(syncDate, dateFormat.date),
                  time: format(syncDate, dateFormat.time),
                })}
              </Typography>
            </Layouts.Flex>
          ) : null}
        </Layouts.Margin>
      </Layouts.Flex>
      <Layouts.Flex>
        <Layouts.Margin right="1.5">
          <Button onClick={closeQuickView}>{t('Text.Cancel')}</Button>
        </Layouts.Margin>
        <Layouts.Margin left="1.5">
          <Button variant="primary" type="submit">
            {t('Text.SaveChanges')}
          </Button>
        </Layouts.Margin>
      </Layouts.Flex>
    </Layouts.Flex>
  );
};
