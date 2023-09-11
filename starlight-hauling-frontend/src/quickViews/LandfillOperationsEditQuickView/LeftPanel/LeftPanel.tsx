import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router';
import { Layouts } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';

import { Typography } from '@root/common';
import { LeftPanelTools } from '@root/common/QuickView';
import { OrderStatusRoutes, Paths } from '@root/consts';
import { addressFormat, pathToUrl } from '@root/helpers';
import { useBusinessContext, useStores } from '@root/hooks';
import { IEditableLandfillOperation } from '@root/types';

const I18N_PATH = 'components.forms.LandfillOperationEdit.LeftPanel.';

export const LeftPanel: React.FC = () => {
  const { orderStore } = useStores();
  const { values } = useFormikContext<IEditableLandfillOperation>();
  const { t } = useTranslation();
  const { businessUnitId } = useBusinessContext();
  const history = useHistory();

  const handleOrderIdClick = useCallback(() => {
    orderStore.requestById(values.orderId);
    history.push(
      pathToUrl(Paths.OrderModule.Orders, {
        businessUnit: businessUnitId,
        subPath: OrderStatusRoutes.InProgress,
      }),
    );
  }, [businessUnitId, history, orderStore, values.orderId]);

  return (
    <LeftPanelTools.Panel>
      <Layouts.Padding left="3" bottom="3">
        <Typography variant="headerThree">{t(`${I18N_PATH}EditLandfillOperation`)}</Typography>
      </Layouts.Padding>
      <Layouts.Scroll>
        <LeftPanelTools.ItemsContainer>
          <LeftPanelTools.Item>
            <Typography color="secondary">{t('Text.Customer')}:</Typography>
            <LeftPanelTools.Subitem>{values.customer.name}</LeftPanelTools.Subitem>
          </LeftPanelTools.Item>
          <LeftPanelTools.Item>
            <Typography color="secondary">{t('Text.JobSiteAddress')}:</Typography>
            <LeftPanelTools.Subitem>{addressFormat(values.jobSite.address)}</LeftPanelTools.Subitem>
          </LeftPanelTools.Item>
          <LeftPanelTools.Item>
            <Typography color="secondary">{t('Text.Landfill')}:</Typography>
            <LeftPanelTools.Subitem>{values.recyclingFacility.description}</LeftPanelTools.Subitem>
          </LeftPanelTools.Item>
          <LeftPanelTools.Item>
            <Typography color="secondary">{t('Text.Order')}#</Typography>
            <LeftPanelTools.Subitem>
              <Typography color="information" onClick={handleOrderIdClick}>
                {values.orderId}
              </Typography>
            </LeftPanelTools.Subitem>
          </LeftPanelTools.Item>
          <LeftPanelTools.Item>
            <Typography color="secondary">{t('Text.Service')}:</Typography>
            <LeftPanelTools.Subitem>
              <Typography>{values.billableService.description}</Typography>
            </LeftPanelTools.Subitem>
          </LeftPanelTools.Item>
        </LeftPanelTools.ItemsContainer>
      </Layouts.Scroll>
    </LeftPanelTools.Panel>
  );
};
