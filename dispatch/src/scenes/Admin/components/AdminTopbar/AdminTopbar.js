/* eslint-disable jsx-a11y/anchor-is-valid */
import { useCallback } from 'react';
import { useToggle, Margin, GlobalMenuIcon } from '@starlightpro/shared-components';
import { Link } from 'react-router-dom';
import { useUserContext } from '@root/auth/hooks/useUserContext';
import { Dropdown, DropdownTrigger, DropdownContent } from '@root/components/Dropdown';

import LobbyMenu from '@root/components/LobbyMenu/LobbyMenu';
import ClickOutHandler from '@root/components/ClickOutHandler/ClickOutHandler';

import {
  AdminHeaderStyle,
  HeaderBranding,
  HeaderTitle,
  HeaderRight,
  HeaderUserBar,
  HeaderUsername,
} from './AdminTopbarStyle';

const AdminTopbar = () => {
  const { currentUser, logOut } = useUserContext();
  const [isMenuOpen, toggleMenuOpen, setIsMenuOpen] = useToggle();
  const handleCloseOpen = useCallback(() => {
    setIsMenuOpen(false);
  }, [setIsMenuOpen]);

  return (
    <AdminHeaderStyle>
      <HeaderBranding>
        {isMenuOpen ? (
          <ClickOutHandler onClickOut={handleCloseOpen} style={{ position: 'absolute' }}>
            <Margin top="4" left="2">
              <LobbyMenu />
            </Margin>
          </ClickOutHandler>
        ) : null}
        <Margin right="1">
          <GlobalMenuIcon role="button" aria-label="units" tabIndex={0} onClick={toggleMenuOpen} />
        </Margin>
        <HeaderTitle>Administration</HeaderTitle>
      </HeaderBranding>
      <HeaderRight>
        <HeaderUserBar>
          {currentUser.username ? (
            <p>
              Login as <HeaderUsername>Administrator</HeaderUsername>
            </p>
          ) : null}
        </HeaderUserBar>
        <Dropdown className="dropdown--filter">
          <DropdownTrigger>
            <button className="header-menu-btn" type="button" />
          </DropdownTrigger>
          <DropdownContent className="menu">
            <ul className="menu-list">
              <li className="menu-item">
                <Link to="/configuration/inventory-board">Inventory Board</Link>
              </li>
              <li className="menu-item">
                <a data-name="logout" onClick={logOut}>
                  Logout
                </a>
              </li>
            </ul>
          </DropdownContent>
        </Dropdown>
      </HeaderRight>
    </AdminHeaderStyle>
  );
};

export default AdminTopbar;
