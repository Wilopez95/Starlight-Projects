import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';

import { NoResultIcon, SidebarWrapper as Wrapper, Typography } from './styles';
import { INothingToShowSidebar } from './types';

const I18N_PATH = 'pages.Dispatcher.components.NothingToShowSidebar.Text.';

export const NothingToShowSidebar: React.FC<INothingToShowSidebar> = ({ text }) => {
  const { t } = useTranslation();

  return (
    <Wrapper direction="column" justifyContent="center" alignItems="center">
      <NoResultIcon />
      <Layouts.Margin top="3">
        <Layouts.Padding left="2" right="2">
          <Typography textAlign="center" variant="headerFour">
            {text ?? t(`${I18N_PATH}Description`)}
          </Typography>
        </Layouts.Padding>
      </Layouts.Margin>
    </Wrapper>
  );
};
