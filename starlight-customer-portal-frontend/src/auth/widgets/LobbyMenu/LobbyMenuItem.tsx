import React from 'react';
import { Layouts, Typography } from '@starlightpro/shared-components';
import { noop } from 'lodash-es';

import { RightArrowTriangle } from '@root/assets';
import { Logo } from '@root/core/common';

import { MenuItemWrapper } from './styles';
import { ILobbyMenuItem } from './types';

const LobbyMenuItem: React.FC<ILobbyMenuItem> = ({
  title,
  path,
  address,
  image,
  icon,
  defaultLogo,
  updatedAt = new Date(),
  onClick = noop,
}) => {
  return (
    <MenuItemWrapper to={path} onClick={onClick}>
      <Layouts.Padding as={Typography} variant='bodyMedium' top='1' bottom='1' left='1' right='0'>
        <Layouts.Flex justifyContent='space-between'>
          <Layouts.Box as={Layouts.Flex} alignItems='center' minHeight='50px' minWidth='400px'>
            <Logo image={image} icon={icon} defaultLogo={defaultLogo} updatedAt={updatedAt} />
            <Layouts.Box width='400px'>
              <Typography ellipsis variant='bodyMedium'>
                {title}
              </Typography>
              {address && (
                <Layouts.Margin top='1'>
                  <Typography
                    variant='caption'
                    fontWeight='bold'
                    color='secondary'
                    shade='desaturated'
                    textTransform='uppercase'
                  >
                    {address}
                  </Typography>
                </Layouts.Margin>
              )}
            </Layouts.Box>
          </Layouts.Box>
          <Layouts.Margin top='2'>
            <RightArrowTriangle />
          </Layouts.Margin>
        </Layouts.Flex>
      </Layouts.Padding>
    </MenuItemWrapper>
  );
};

export default LobbyMenuItem;
