/* eslint-disable import/no-named-as-default */
/* eslint-disable react/prop-types, camelcase */
import { connect } from 'react-redux';

import { Switch, Route, NavLink, Link, withRouter, useParams } from 'react-router-dom';
import { Paths } from '@root/routes/routing';
import { pathToUrl } from '@root/helpers/pathToUrl';
import { selectCurrentUser } from '@root/state/modules/session';
import { Wrapper, Header } from '@root/components/Layout';
import WorkOrdersHomeContainer from './WorkOrdersHome/WorkOrdersHomeContainer';
import WorkOrdersExport from './WorkOrdersExport';
import CreateWorkOrder from './CreateWorkOrder';
import EditWorkOrder from './EditWorkOrder';
import WorkOrderTableContainer from './WorkOrderTable';
import SuspendWorkOrder from './SuspendWorkOrder/SuspendWorkOrder';

function WorkOrdersRoutes({ location, user }) {
  const IS_READ_ONLY = user.roleId === 4;
  const { businessUnit } = useParams();
  return (
    <Wrapper>
      <Header>
        <div className="header__column--switcher">
          <div className="switcher">
            <h6 className="switcher-label">View as</h6>
            <div className="switcher-body">
              <ul className="switcher-optionsList">
                <li className="switcher-option">
                  <NavLink
                    to={pathToUrl(Paths.WorkOrders, { businessUnit })}
                    activeClassName="active"
                  >
                    Map
                  </NavLink>
                </li>
                <li className="switcher-option">
                  <NavLink
                    to={pathToUrl(Paths.WorkOrdersTable, { businessUnit })}
                    activeClassName="active"
                  >
                    Table
                  </NavLink>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="header__column--actions">
          {IS_READ_ONLY ? null : (
            <Link
              className="button button__primary button__lrg"
              to={{
                pathname: location.pathname.includes('map')
                  ? pathToUrl(`${Paths.WorkOrders}/create`, {
                      businessUnit,
                    })
                  : pathToUrl(`${Paths.WorkOrdersTable}/create`, {
                      businessUnit,
                    }),
                state: { modal: true },
              }}
            >
              Create work order
            </Link>
          )}
        </div>
      </Header>
      <Switch location={location}>
        <Route path={Paths.WorkOrders} component={WorkOrdersHomeContainer} />
        <Route path={`${Paths.Work}/workorders`} component={WorkOrdersExport} exact />
        <Route path={`${Paths.WorkOrders}/create`} component={CreateWorkOrder} exact />
        <Route path={Paths.WorkOrdersTable} component={WorkOrderTableContainer} />
        <Route path={`${Paths.WorkOrdersTable}/create`} component={CreateWorkOrder} exact />
        <Route
          path={`${Paths.WorkOrdersTable}/:action/:workOrderId`}
          component={EditWorkOrder}
          exact
        />
      </Switch>

      <Route path={`${Paths.WorkOrdersTable}/export`} component={WorkOrdersExport} exact />
      <Route path={`${Paths.Work}/export`} component={WorkOrdersExport} exact />
      <Route path={`${Paths.WorkOrders}/export`} component={CreateWorkOrder} exact />
      <Route path={`${Paths.WorkOrdersTable}/create`} component={CreateWorkOrder} exact />
      <Route path={`${Paths.WorkOrders}/create`} component={CreateWorkOrder} exact />
      <Route
        path={`${Paths.WorkOrdersTable}/:action/:workOrderId`}
        component={EditWorkOrder}
        exact
      />
      <Route path={`${Paths.WorkOrders}/:action/:workOrderId`} component={EditWorkOrder} exact />
      <Route
        path={`${Paths.WorkOrders}/suspend/:woaction/:step/:driverId/:workOrderId`}
        component={SuspendWorkOrder}
      />
      <Route
        path={`${Paths.WorkOrdersTable}/suspend/:woaction/:step/:driverId/:workOrderId`}
        component={SuspendWorkOrder}
      />
    </Wrapper>
  );
}

const mapStateToProps = (state) => ({
  user: selectCurrentUser(state),
});

export default withRouter(connect(mapStateToProps)(WorkOrdersRoutes));
