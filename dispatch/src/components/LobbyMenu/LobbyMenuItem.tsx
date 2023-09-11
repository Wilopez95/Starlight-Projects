import * as React from 'react';
import {
  Box,
  Flex,
  Margin,
  Padding,
  RightArrowTriangle,
  Typography,
} from '@starlightpro/shared-components';
import { Logo } from '../Logo/Logo';
import { ILobbyMenuItem } from './types';
import { MenuItemWrapper } from './styles';

const LobbyMenuItem: React.FC<ILobbyMenuItem> = ({
  title,
  path,
  address,
  image,
  icon,
  defaultLogo,
  updatedAt = new Date(),
  onClick,
  isFirstItem,
}) => {
  return (
    <MenuItemWrapper to={path} onClick={onClick}>
      <Padding
        as={Typography}
        variant="bodyMedium"
        top={isFirstItem ? '1' : '0'}
        bottom="1"
        left="1"
        right="0"
      >
        <Flex justifyContent="space-between">
          <Box as={Flex} alignItems="center" maxHeight="30px" minWidth="400px">
            <Logo
              image={image}
              icon={icon}
              defaultLogo={defaultLogo}
              updatedAt={updatedAt}
            />
            <Box width="400px">
              <Margin>
                <Typography
                  ellipsis
                  style={{ fontSize: '14px', height: '28px' }}
                >
                  {title}
                </Typography>
              </Margin>
              {address ? <Margin>
                  <Typography
                    variant="caption"
                    fontWeight="bold"
                    color="secondary"
                    shade="desaturated"
                    style={{
                      fontSize: '10px',
                      letterSpacing: 0,
                      fontWeight: 700,
                    }}
                  >
                    {address}
                  </Typography>
                </Margin> : null}
            </Box>
          </Box>
          <Margin style={{ paddingRight: '16px', marginTop: '-12px' }}>
            <RightArrowTriangle />
          </Margin>
        </Flex>
      </Padding>
    </MenuItemWrapper>
  );
};

export default LobbyMenuItem;
