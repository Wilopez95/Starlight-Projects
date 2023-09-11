import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Banner, Typography } from '@root/common';

const I18N_PATH = 'Titles.';

const PopUpNote: React.FC<{
  jobSitePopupNote?: string;
  customerPopupNote?: string;
  billingPopupNote?: string;
}> = ({ customerPopupNote, jobSitePopupNote, billingPopupNote }) => {
  const { t } = useTranslation();

  return (
    <Layouts.Flex as={Layouts.Box} height="100%" direction="column" justifyContent="space-between">
      <Layouts.Padding top="3" right="5" left="5">
        <Typography variant="headerThree">{t(`${I18N_PATH}PopupNotes`)}</Typography>
      </Layouts.Padding>
      {customerPopupNote ? (
        <>
          <Layouts.Padding top="3" right="5" left="5" bottom="1">
            <Typography variant="headerFive">{t(`${I18N_PATH}CustomerNote`)}</Typography>
          </Layouts.Padding>
          <Layouts.Padding left="5" right="5" bottom={jobSitePopupNote ? '0' : '5'}>
            <Banner color="primary" showIcon>
              {customerPopupNote}
            </Banner>
          </Layouts.Padding>
        </>
      ) : null}
      {jobSitePopupNote ? (
        <>
          <Layouts.Padding top="3" right="5" left="5" bottom="1">
            <Typography variant="headerFive">{t(`${I18N_PATH}JobSiteNote`)}</Typography>
          </Layouts.Padding>
          <Layouts.Padding padding="5" top="0">
            <Banner color="primary" showIcon>
              {jobSitePopupNote}
            </Banner>
          </Layouts.Padding>
        </>
      ) : null}
      {billingPopupNote ? (
        <>
          <Layouts.Padding top="3" right="5" left="5" bottom="1">
            <Typography variant="headerFive">{t(`${I18N_PATH}BillingNote`)}</Typography>
          </Layouts.Padding>
          <Layouts.Padding padding="5" top="0">
            <Banner color="primary" showIcon>
              {billingPopupNote}
            </Banner>
          </Layouts.Padding>
        </>
      ) : null}
    </Layouts.Flex>
  );
};

export default observer(PopUpNote);
