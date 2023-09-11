import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { NavLink, Route } from 'react-router-dom';
import cx from 'classnames';
import FormEditCanMove from '@root/forms/EditCanMove';
import FormEditCanPickUp from '@root/forms/EditCanPickup';
import FormEditCanDropOff from '@root/forms/EditCanDropoff';
import FormEditCanTransfer from '@root/forms/EditCanTransfer';
import { pathToUrl } from '@root/helpers/pathToUrl';
import { Paths } from '@root/routes/routing';

class EditCanActions extends PureComponent {
  static propTypes = {
    can: PropTypes.object,
    children: PropTypes.object,
    onDismiss: PropTypes.func,
    onSuccessSubmit: PropTypes.func,
    routes: PropTypes.array,
    onSubmitTransferCan: PropTypes.func,
    onSubmitPickUpCan: PropTypes.func,
    onSubmitDropOffCan: PropTypes.func,
    onSubmitMoveCan: PropTypes.func,
    setting: PropTypes.object,
    trucks: PropTypes.array,
    truckOpts: PropTypes.array,
    waypoints: PropTypes.array,
    match: PropTypes.object,
  };

  static defaultProps = {
    onDismiss: () => {},
    onSuccessSubmit: () => {},
  };

  handleTransferCanSubmit = (id, truck) => {
    this.props.onSubmitTransferCan(id, truck);
  };

  handlePickUpCanSubmit = (id, truck) => {
    this.props.onSubmitPickUpCan(id, truck);
  };

  handleDropOffCanSubmit = (id, truck) => {
    this.props.onSubmitDropOffCan(id, truck);
  };

  handleMoveCanSubmit = (id, truck) => {
    this.props.onSubmitMoveCan(id, truck);
  };

  handleDismiss = () => {
    this.props.onDismiss();
  };

  handleOnSubmit = () => {
    this.props.onSuccessSubmit();
  };

  renderChildren() {
    const { can } = this.props;
    return (
      <>
        <Route
          path={`${Paths.InventoryEditItem}/move`}
          render={(props) => (
            <FormEditCanMove
              can={can}
              setting={this.props.setting}
              onDismiss={this.handleDismiss}
              onSuccessSubmit={this.handleOnSubmit}
              onMoveCan={this.handleMoveCanSubmit}
              trucks={this.props.trucks}
              truckOpts={this.props.truckOpts}
              locations={this.props.waypoints}
              {...props}
            />
          )}
        />
        <Route
          path={`${Paths.InventoryEditItem}/dropoff`}
          render={(props) => (
            <FormEditCanDropOff
              can={can}
              onDropOffCan={this.handleDropOffCanSubmit}
              onDismiss={this.handleDismiss}
              onSuccessSubmit={this.handleOnSubmit}
              setting={this.props.setting}
              trucks={this.props.trucks}
              truckOpts={this.props.truckOpts}
              locations={this.props.waypoints}
              {...props}
            />
          )}
        />
        <Route
          path={`${Paths.InventoryEditItem}/pickup`}
          render={(props) => (
            <FormEditCanPickUp
              can={can}
              trucks={this.props.trucks}
              truckOpts={this.props.truckOpts}
              onPickUpCan={this.handlePickUpCanSubmit}
              onDismiss={this.handleDismiss}
              onSuccessSubmit={this.handleOnSubmit}
              setting={this.props.setting}
              {...props}
            />
          )}
        />
        <Route
          path={`${Paths.InventoryEditItem}/transfer`}
          render={(props) => (
            <FormEditCanTransfer
              can={can}
              trucks={this.props.trucks}
              truckOpts={this.props.truckOpts}
              onTransferCan={this.handleTransferCanSubmit}
              onDismiss={this.handleDismiss}
              onSuccessSubmit={this.handleOnSubmit}
              setting={this.props.setting}
              {...props}
            />
          )}
        />
      </>
    );
  }

  render() {
    const canOnTruck = this.props.can.location.type === 'TRUCK';
    const canId = this.props.can.id;
    const canStaged = this.props.can.inUse === 1;

    return (
      <div id="editCan-actions">
        <nav className="editCan-actions-nav">
          <div className="btn-group">
            <NavLink
              to={{
                pathname: pathToUrl(`${Paths.InventoryEditItem}/move`, {
                  businessUnit: this.props.match.params.businessUnit,
                  canId,
                }),
              }}
              activeClassName="active"
              disabled={canStaged || canOnTruck}
              className={cx('btn btn__primary btn-edit-can-actions', {
                disabled: canOnTruck || canStaged,
              })}
            >
              Move
            </NavLink>

            <NavLink
              to={{
                pathname: pathToUrl(`${Paths.InventoryEditItem}/pickup`, {
                  businessUnit: this.props.match.params.businessUnit,
                  canId,
                }),
              }}
              disabled={canStaged || canOnTruck}
              activeClassName="active"
              className={cx('btn btn__primary btn-edit-can-actions', {
                disabled: canOnTruck || canStaged,
              })}
            >
              Pick Up
            </NavLink>

            <NavLink
              to={{
                pathname: pathToUrl(`${Paths.InventoryEditItem}/dropoff`, {
                  businessUnit: this.props.match.params.businessUnit,
                  canId,
                }),
                state: { modal: true },
              }}
              disabled={canStaged || !canOnTruck}
              activeClassName="active"
              className={cx('btn btn__primary btn-edit-can-actions', {
                disabled: !canOnTruck || canStaged,
              })}
            >
              Drop Off
            </NavLink>

            <NavLink
              to={{
                pathname: pathToUrl(`${Paths.InventoryEditItem}/transfer`, {
                  businessUnit: this.props.match.params.businessUnit,
                  canId,
                }),
              }}
              disabled={canStaged || !canOnTruck}
              activeClassName="active"
              className={cx('btn btn__primary btn-edit-can-actions', {
                disabled: !canOnTruck || canStaged,
              })}
            >
              Transfer
            </NavLink>
          </div>
        </nav>
        {canStaged
          ? `This can appears to be staged. To free this can up for use, finish the resume
        work order process.`
          : null}
        {this.renderChildren()}
      </div>
    );
  }
}

export default EditCanActions;
