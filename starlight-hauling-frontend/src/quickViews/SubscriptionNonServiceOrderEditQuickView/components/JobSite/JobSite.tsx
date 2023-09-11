import React from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, Layouts } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { Section, Subsection, Typography } from '@root/common';
import { IConfigurableSubscriptionOrder } from '@root/types';

const I18N_PATH = 'quickViews.SubscriptionNonServiceOrderEditQuickView.components.JobSite.';

const JobSiteSection: React.FC = () => {
  const { t } = useTranslation();
  const { values } = useFormikContext<IConfigurableSubscriptionOrder>();

  return (
    <Section>
      <Subsection>
        <Layouts.Margin bottom="2">
          <Typography variant="headerThree">{t(`${I18N_PATH}Header`)}</Typography>
        </Layouts.Margin>
        <Checkbox name="poRequired" value={values.poRequired} onChange={noop} disabled>
          {t(`${I18N_PATH}PONumberRequired`)}
        </Checkbox>
      </Subsection>
    </Section>
  );
};

export default observer(JobSiteSection);
