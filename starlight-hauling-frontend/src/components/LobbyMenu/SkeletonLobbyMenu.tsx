import React, { memo } from 'react';
import { Layouts } from '@starlightpro/shared-components';
import { range } from 'lodash-es';

import { RightArrowTriangle } from '@root/assets';
import { Loadable } from '@root/common';

import styles from './css/styles.scss';

const SkeletonLobbyMenuItem = () => (
  <div className={styles.menuItemWrapper}>
    <Layouts.Flex flexGrow={1}>
      <Layouts.Margin right="2">
        <Loadable height={40} width={40} tag="div" />
      </Layouts.Margin>
      <Layouts.Flex direction="column" flexGrow={1}>
        <Layouts.Margin bottom="0.5">
          <Loadable height={16} width="50%" tag="div" />
        </Layouts.Margin>
        <Loadable height={16} width="50%" tag="div" />
      </Layouts.Flex>
      <div className={styles.rightArrow}>
        <RightArrowTriangle />
      </div>
    </Layouts.Flex>
  </div>
);

export const SkeletonLobbyMenu = memo(() => {
  return (
    <>
      <SkeletonLobbyMenuItem />
      <Loadable height={20} width="70%" tag="div" className={styles.chooseUnit} />
      <Layouts.Scroll rounded maxHeight={175}>
        {range(10).map(x => (
          <SkeletonLobbyMenuItem key={x} />
        ))}
      </Layouts.Scroll>
      <Loadable height={20} width="70%" tag="div" className={styles.chooseUnit} />
      <SkeletonLobbyMenuItem />
    </>
  );
});
