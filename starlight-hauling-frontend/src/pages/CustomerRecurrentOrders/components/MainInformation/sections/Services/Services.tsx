import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { Badge, Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { useRecurrentTemplateFrequency, useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { type RecurrentOrder } from '@root/stores/entities';

const I18N_PATH = 'pages.CustomerRecurrentOrders.tables.MainInformation.sections.Services.Text.';

const ServicesSection: React.FC = () => {
  const { t } = useTranslation();

  const { values } = useFormikContext<RecurrentOrder>();
  const { formatCurrency, currencySymbol } = useIntl();

  const { billableServiceStore, materialStore, lineItemStore } = useStores();
  const recurrentFrequencyText = useRecurrentTemplateFrequency(true);

  useEffect(() => {
    if (values.billableService?.originalId) {
      billableServiceStore.requestById(+values.billableService?.originalId);
    }
  }, [values.billableService?.originalId, billableServiceStore]);

  useEffect(() => {
    if (values.material?.originalId) {
      materialStore.requestById(+values.material?.originalId);
    }
  }, [values.material?.originalId, materialStore]);

  useEffect(() => {
    if (values.lineItems?.length > 0) {
      lineItemStore.request({ businessLineId: values.businessLine.id, oneTime: true });
    }
  }, [values.businessLine?.id, lineItemStore, values.lineItems]);

  const selectedBillableService = billableServiceStore.selectedEntity;
  const selectedMaterial = materialStore.selectedEntity;

  const getOriginalLineItem = useCallback(
    originalId => lineItemStore.values.find(({ id }) => id === originalId),
    [lineItemStore.values],
  );

  return (
    <Layouts.Cell top={2}>
      <Layouts.Grid gap="2" columns="3fr 2fr 1fr 1fr 1fr">
        <Layouts.Cell width={5}>
          <Typography variant="headerFour">{t(`${I18N_PATH}Service`)}</Typography>
        </Layouts.Cell>
        <Typography color="secondary" shade="desaturated">
          {t(`${I18N_PATH}Service`)}
        </Typography>
        <Typography color="secondary" shade="desaturated">
          {t(`${I18N_PATH}Material`)}
        </Typography>
        <Typography color="secondary" textAlign="right" shade="desaturated">
          {t(`${I18N_PATH}Price`)}
        </Typography>
        <Typography color="secondary" textAlign="right" shade="desaturated">
          {t(`${I18N_PATH}QTY`)}
        </Typography>
        <Typography color="secondary" shade="desaturated" textAlign="right">
          {t(`${I18N_PATH}Total`, { currencySymbol })}
        </Typography>
        <Layouts.Flex>
          <span>{selectedBillableService?.description}</span>
          {!selectedBillableService?.active ? (
            <Layouts.Margin left="1">
              <Badge borderRadius={2} color="primary">
                {t('Text.Inactive')}
              </Badge>
            </Layouts.Margin>
          ) : null}
        </Layouts.Flex>
        <Layouts.Flex>
          <span>{selectedMaterial?.description}</span>
          {!selectedMaterial?.active ? (
            <Layouts.Margin left="1">
              <Badge borderRadius={2} color="primary">
                {t('Text.Inactive')}
              </Badge>
            </Layouts.Margin>
          ) : null}
        </Layouts.Flex>
        <Typography textAlign="right">{formatCurrency(values.billableServicePrice)}</Typography>
        <Typography textAlign="right">{values.billableServiceQuantity}</Typography>
        <Typography textAlign="right">
          {formatCurrency(values.billableServicePrice * values.billableServiceQuantity)}
        </Typography>
        <Layouts.Cell width={5}>
          <Typography color="secondary" shade="desaturated">
            {t(`${I18N_PATH}Frequency`)}
          </Typography>
        </Layouts.Cell>
        <Layouts.Cell width={5}>
          <Typography>{recurrentFrequencyText}</Typography>
        </Layouts.Cell>
        {values.lineItems ? (
          <>
            <Layouts.Cell width={5}>
              <Layouts.Margin top="2">
                <Typography variant="headerFour">{t(`${I18N_PATH}LineItems`)}</Typography>
              </Layouts.Margin>
            </Layouts.Cell>
            <Layouts.Cell width={2}>
              <Typography color="secondary" shade="desaturated">
                {t(`${I18N_PATH}LineItem`)}
              </Typography>
            </Layouts.Cell>
            <Typography textAlign="right" color="secondary" shade="desaturated">
              {t(`${I18N_PATH}Price`)}
            </Typography>
            <Typography textAlign="right" color="secondary" shade="desaturated">
              {t(`${I18N_PATH}QTY`)}
            </Typography>
            <Typography color="secondary" shade="desaturated" textAlign="right">
              {t(`${I18N_PATH}Total`, { currencySymbol })}
            </Typography>
            {values.lineItems?.map(lineItem => {
              const originalLineItem = getOriginalLineItem(lineItem.billableLineItem.originalId);

              return (
                <React.Fragment key={lineItem.id}>
                  <Layouts.Cell width={2}>
                    <Layouts.Flex>
                      <span>{originalLineItem?.description}</span>
                      {!originalLineItem?.active ? (
                        <Layouts.Margin left="1">
                          <Badge borderRadius={2} color="primary">
                            {t('Text.Inactive')}
                          </Badge>
                        </Layouts.Margin>
                      ) : null}
                    </Layouts.Flex>
                  </Layouts.Cell>
                  <Typography textAlign="right">{formatCurrency(lineItem.price)}</Typography>
                  <Typography textAlign="right">{lineItem.quantity}</Typography>
                  <Typography textAlign="right">
                    {formatCurrency((lineItem.price ?? 0) * lineItem.quantity)}
                  </Typography>
                </React.Fragment>
              );
            })}
          </>
        ) : null}
        <Layouts.Cell width={5}>
          <Divider both />
        </Layouts.Cell>
      </Layouts.Grid>
    </Layouts.Cell>
  );
};

export default observer(ServicesSection);
