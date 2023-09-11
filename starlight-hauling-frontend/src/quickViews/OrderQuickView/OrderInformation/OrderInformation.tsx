import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Protected, Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { IRescheduleOrderData } from '@root/components/forms/RescheduleOrder/types';
import { ConfirmModal, RescheduleOrderModal } from '@root/components/modals';
import { BusinessLineType } from '@root/consts';
import { handleEnterOrSpaceKeyDown } from '@root/helpers';
import { useStores, useToggle } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';

import * as QuickViewStyles from '../../styles';

import { IOrderInformation } from './types';

const I18N_PATH = 'quickViews.OrderQuickView.OrderInformation.Text.';

const OrderInformation: React.FC<IOrderInformation> = ({ order, onReschedule }) => {
  const { orderStore, businessLineStore } = useStores();
  const { t } = useTranslation();
  const { formatCurrency, formatDateTime } = useIntl();

  const [isRescheduleModalOpen, toggleRescheduleModal] = useToggle();
  const businessLineType = businessLineStore.getById(order.businessLine.id)?.type;
  const [isRatesNotFoundModalOpen, toggleRatesNotFoundModal] = useToggle();

  const handleRescheduleSubmit = useCallback(
    async (data: IRescheduleOrderData) => {
      if (order) {
        await orderStore.reschedule(order, data);

        toggleRescheduleModal();

        if (orderStore.ratesError) {
          toggleRatesNotFoundModal();
          orderStore.cleanRatesError();
        } else {
          orderStore.requestDetails({
            orderId: order.id,
            edit: true,
          });
          onReschedule?.();
        }
      }
    },
    [order, orderStore, toggleRescheduleModal, toggleRatesNotFoundModal, onReschedule],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLOrSVGElement>) => {
      if (handleEnterOrSpaceKeyDown(e)) {
        toggleRescheduleModal();
      }
    },
    [toggleRescheduleModal],
  );

  const date = formatDateTime(order.serviceDate).date;

  const createdAtDate = formatDateTime(order.createdAt as Date).date;
  const createdAtTime = formatDateTime(order.createdAt as Date).time;
  const fallback = '-';

  return (
    <>
      <RescheduleOrderModal
        isOpen={isRescheduleModalOpen}
        onClose={toggleRescheduleModal}
        onFormSubmit={handleRescheduleSubmit}
      />
      <ConfirmModal
        isOpen={isRatesNotFoundModalOpen}
        title={t('components.modals.RescheduleOrderRatesNotFound.Text.Title')}
        cancelButton={t('Text.Close')}
        subTitle={t('components.modals.RescheduleOrderRatesNotFound.Text.SubTitle')}
        onCancel={toggleRatesNotFoundModal}
      />
      <QuickViewStyles.QuickViewTable>
        <tbody>
          <tr>
            <td>
              <Typography color="secondary" shade="desaturated" variant="bodyMedium">
                {t(`${I18N_PATH}LineOfBusiness`)}
              </Typography>
            </td>
            <td>
              <Typography>{order.businessLine?.name}</Typography>
            </td>
          </tr>
          <tr>
            <td>
              <Typography color="secondary" shade="desaturated" variant="bodyMedium">
                {t(`${I18N_PATH}ServiceArea`)}
              </Typography>
            </td>
            <td>
              <Typography>{order.serviceArea?.name ?? fallback}</Typography>
            </td>
          </tr>
          <Divider colSpan={2} />
          <tr>
            <td>
              <Typography color="secondary" shade="desaturated" variant="bodyMedium">
                {t(`${I18N_PATH}OrderCreated`)}
              </Typography>
            </td>
            <td>
              <Typography as="span">{createdAtTime}</Typography>
              <Typography as="span" color="secondary" shade="desaturated">
                ・{createdAtDate}
              </Typography>
            </td>
          </tr>
          <tr>
            <td>
              <Typography color="secondary" shade="desaturated" variant="bodyMedium">
                {t(`${I18N_PATH}WO`)}
              </Typography>
            </td>
            <td>
              <Typography>
                {order.workOrder?.woNumber === -1
                  ? t('Text.Pending')
                  : order.workOrder?.woNumber ?? fallback}
              </Typography>
            </td>
          </tr>
          {businessLineType === BusinessLineType.portableToilets ? (
            <tr>
              <td>
                <Typography color="secondary" shade="desaturated" variant="bodyMedium">
                  {t(`${I18N_PATH}PreferredRoute`)}
                </Typography>
              </td>
              <td>
                <Typography>{order.workOrder?.route ?? fallback}</Typography>
              </td>
            </tr>
          ) : null}
          <tr>
            <td>
              <Typography color="secondary" shade="desaturated" variant="bodyMedium">
                {t(`${I18N_PATH}CSR`)}
              </Typography>
            </td>
            <td>
              <Typography>{order.getCsrName}</Typography>
            </td>
          </tr>
          <tr>
            <td>
              <Typography color="secondary" shade="desaturated" variant="bodyMedium">
                {t(`${I18N_PATH}Customer`)}
              </Typography>
            </td>
            <td>
              <Typography>{order.customerName}</Typography>
            </td>
          </tr>
          <tr>
            <td>
              <Typography color="secondary" shade="desaturated" variant="bodyMedium">
                {t(`${I18N_PATH}JobSite`)}
              </Typography>
            </td>
            <td>
              <Typography>{order.jobSiteAddress}</Typography>
            </td>
          </tr>
          <tr>
            <td>
              <Typography color="secondary" shade="desaturated" variant="bodyMedium">
                {t(`${I18N_PATH}TaxDistrict`)}
              </Typography>
            </td>
            <td>
              {order.taxDistricts?.map(({ description }) => description).join(', ') ?? 'None'}
            </td>
          </tr>
          <tr>
            <td>
              <Typography color="secondary" shade="desaturated" variant="bodyMedium">
                {t(`${I18N_PATH}Service`)}
              </Typography>
            </td>
            <td>
              <Typography>{order.billableService?.description}</Typography>
            </td>
          </tr>
          <tr>
            <td>
              <Typography color="secondary" shade="desaturated" variant="bodyMedium">
                {t(`${I18N_PATH}ServiceDate`)}
              </Typography>
            </td>
            <td>
              <Layouts.Flex justifyContent="space-between">
                <Typography>{date}</Typography>
                <Protected permissions="orders:edit:perform">
                  {order.status === 'inProgress' ? (
                    <Typography
                      color="information"
                      role="button"
                      tabIndex={0}
                      onKeyDown={handleKeyDown}
                      onClick={toggleRescheduleModal}
                    >
                      {t(`${I18N_PATH}Reschedule`)}
                    </Typography>
                  ) : null}
                </Protected>
              </Layouts.Flex>
            </td>
          </tr>
          <tr>
            <td>
              <Typography color="secondary" shade="desaturated" variant="bodyMedium">
                {t(`${I18N_PATH}Material`)}
              </Typography>
            </td>
            <td>
              <Typography>{order.material?.description}</Typography>
            </td>
          </tr>
          <tr>
            <td>
              <Typography color="secondary" shade="desaturated" variant="bodyMedium">
                {t(`Text.Equipment`)}
              </Typography>
            </td>
            <td>
              <Typography>{order.equipmentItem?.description}</Typography>
            </td>
          </tr>
          <tr>
            <td>
              {/*todo(y.yakovenko): add currency symbol to config, when will be merged*/}
              <Typography color="secondary" shade="desaturated" variant="bodyMedium">
                {`${t(`${I18N_PATH}Total`)} `} $
              </Typography>
            </td>

            <td>
              <Typography fontWeight="bold">{formatCurrency(order.grandTotal)}</Typography>
            </td>
          </tr>
        </tbody>
      </QuickViewStyles.QuickViewTable>
      <Divider both />
      <Typography variant="bodyMedium" color="secondary" shade="desaturated">
        {t(
          order.billableService ? `${I18N_PATH}InstructionsForDriver` : `${I18N_PATH}Instructions`,
        )}
      </Typography>
      <Layouts.Padding top="2">
        <Typography>{order.driverInstructions}</Typography>
      </Layouts.Padding>
    </>
  );
};

export default observer(OrderInformation);
