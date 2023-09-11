import React from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox } from '@starlightpro/shared-components';
import { noop } from 'lodash-es';

import { Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';

import styles from '../../css/styles.scss';

interface IAdditionalPreferencesSection {
  workOrderRequired: boolean;
  jobSiteRequired: boolean;
  canTareWeightRequired: boolean;
  gradingRequired: boolean;
  gradingNotification: boolean;
  selfServiceOrderAllowed: boolean;
  isWalkUpCustomer: boolean;
}

const I18N_PATH =
  'pages.CustomerProfile.sections.AdditionalPreferences.AdditionalPreferencesSection.Text.';

const AdditionalPreferencesSection: React.FC<IAdditionalPreferencesSection> = ({
  workOrderRequired,
  jobSiteRequired,
  canTareWeightRequired,
  gradingRequired,
  gradingNotification,
  selfServiceOrderAllowed,
  isWalkUpCustomer,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <tr>
        <td colSpan={2}>
          <Typography className={styles.sectionHeading} variant="bodyLarge" fontWeight="bold">
            {t(`${I18N_PATH}AdditionalPreferences`)}
          </Typography>
        </td>
      </tr>
      {!isWalkUpCustomer ? (
        <tr>
          <td colSpan={2}>
            <Checkbox name="workOrderRequired" disabled onChange={noop} value={workOrderRequired}>
              <span className={styles.label}>{t(`${I18N_PATH}WorkOrderRequired`)}</span>
            </Checkbox>
          </td>
          <td colSpan={2}>
            <Checkbox
              name="canTareWeightRequired"
              disabled
              onChange={noop}
              value={canTareWeightRequired}
            >
              <span className={styles.label}>{t(`${I18N_PATH}CanTareWeightRequired`)}</span>
            </Checkbox>
          </td>
        </tr>
      ) : null}

      <tr>
        <td colSpan={2}>
          <Checkbox name="gradingRequired" disabled onChange={noop} value={gradingRequired}>
            <span className={styles.label}>{t(`${I18N_PATH}GradingRequired`)}</span>
          </Checkbox>
        </td>
        {!isWalkUpCustomer ? (
          <td colSpan={2}>
            <Checkbox
              name="selfServiceOrderAllowed"
              disabled
              onChange={noop}
              value={selfServiceOrderAllowed}
            >
              <span className={styles.label}>{t(`${I18N_PATH}SelfServiceOrderAllowed`)}</span>
            </Checkbox>
          </td>
        ) : null}
      </tr>
      <tr>
        <td colSpan={2}>
          <Checkbox name="gradingNotification" disabled onChange={noop} value={gradingNotification}>
            <span className={styles.label}>{t(`${I18N_PATH}GradingNotification`)}</span>
          </Checkbox>
        </td>
        {!isWalkUpCustomer ? (
          <td colSpan={2}>
            <Checkbox name="jobSiteRequired" disabled onChange={noop} value={jobSiteRequired}>
              <span className={styles.label}>{t(`${I18N_PATH}JobSiteRequired`)}</span>
            </Checkbox>
          </td>
        ) : null}
      </tr>
      <Divider colSpan={4} both />
    </>
  );
};

export default AdditionalPreferencesSection;
