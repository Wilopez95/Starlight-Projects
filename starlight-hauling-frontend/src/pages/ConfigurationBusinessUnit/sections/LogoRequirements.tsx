import React from 'react';
import { useTranslation } from 'react-i18next';
import cx from 'classnames';
import { observer } from 'mobx-react-lite';

import { Typography } from '@root/common';

import styles from './css/styles.scss';

const I18N_PATH = 'pages.SystemConfiguration.tables.BusinessUnit.sections.LogoRequirements.Text.';

const Section: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.section}>
      <div className={styles.content}>
        <Typography variant="headerThree" className={styles.spaceBottom}>
          {t(`${I18N_PATH}LogoRequirements`)}
        </Typography>
        <div className={styles.row}>
          <div className={cx(styles.column, styles.fullWidth)}>
            <Typography fontWeight="bold" className={cx(styles.spaceBottom, styles.small)}>
              {t(`${I18N_PATH}Requirements`)}:
            </Typography>
            <div>{t(`${I18N_PATH}LogoFiles`)}</div>
          </div>
          <div className={cx(styles.column, styles.fullWidth)}>
            <Typography fontWeight="bold" className={cx(styles.spaceBottom, styles.small)}>
              {t(`${I18N_PATH}Recommendations`)}:
            </Typography>
            <ul>
              <li>{t(`${I18N_PATH}PNG`)}</li>
              <li>{t(`${I18N_PATH}DoNotUseTall`)}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default observer(Section);
