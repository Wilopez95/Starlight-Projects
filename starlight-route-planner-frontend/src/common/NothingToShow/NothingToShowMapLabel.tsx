import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts, Typography } from '@starlightpro/shared-components';

import {
  CrossIcon,
  MapLabelContentWrapper,
  MapLabelWrapper as Wrapper,
  SearchIcon,
} from './styles';

const I18N_PATH = 'pages.Dispatcher.components.NothingToShowMapLabel.Text.';

export const NothingToShowMapLabel: React.FC = () => {
  const [isOpened, setIsOpened] = useState(true);
  const { t } = useTranslation();

  if (!isOpened) {
    return null;
  }

  return (
    <Wrapper
      position="absolute"
      width="100%"
      minHeight="35px"
      top="0"
      backgroundColor="primary"
      backgroundShade="desaturated"
    >
      <MapLabelContentWrapper width="100%" height="35px">
        <Layouts.Flex alignItems="center" gap="8px">
          <SearchIcon />
          <Typography variant="bodySmall">{t(`${I18N_PATH}NoSearchResults`)}</Typography>
          <Layouts.Margin left="auto" />
        </Layouts.Flex>
      </MapLabelContentWrapper>
      <Typography cursor="pointer">
        <Layouts.Padding padding="1" onClick={() => setIsOpened(false)}>
          <CrossIcon />
        </Layouts.Padding>
      </Typography>
    </Wrapper>
  );
};
