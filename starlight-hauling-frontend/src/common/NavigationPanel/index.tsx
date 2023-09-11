import React from 'react';
import { Layouts } from '@starlightpro/shared-components';

import { IBaseComponent } from '@root/types';

import * as Styles from './styles';

export const NavigationPanel: React.FC<IBaseComponent> = ({ children, className }) => (
  <Styles.NavigationPanelContainer className={className}>
    <Layouts.Box minWidth="264px" backgroundColor="secondary" backgroundShade="dark" height="100%">
      <Layouts.Scroll>
        <Layouts.Padding top="4" bottom="4">
          {children}
        </Layouts.Padding>
      </Layouts.Scroll>
    </Layouts.Box>
  </Styles.NavigationPanelContainer>
);

export * from './NavigationPanelItem';
export * from './NavigationPanelItemContainer';
