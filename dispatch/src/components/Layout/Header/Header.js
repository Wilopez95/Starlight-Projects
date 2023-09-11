/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/prefer-stateless-function */

import { useCallback } from 'react';
import { Link, NavLink, useParams } from 'react-router-dom';
import { connect } from 'react-redux';
import { GlobalMenuIcon, Margin, useToggle } from '@starlightpro/shared-components';
import PropTypes from 'prop-types';
import { useUserContext } from '@root/auth/hooks/useUserContext';
import { pathToUrl } from '@root/helpers/pathToUrl';

import { Dropdown, DropdownTrigger, DropdownContent } from '../../Dropdown';

import { sessionLogout, selectCurrentUser } from '../../../state/modules/session';

// import { Paths } from '@root/routes/routing';
import { Paths } from '../../../routes/routing';

import ClickOutHandler from '../../ClickOutHandler/ClickOutHandler';
import LobbyMenu from '../../LobbyMenu/LobbyMenu';
import styles from './css/styles.scss';

const Header = (props) => {
  const { user } = props;
  const { currentUser, logOut } = useUserContext();
  const [isMenuOpen, toggleMenuOpen, setIsMenuOpen] = useToggle();
  const IS_READ_ONLY = currentUser.tenantId === 4;

  const orgNames = {
    1: '5280',
    3: 'MST',
    4: 'ULI',
  };

  const { businessUnit } = useParams();
  const navigations = [
    {
      id: 1,
      href: pathToUrl(Paths.Dispatcher, { businessUnit }),
      title: 'Dispatcher',
    },
    {
      id: 2,
      href: pathToUrl(Paths.WorkOrders, { businessUnit }),
      title: 'Work orders',
    },
    {
      id: 3,
      href: pathToUrl(Paths.Inventory, { businessUnit }),
      title: 'Inventory',
    },
    {
      id: 4,
      href: pathToUrl(Paths.InventoryBoard, { businessUnit }),
      title: 'Inventory Board',
    },
  ];

  const handleCloseOpen = useCallback(() => {
    setIsMenuOpen(false);
  }, [setIsMenuOpen]);

  const sideNavigation = [
    {
      id: 1,
      href: pathToUrl(Paths.Reports, { businessUnit }),
      title: 'Reports',
    },
  ];

  return (
    <header className="header__main">
      <div className="header__column--title">
        <h2 className="header__title">{orgNames[user.orgId]}</h2>
      </div>
      {isMenuOpen ? (
        <ClickOutHandler onClickOut={handleCloseOpen} className={styles.menuPosition}>
          <Margin top="4" left="2">
            <LobbyMenu />
          </Margin>
        </ClickOutHandler>
      ) : null}
      <div className="header__nav">
        <nav className="header__nav">
          <ul className="nav__list">
            <li className="nav__item">
              <Margin style={{ marginTop: '19px' }}>
                <GlobalMenuIcon
                  role="button"
                  aria-label="units"
                  tabIndex={0}
                  onClick={toggleMenuOpen}
                />
              </Margin>
            </li>
            {IS_READ_ONLY ? (
              <>
                <li className="nav__item">
                  <NavLink to={Paths.Dispatcher} activeClassName="active">
                    Dispatcher
                  </NavLink>
                </li>
                <li className="nav__item">
                  <NavLink to={Paths.InventoryBoard} activeClassName="active">
                    Inventory Board
                  </NavLink>
                </li>
              </>
            ) : (
              navigations.map((item) => (
                <li className="nav__item" key={item.id}>
                  <NavLink to={item.href} activeClassName="active">
                    {item.title}
                  </NavLink>
                </li>
              ))
            )}
          </ul>
        </nav>
      </div>
      <div className="header__right">
        {IS_READ_ONLY ? null : props.children}
        <div className="header__column--userbar">
          <div className="header__userbar">
            {currentUser.username ? (
              <p>
                Login as
                <span className="userbar__username">{` ${currentUser.username} `}</span>
              </p>
            ) : null}
          </div>
          <Dropdown className="dropdown--filter">
            <DropdownTrigger>
              <button className="header__menuBtn" type="button" />
            </DropdownTrigger>
            <DropdownContent className="menu">
              <ul className="menu-list">
                {IS_READ_ONLY
                  ? null
                  : sideNavigation.map((item) => (
                      <li className="menu-item" key={item.id}>
                        <Link to={item.href}>{item.title}</Link>
                      </li>
                    ))}
                <li className="menu-item">
                  <a data-name="logout" onClick={logOut}>
                    Logout
                  </a>
                </li>
              </ul>
            </DropdownContent>
          </Dropdown>
        </div>
      </div>
    </header>
  );
};

Header.propTypes = {
  user: PropTypes.object,
  children: PropTypes.node,
};
const mapStateToProps = (state) => ({
  user: selectCurrentUser(state),
});

const mapDispatchToProps = (dispatch) => ({
  sessionLogout: () => dispatch(sessionLogout()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Header);
