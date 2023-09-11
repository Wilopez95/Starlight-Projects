import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts, Typography } from '@starlightpro/shared-components';

import { ICollapsibleBarHeader } from '@root/app/components/СollapsibleBarHeader/types';

export const CollapsibleBarHeader: React.FC<ICollapsibleBarHeader> = ({ name }) => {
  const { t } = useTranslation();
  const I18N_PATH = 'components.PageHeader.Text.';

  return (
    <Layouts.Flex direction='column'>
      <Typography variant='headerFive' color='secondary' shade='desaturated'>
        {t(`${I18N_PATH}Hi`)}
        {`, ${name}`}
      </Typography>
    </Layouts.Flex>
  );
};
