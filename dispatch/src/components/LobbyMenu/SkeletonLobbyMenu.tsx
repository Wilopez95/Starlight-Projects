/* eslint-disable react/display-name */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { memo } from 'react';
import { range } from 'lodash-es';

import {
  Flex,
  Loadable,
  Margin,
  RightArrowTriangle,
  Scroll,
} from '@starlightpro/shared-components';
import { MenuWrapper, RightArrow } from './styles';

const SkeletonLobbyMenuItem = () => (
  <MenuWrapper>
    <Flex flexGrow={1}>
      <Margin right="2">
        <Loadable height={40} width={40} tag="div" />
      </Margin>
      <Flex direction="column" flexGrow={1}>
        <Margin bottom="0.5">
          <Loadable height={16} width="50%" tag="div" />
        </Margin>
        <Loadable height={16} width="50%" tag="div" />
      </Flex>
      <RightArrow>
        <RightArrowTriangle />
      </RightArrow>
    </Flex>
  </MenuWrapper>
);

export const SkeletonLobbyMenu = memo(() => (
  <Scroll rounded maxHeight={285}>
    {range(10).map((x: any) => (
      <SkeletonLobbyMenuItem key={x} />
    ))}
  </Scroll>
));
