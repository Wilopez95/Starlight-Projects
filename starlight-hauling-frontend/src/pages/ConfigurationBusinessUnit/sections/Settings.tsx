import React from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, Layouts } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { Typography } from '@root/common';
import { IBusinessUnit } from '@root/types';

import styles from './css/styles.scss';

const I18N_PATH = 'pages.SystemConfiguration.tables.BusinessUnit.sections.Settings.Text.';

const Section: React.FC = () => {
  const { t } = useTranslation();
  const { values, handleChange } = useFormikContext<IBusinessUnit>();

  return (
    <div className={styles.section}>
      <div className={styles.content}>
        <Typography variant="headerThree" className={styles.spaceBottom}>
          {t(`${I18N_PATH}Settings`)}
        </Typography>

        <Layouts.Margin right="4" bottom="1">
          <Checkbox onChange={handleChange} name="applySurcharges" value={values.applySurcharges}>
            {t(`${I18N_PATH}ApplySurcharges`)}
          </Checkbox>
        </Layouts.Margin>
      </div>
    </div>
  );
};

export default observer(Section);
