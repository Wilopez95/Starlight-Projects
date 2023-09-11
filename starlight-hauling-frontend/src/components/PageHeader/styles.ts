import styled from 'styled-components';

import { ClickOutHandler } from '@root/common';

export const LobbyMenuContainer = styled(ClickOutHandler)<{ zIndex: number }>(p => ({
  position: 'absolute',
  boxShadow: p.theme.shadows.lobbyMenu,
  left: '3%',
  top: '80%',
  zIndex: p.zIndex,
}));

export const NavBar = styled.nav<{ zIndex: number }>`
  height: var(--headerHeight);
  box-shadow: 0 2px 8px 0 rgba(33, 43, 54, 0.15);
  background-color: var(--dark-two);
  padding: 24px 0;
  display: flex;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: ${p => p.zIndex};
`;
