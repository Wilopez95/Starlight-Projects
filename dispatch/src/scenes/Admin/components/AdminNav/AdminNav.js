/* eslint-disable react/prop-types */
import { withRouter, NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { Paths } from '@root/routes/routing';

const Sidebar = styled.aside`
  flex: 0 0 12em;
  order: -1;
`;
const AdminNavWrapper = styled.nav`
  display: inline-block;
  padding: 20px 20px 6px 20px;
  background: rgba(215, 215, 215, 0.43);
  border-radius: 3px;
  width: 170px;
  position: fixed;
  top: 100px;
  left: 20px;

  li {
    font-size: 14px;
    color: #000;
    margin-bottom: 10px;
    a {
      color: #4a90e2;
    }
    a.active {
      font-weight: 700;
      text-decoration: none;
      color: #000;
      cursor: default;
    }
  }
`;
const AdminNav = (props) =>
  props.location.pathname.includes('inventory-board') ? null : (
    <Sidebar>
      <AdminNavWrapper>
        <ul className="nav-list">
          <li className="nav-item">
            <NavLink to={Paths.Materials} activeClassName="active">
              Materials
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to={Paths.Sizes} activeClassName="active">
              Sizes
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to={Paths.Waypoints} activeClassName="active">
              Waypoints
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to={Paths.MapSettings} activeClassName="active">
              Map Settings
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to={Paths.DriverAapSettings} activeClassName="active">
              Driver Settings
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to={Paths.Documents} activeClassName="active">
              Documents
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to={Paths.Templates} activeClassName="active">
              Templates
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to={Paths.Trips} activeClassName="active">
              Trips
              {/* Trips/Timecards */}
            </NavLink>
          </li>
        </ul>
      </AdminNavWrapper>
    </Sidebar>
  );

export default withRouter(AdminNav);
