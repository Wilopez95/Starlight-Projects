import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';
import { Typography, Badge } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { useStores } from '@root/hooks';
import { startCase } from 'lodash-es';
import { useIntl } from '@root/i18n/useIntl';
import { format } from 'date-fns-tz';
import { parseDate } from '@root/helpers';
import { getColorByAction } from '../../pages/IntegrationLog/helpers'; //PUT THIS ON HELPERS

const I18N_PATH = 'quickViews.QbQuickViews.IntegrationLog.RightPanel.Text.';

const QbIntegrationLogQuickViewRightPanel: React.FC = () => {
  const { qbIntegrationLogStore } = useStores();
  const { t } = useTranslation();
  const { dateFormat, formatCurrency } = useIntl();
  const selectedEntity = qbIntegrationLogStore.selectedEntity;
  return (
    <Layouts.Scroll>
      <Layouts.Padding padding="3">
        <Typography variant="headerThree">{t(`${I18N_PATH}SessionDetails`)}</Typography>
        <Badge borderRadius={2} color={getColorByAction(selectedEntity?.type)}>
          {startCase(selectedEntity?.type)}
        </Badge>
        <Divider both />
        <Layouts.Padding top="1.5">
          <Layouts.Grid columns={3}>
            <Typography style={{ color: '#7a7f87' }} as="label" htmlFor="description">
              {t(`${I18N_PATH}SessionStart`)}
            </Typography>
            <Layouts.Cell width={2}>
              <Typography as="label" htmlFor="description" color="secondary">
                {format(parseDate(selectedEntity?.lastSuccessfulIntegration), dateFormat.time)}
              </Typography>
              <Typography style={{ color: '#7a7f87' }} as="label" htmlFor="description">
                {`・${format(
                  parseDate(selectedEntity?.lastSuccessfulIntegration),
                  dateFormat.date,
                )}`}
              </Typography>
            </Layouts.Cell>
          </Layouts.Grid>
        </Layouts.Padding>
        <Layouts.Padding top="1.5">
          <Layouts.Grid columns={3}>
            <Typography style={{ color: '#7a7f87' }} as="label" htmlFor="description">
              {t(`${I18N_PATH}Period`)}
            </Typography>
            <Layouts.Cell width={2}>
              <Typography as="label" htmlFor="description" color="secondary">
                {`${format(parseDate(selectedEntity?.rangeFrom), dateFormat.date)} - ${format(
                  parseDate(selectedEntity?.rangeTo),
                  dateFormat.date,
                )}`}
              </Typography>
            </Layouts.Cell>
          </Layouts.Grid>
        </Layouts.Padding>
        <Layouts.Padding top="1.5">
          <Layouts.Grid columns={3}>
            <Typography style={{ color: '#7a7f87' }} as="label" htmlFor="description">
              {t(`${I18N_PATH}BusinessUnit`)}
            </Typography>
            <Layouts.Cell width={2}>
              <Typography as="label" htmlFor="description" color="secondary">
                {selectedEntity?.integrationBuList.length === 1
                  ? selectedEntity?.integrationBuList
                  : `${selectedEntity?.integrationBuList} `}
              </Typography>
            </Layouts.Cell>
          </Layouts.Grid>
        </Layouts.Padding>
        <Layouts.Padding top="1.5">
          <Layouts.Grid columns={3}>
            <Typography style={{ color: '#7a7f87' }} as="label" htmlFor="description">
              {t(`${I18N_PATH}Total`)}
            </Typography>
            <Layouts.Cell width={2}>
              <Typography as="label" htmlFor="description" color="secondary">
                {selectedEntity?.paymentsTotal
                  ? formatCurrency(parseInt(selectedEntity?.paymentsTotal, 10))
                  : formatCurrency(0)}
              </Typography>
            </Layouts.Cell>
          </Layouts.Grid>
        </Layouts.Padding>
        <Layouts.Padding top="1.5">
          <Divider both />
        </Layouts.Padding>
        <Layouts.Padding top="1.5">
          <Layouts.Grid columns={3}>
            <Typography style={{ color: '#7a7f87' }} as="label" htmlFor="description">
              {t(`${I18N_PATH}StatusCode`)}
            </Typography>
            <Layouts.Cell width={2}>
              <Typography as="label" htmlFor="description" color="secondary">
                {selectedEntity?.statusCode}
              </Typography>
            </Layouts.Cell>
          </Layouts.Grid>
        </Layouts.Padding>
        <Layouts.Padding top="1.5">
          <Layouts.Grid columns={3}>
            <Typography style={{ color: '#7a7f87' }} as="label" htmlFor="description">
              {t(`${I18N_PATH}Message`)}
            </Typography>
            <Layouts.Cell width={2}>
              <Typography as="label" htmlFor="description" color="secondary">
                {selectedEntity?.description}
              </Typography>
            </Layouts.Cell>
          </Layouts.Grid>
        </Layouts.Padding>
        <Layouts.Padding top="1.5">
          <Layouts.Grid columns={3}>
            <Typography style={{ color: '#7a7f87' }} as="label" htmlFor="description">
              {t(`${I18N_PATH}Details`)}
            </Typography>
            <Layouts.Cell width={2}>
              <Typography as="label" htmlFor="description" color="secondary">
                {selectedEntity?.description}
              </Typography>
            </Layouts.Cell>
          </Layouts.Grid>
        </Layouts.Padding>
      </Layouts.Padding>
    </Layouts.Scroll>
  );
};

export default observer(QbIntegrationLogQuickViewRightPanel);
