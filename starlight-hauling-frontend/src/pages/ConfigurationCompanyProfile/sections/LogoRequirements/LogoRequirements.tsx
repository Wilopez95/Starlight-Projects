import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';

import { Typography } from '@root/common';

import styles from '../css/styles.scss';

const I18N_PATH = 'pages.SystemConfiguration.tables.Companies.sections.LogoRequirements.Text.';

const LogoRequirementsSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Layouts.Margin bottom="3" top="3">
      <div className={styles.section}>
        <Layouts.Padding padding="3">
          <Layouts.Margin bottom="3">
            <Typography variant="headerThree">{t(`${I18N_PATH}LogoRequirements`)}</Typography>
          </Layouts.Margin>
          <Layouts.Flex>
            <Layouts.Column padding="4">
              <Layouts.Margin bottom="3">
                <Typography variant="headerFive">{t(`${I18N_PATH}Requirements`)}:</Typography>
              </Layouts.Margin>
              <Typography variant="bodyMedium">{t(`${I18N_PATH}LogoFiles`)}</Typography>
            </Layouts.Column>
            <Layouts.Column padding="4">
              <Layouts.Margin bottom="3">
                <Typography variant="headerFive">{t(`${I18N_PATH}Recommendations`)}:</Typography>
              </Layouts.Margin>
              <Typography variant="bodyMedium">
                <ul>
                  <li>{t(`${I18N_PATH}PNG`)}</li>
                  <li>{t(`${I18N_PATH}TallImages`)}</li>
                </ul>
              </Typography>
            </Layouts.Column>
          </Layouts.Flex>
        </Layouts.Padding>
      </div>
    </Layouts.Margin>
  );
};

export default LogoRequirementsSection;
