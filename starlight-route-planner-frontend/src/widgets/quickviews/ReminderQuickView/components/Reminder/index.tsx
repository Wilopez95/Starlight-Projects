import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { useIntl } from '@root/i18n/useIntl';
import { IReminder, ReminderTypes } from '@root/types';
import { Paths, SubscriptionTabRoutes } from '@root/consts';
import { useBusinessContext, useStores } from '@root/hooks';
import { handleEnterOrSpaceKeyDown, pathToUrl } from '@root/helpers';
import { CrossIcon, Layouts, Typography } from '@starlightpro/shared-components';
import styles from '../../css/styles.scss';

const I18N_PATH = 'quickViews.ReminderQuickView.components.Reminder.Text.';

const Reminder: React.FC<IReminder> = ({
  id,
  type,
  entityId,
  customerId,
  jobSiteId,
  date,
  customerName,
  informedByAppAt,
}) => {
  const { reminderStore } = useStores();
  const { formatDateTime } = useIntl();
  const { businessUnitId } = useBusinessContext();

  const { t } = useTranslation();

  const handleRemove = async (
    e: React.MouseEvent<HTMLOrSVGElement> | React.KeyboardEvent<HTMLOrSVGElement>,
  ) => {
    e.stopPropagation();
    await reminderStore.removeUserReminder(id);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLOrSVGElement>,
    callback: (e: React.KeyboardEvent<HTMLOrSVGElement>) => void,
  ) => {
    if (handleEnterOrSpaceKeyDown(e)) {
      callback(e);
    }
  };

  const handleReminderBodyClick = async () => {
    await reminderStore.markUserReminderAsRead(id);
  };

  const renderReminderDescription = () => {
    switch (type) {
      case ReminderTypes.ProspectReminder:
        return (
          <Trans
            i18nKey={`${I18N_PATH}SendOffer`}
            values={{ entityId, customerName }}
            components={{
              1: (
                <Link
                  className={styles.link}
                  to={pathToUrl(Paths.CustomerSubscriptionModule.Details, {
                    businessUnit: businessUnitId,
                    customerId,
                    tab: SubscriptionTabRoutes.Draft,
                    subscriptionId: entityId,
                  })}
                />
              ),
            }}
          />
        );

      case ReminderTypes.AnnualEventReminder:
        return (
          <Trans
            i18nKey={`${I18N_PATH}AnnualEvent`}
            values={{ entityId, customerName }}
            components={{
              1: (
                <Link
                  className={styles.link}
                  to={pathToUrl(Paths.CustomerSubscriptionModule.Details, {
                    businessUnit: businessUnitId,
                    customerId,
                    tab: SubscriptionTabRoutes.Active,
                    subscriptionId: entityId,
                  })}
                />
              ),
            }}
          />
        );

      case ReminderTypes.OrderAnnualEventReminder:
        return (
          <Trans
            i18nKey={`${I18N_PATH}AnnualEvent`}
            values={{ entityId, customerName }}
            components={{
              1: (
                <Link
                  className={styles.link}
                  to={pathToUrl(Paths.CustomerJobSiteModule.OpenOrders, {
                    businessUnit: businessUnitId,
                    jobSiteId,
                    customerId,
                    tab: SubscriptionTabRoutes.Draft,
                    id: entityId,
                  })}
                />
              ),
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Layouts.Box
      className={styles.reminderBox}
      height="105px"
      backgroundColor={informedByAppAt ? 'white' : 'primary'}
      backgroundShade={informedByAppAt ? 'standard' : 'desaturated'}
      onClick={handleReminderBodyClick}
    >
      <Layouts.Padding top="1" left="3" right="3" bottom="1">
        <div className={styles.navigation}>
          <Typography variant={informedByAppAt ? 'bodyMedium' : 'headerFive'}>
            {type === ReminderTypes.ProspectReminder
              ? t(`${I18N_PATH}ProspectReminderTitle`)
              : t(`${I18N_PATH}AnnualEventReminderTitle`)}
          </Typography>
          <CrossIcon
            className={styles.crossIcon}
            tabIndex={0}
            role="button"
            aria-label={t('Text.Close')}
            onKeyDown={(e: React.KeyboardEvent<HTMLOrSVGElement>) => handleKeyDown(e, handleRemove)}
            onClick={handleRemove}
          />
        </div>

        <Layouts.Box width="345px">
          <Typography variant="bodyMedium" color="secondary" shade="desaturated">
            {renderReminderDescription()}
          </Typography>

          <Layouts.Padding top="0.5">
            <Typography color="secondary" variant="bodyMedium" shade="desaturated">
              {formatDateTime(date).date}
            </Typography>
          </Layouts.Padding>
        </Layouts.Box>
      </Layouts.Padding>
    </Layouts.Box>
  );
};

export default observer(Reminder);
